<template>
  <div class="game">
    <div class="game-container">
      <!-- 遊戲區域 -->
      <div class="game-area" ref="gameArea">
        <!-- <img src="@/assets/challenge.png" alt="challenge" class="challenge-img absolute-img">
        <img src="@/assets/head.png" alt="head" class="head-img absolute-img">
        <img src="@/assets/strawberry.png" alt="strawberry" class="strawberry-img absolute-img">
        <img src="@/assets/grape1.png" alt="grape" class="grape1-img absolute-img">
        <img src="@/assets/grape2.png" alt="grape" class="grape2-img absolute-img">
        <img src="@/assets/star.png" alt="star" class="star-img absolute-img"> -->

        <!-- SVG 路徑 -->
        <svg class="line-svg" :viewBox="levelConfig.viewBox" ref="svgElement">
          <!-- 動態路徑，根據關卡顯示不同路徑 -->
          <path 
            v-for="(path, index) in levelConfig.paths"
            :key="index"
            :d="path.d"
            stroke="#bfbfbf" 
            stroke-width="10" 
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            :class="path.class"
          />
          
          <!-- 終點區域 -->
          <rect 
            :x="levelConfig.endZone.x" 
            :y="levelConfig.endZone.y" 
            :width="levelConfig.endZone.width" 
            :height="levelConfig.endZone.height" 
            fill="rgba(255,107,107,0.3)" 
            stroke="#ff6b6b" 
            stroke-width="4"
            class="end-zone"
          />
          
          <!-- 玩家元件（可拖動的草莓糖果） -->
          <image 
            :x="playerPosition.x - 25" 
            :y="playerPosition.y - 25" 
            width="50"
            height="50"
            :href="candyImage"
            class="player"
            :class="{ 'shaking': isShaking, 'dragging': isMouseDown }"
          />
          
          <!-- 閃電效果 -->
          <image 
            v-if="showLightning"
            :x="lightningPosition.x - 60" 
            :y="lightningPosition.y - 60" 
            width="120"
            height="120"
            :href="lightningImage"
            class="lightning-effect"
          />
          
          <!-- 調試用：顯示碰撞檢測範圍 -->
          <circle 
            v-if="gameState === 'playing'"
            :cx="playerPosition.x" 
            :cy="playerPosition.y" 
            r="32.5" 
            fill="none" 
            stroke="rgba(255,0,0,0.5)" 
            stroke-width="2"
            class="debug-circle"
          />
        </svg>
      </div>


      <!-- 遊戲結束畫面 -->
      <div v-if="gameState === 'gameOver'" class="game-over">
        <h2>遊戲結束！</h2>
        <p>你的得分: {{ score }}</p>
        <p v-if="score === bestScore" class="new-record">🎉 新紀錄！</p>
      </div>

      <!-- 完成畫面 -->
      <div v-if="gameState === 'completed'" class="completed">
        <h2>🎉 完成！</h2>
        <p>恭喜你成功將草莓糖果拖到終點！</p>
        <p>你的得分: {{ score }}</p>
        <p v-if="score === bestScore" class="new-record">🏆 新紀錄！</p>
        <div class="completed-actions">
          <button @click="restartGame" class="restart-btn">再玩一次</button>
          <router-link to="/" class="home-btn">回到首頁</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import candyStrawberry from '../assets/candy_strawberry.png'
import candyGrape from '../assets/candy_grape.png'
import lightningImage from '../assets/lightning.png'
import bgmSound from '../assets/mp3/bgm.mp3'
import successSound from '../assets/mp3/success.mp3'
import collisionSound from '../assets/mp3/collision.mp3'
import failSound from '../assets/mp3/fail.mp3'

export default {
  name: 'Game',
  data() {
    return {
      gameState: 'playing', // ready, playing, gameOver, completed
      score: 0,
      bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
      playerPosition: { x: 312, y: 80 }, // 起點位置 (將在mounted時根據關卡更新)
      isShaking: false,
      gameArea: null,
      svgElement: null,
      pathElements: [],
      isMouseDown: false,
      gameStartTime: null,
      scoreInterval: null,
      candyImage: candyStrawberry,
      lightningImage: lightningImage,
      // 從路由參數獲取的值
      selectedCandy: null,
      selectedLevel: null,
      // 音效相關
      audioContext: null,
      bgmAudio: null,
      successAudio: null,
      collisionAudio: null,
      failAudio: null,
      bgmInitialized: false, // 防止BGM重複初始化
      // 拖動優化
      animationFrameId: null,
      pendingPosition: null,
      // 閃電效果
      showLightning: false,
      lightningPosition: { x: 0, y: 0 },
      // 性能優化
      cachedRect: null,
      lastMoveTime: 0,
      lastCollisionCheck: 0
    }
  },
  computed: {
    // 根據關卡返回對應的SVG配置
    levelConfig() {
      if (this.selectedLevel === 'b') {
        return {
          viewBox: "0 0 1216 1772",
          paths: [
            {
              d: "M526.55-.45h372.66c.3,0,.6,0,.89,0,83.76.82,151.65,69.22,151.65,153.17v379.09c0,84.47-68.72,153.18-153.18,153.18s-153.18-68.72-153.18-153.18c0-2.78.22-5.5.64-8.16v-172.9c-.42-2.66-.64-5.38-.64-8.16,0-27.68-22.52-50.2-50.2-50.2s-50.2,22.52-50.2,50.2c0,2.77-.22,5.5-.64,8.16v181.07c0,3.41-.33,6.74-.96,9.97-5.16,79.83-71.75,143.21-152.86,143.21s-147.71-63.38-152.86-143.21c-.63-3.23-.96-6.56-.96-9.97v-181.07c-.42-2.66-.64-5.38-.64-8.16,0-27.68-22.52-50.2-50.2-50.2s-50.2,22.52-50.2,50.2c0,2.77-.22,5.5-.64,8.16v387.26c.42,2.66.64,5.38.64,8.13,0,27.68,22.52,50.2,50.2,50.2h706.29c2.66-.42,5.38-.64,8.13-.64",
              class: "path-1"
            },
            {
              d: "M1006.29,899.05c-1.78.19-3.58.28-5.4.28H285.19c-.3,0-.6,0-.89,0-80.11-.79-145.7-63.39-151.26-142.29-.68-3.33-1.03-6.76-1.03-10.24v-413.21c0-5.91,1-11.59,2.83-16.88,12.34-72.18,75.35-127.29,150.99-127.29s138.66,55.11,150.99,127.29c1.84,5.29,2.83,10.97,2.83,16.88v190.07c.42,2.66.64,5.38.64,8.16,0,27.68,22.52,50.2,50.2,50.2s50.2-22.52,50.2-50.2c0-2.78.22-5.5.64-8.16v-190.07c0-5.91,1-11.59,2.83-16.88,12.34-72.18,75.35-127.29,150.99-127.29s138.66,55.11,150.99,127.29c1.84,5.29,2.83,10.97,2.83,16.88v198.24c0,1.94-.11,3.86-.32,5.74,2.86,24.99,24.14,44.46,49.88,44.46,27.68,0,50.2-22.52,50.2-50.2V152.73c0-27.68-22.52-50.2-50.2-50.2h-372.01",
              class: "path-2"
            },
            {
              d: "M486.1,897.87c.29,0,.59,0,.88,0h515.05c61.85,0,112.16,50.32,112.16,112.16s-50.32,112.16-112.16,112.16c0,0-323.09,0-437.67,0l-2.85-3.17c-55.42-80.82-148.43-133.84-253.83-133.84-169.86,0-307.55,137.7-307.55,307.55s137.7,307.55,307.55,307.55c90.52,0,171.91-39.11,228.19-101.35l9.59-5.54c90.77,0,344.41,0,344.41,0,29.14,0,52.84,23.7,52.84,52.84,0,29.14-23.7,52.84-52.84,52.84-2.88,0-5.74.23-8.54.68h-290.2c-29.93,0-54.19,24.26-54.19,54.19v118.49",
              class: "path-3"
            },
            {
              d: "M645.32,1772.45v-64.29s243.88,0,243.88,0c3.41,0,6.79-.32,10.1-.95,84.53-4.9,151.8-75.22,151.8-160.96,0-88.9-72.33-161.23-161.23-161.23,0,0-315.45,0-397.25,0l-10.95,3.33c-33.77,61.33-99.03,102.88-173.99,102.88-109.62,0-198.49-88.87-198.49-198.49s88.87-198.49,198.49-198.49c82.79,0,153.74,50.68,183.51,122.71l7.44,6.9c142.63,0,503.4,0,503.4,0,117.91,0,213.84-95.93,213.84-213.84,0-117.91-95.93-213.84-213.84-213.84H487.62",
              class: "path-4"
            }
          ],
          startPosition: { x: 526, y: 50 },
          endZone: { x: 565, y: 1708, width: 60, height: 60 },
          svgWidth: 1216,
          svgHeight: 1772
        }
      } else {
        // 默認關卡 A
        return {
          viewBox: "0 0 1156 1846.25",
          paths: [
            {
              d: "M312.52,29.94h512.47c.29,0,.59,0,.88,0,82.27.81,148.94,67.99,148.94,150.45s-66.67,149.64-148.94,150.45c-.29,0-.58,0-.88,0H312.95c-32.42,0-58.79,26.37-58.79,58.79s26.37,58.79,58.79,58.79h512.05c.29,0,.59,0,.88,0,82.27.81,148.94,67.99,148.94,150.45s-66.67,149.64-148.94,150.45c-.29,0-.58,0-.88,0H312.63c-61.52,0-111.58,50.05-111.58,111.58s50.05,111.58,111.58,111.58h217.51l8.37-7.03c60.96-88.9,163.28-147.22,279.22-147.22,186.85,0,338.31,151.47,338.31,338.31s-151.47,338.31-338.31,338.31c-99.58,0-189.1-43.02-251.01-111.49l-10.55-6.09H177.31c-32.05,0-58.12,26.07-58.12,58.12s26.07,58.12,58.12,58.12c3.17,0,6.31.25,9.4.75h319.23c32.92,0,59.61,26.69,59.61,59.61v277.15",
              class: "path-1"
            },
            {
              d: "M446.32,1831.06v-217.54H178.06c-3.76,0-7.47-.35-11.11-1.05C73.96,1607.09-.04,1529.73-.04,1435.42s79.56-177.35,177.35-177.35h436.98l12.05,3.66c37.15,67.46,108.93,113.17,191.39,113.17,120.59,0,218.34-97.75,218.34-218.34s-97.75-218.34-218.34-218.34c-91.07,0-169.11,55.75-201.86,134.99l-303.23.43c-117.29,0-212.72-95.43-212.72-212.72s95.43-212.72,212.72-212.72h511.73c27.19,0,49.31-22.12,49.31-49.31s-22.12-49.31-49.31-49.31h-511.41c-88.19,0-159.94-71.75-159.94-159.94s71.75-159.94,159.94-159.94h511.41c27.19,0,49.31-22.12,49.31-49.31s-22.12-49.31-49.31-49.31h-511.84",
              class: "path-2"
            }
          ],
          startPosition: { x: 312, y: 80 },
          endZone: { x: 475, y: 1800, width: 60, height: 60 },
          svgWidth: 1156,
          svgHeight: 1846.25
        }
      }
    }
  },
  created() {
    // 從路由查詢參數獲取 candy 和 level 值
    this.selectedCandy = this.$route.query.candy || '1';
    this.selectedLevel = this.$route.query.level || 'a';
    
    // 根據選擇的糖果設置圖片
    this.setCandyImage();

  },
  mounted() {
    this.gameArea = this.$refs.gameArea;
    this.svgElement = this.$refs.svgElement;
    this.setupEventListeners();
    this.initializePaths();
    this.initializeAudio();
    
    // 根據關卡設置初始位置
    this.playerPosition = { ...this.levelConfig.startPosition };
    
    this.startGame();
    
    // 添加窗口大小變化監聽
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.removeEventListeners();
    if (this.scoreInterval) {
      clearInterval(this.scoreInterval);
    }
    // 清理動畫幀
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // 停止BGM
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
    // 清理窗口大小變化監聽
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    setCandyImage() {
      // 根據選擇的糖果設置對應的圖片
      if (this.selectedCandy === '1') {
        this.candyImage = candyGrape;
      } else if (this.selectedCandy === '2') {
        this.candyImage = candyStrawberry;
      } else {
        // 默認使用草莓糖果
        this.candyImage = candyStrawberry;
      }
    },
  
    
    setupEventListeners() {
      // 滑鼠事件 - 優化配置
      this.gameArea.addEventListener('mousedown', this.handleStart, { passive: false });
      this.gameArea.addEventListener('mousemove', this.handleMove, { passive: false });
      this.gameArea.addEventListener('mouseup', this.handleEnd, { passive: false });
      this.gameArea.addEventListener('mouseleave', this.handleEnd, { passive: false });
      
      // 觸控事件
      this.gameArea.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.gameArea.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.gameArea.addEventListener('touchend', this.handleEnd, { passive: false });
      
      // BGM 已在遊戲開始時播放，不需要在移動時重複觸發
      
      // 防止右鍵選單
      this.gameArea.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    removeEventListeners() {
      this.gameArea.removeEventListener('mousedown', this.handleStart);
      this.gameArea.removeEventListener('mousemove', this.handleMove);
      this.gameArea.removeEventListener('mouseup', this.handleEnd);
      this.gameArea.removeEventListener('mouseleave', this.handleEnd);
      this.gameArea.removeEventListener('touchstart', this.handleTouchStart);
      this.gameArea.removeEventListener('touchmove', this.handleTouchMove);
      this.gameArea.removeEventListener('touchend', this.handleEnd);
    },
    
    initializePaths() {
      // 獲取路徑元素
      this.pathElements = this.svgElement.querySelectorAll('path');
    },
    
    initializeAudio() {
      // 初始化音效
      try {
        this.bgmAudio = new Audio(bgmSound);
        this.successAudio = new Audio(successSound);
        this.collisionAudio = new Audio(collisionSound);
        this.failAudio = new Audio(failSound);
        
        // 設置BGM屬性
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.3; // BGM音量較低
        
        // 設置音效屬性
        [this.successAudio, this.collisionAudio, this.failAudio].forEach(audio => {
          audio.preload = 'auto';
          audio.volume = 0.7; // 設置音量
        });
        
        // 標記BGM已初始化
        this.bgmInitialized = true;
        
        // 嘗試播放BGM
        this.playBGM();
      } catch (error) {
        console.warn('音效初始化失敗:', error);
      }
    },
    
    enableBGM() {
      if (this.bgmAudio && this.bgmAudio.paused && this.bgmInitialized) {
        this.bgmAudio.play().catch(() => {});
      }
    },
    
    playBGM() {
      if (this.bgmAudio) {
        // 確保只有一個BGM實例在播放
        if (!this.bgmAudio.paused) {
          console.log('BGM 已經在播放中，跳過重複播放');
          return;
        }
        
        try {
          this.bgmAudio.play().then(() => {
            console.log('Game BGM 播放成功');
          }).catch(error => {
            console.warn('Game BGM 播放失敗:', error);
            // 如果自動播放失敗，在用戶第一次交互時重試
            this.retryBGMOnInteraction();
          });
        } catch (error) {
          console.warn('Game BGM 播放錯誤:', error);
        }
      }
    },
    
    retryBGMOnInteraction() {
      // 在用戶第一次交互時重試播放BGM
      const enableBGM = () => {
        if (this.bgmAudio && this.bgmAudio.paused && this.bgmInitialized) {
          this.bgmAudio.play().catch(() => {});
        }
      };
      
      // 監聽所有可能的交互事件，使用 once: true 確保只觸發一次
      this.gameArea.addEventListener('click', enableBGM, { once: true });
      this.gameArea.addEventListener('touchstart', enableBGM, { once: true });
      this.gameArea.addEventListener('mousedown', enableBGM, { once: true });
    },
    
    playSound(audio) {
      if (audio) {
        try {
          audio.currentTime = 0; // 重置播放位置
          audio.play().catch(error => {
            console.warn('音效播放失敗:', error);
          });
        } catch (error) {
          console.warn('音效播放錯誤:', error);
        }
      }
    },
    
    startGame() {
      this.gameState = 'playing';
      this.score = 0;
      this.playerPosition = { ...this.levelConfig.startPosition };
      this.gameStartTime = Date.now();
      this.showLightning = false; // 重置閃電效果
      
      // 根據關卡調整遊戲難度
      this.adjustGameDifficulty();
      
      // 開始計分
      this.scoreInterval = setInterval(() => {
        if (this.gameState === 'playing') {
          this.score += 1;
        }
      }, 100);
    },
    
    adjustGameDifficulty() {
      // 根據關卡調整遊戲難度
      // 根據遊戲區域大小動態調整參數
      this.adjustGameParameters();
    },
    
    adjustGameParameters() {
      // 根據遊戲區域大小動態調整遊戲參數
      const gameAreaWidth = this.gameArea ? this.gameArea.offsetWidth : 700;
      const gameAreaHeight = this.gameArea ? this.gameArea.offsetHeight : window.innerHeight * 0.9;
      
      console.log('遊戲區域實際尺寸:', gameAreaWidth, 'x', gameAreaHeight);
      
      // 可以根據需要調整其他參數
      // 例如：根據區域大小調整拖拽靈敏度等
    },
    
    handleResize() {
      // 處理窗口大小變化
      if (this.gameArea) {
        this.adjustGameParameters();
      }
    },
    
    restartGame() {
      this.gameState = 'playing';
      this.playerPosition = { ...this.levelConfig.startPosition };
      this.isShaking = false;
      this.showLightning = false; // 重置閃電效果
      if (this.scoreInterval) {
        clearInterval(this.scoreInterval);
      }
      this.startGame();
    },
    
    handleStart(e) {
      if (this.gameState !== 'playing') return;
      
      // 使用統一的座標轉換方法
      const { x, y } = this.convertToSVGCoordinates(e);
      
      // 根據遊戲區域大小動態調整容錯範圍
      const baseTolerance = 80; // 基礎容錯範圍
      const tolerance = baseTolerance; // 保持適中的容錯範圍
      
      const isOnPlayer = Math.abs(x - this.playerPosition.x) <= tolerance && 
                        Math.abs(y - this.playerPosition.y) <= tolerance;
      
      console.log('=== 拖動檢測 ===');
      console.log('點擊位置:', x, y);
      console.log('玩家位置:', this.playerPosition.x, this.playerPosition.y);
      console.log('距離:', Math.abs(x - this.playerPosition.x), Math.abs(y - this.playerPosition.y));
      console.log('容錯範圍:', tolerance);
      console.log('可抓取:', isOnPlayer);
      
      // 如果正常檢測失敗，嘗試更寬鬆的檢測
      if (!isOnPlayer) {
        const looseTolerance = 120; // 適度調整寬鬆檢測範圍
        const isOnPlayerLoose = Math.abs(x - this.playerPosition.x) <= looseTolerance && 
                              Math.abs(y - this.playerPosition.y) <= looseTolerance;
        console.log('寬鬆檢測 (容錯:', looseTolerance, '):', isOnPlayerLoose);
        
        if (!isOnPlayerLoose) {
          console.log('=== 拖動檢測失敗 ===');
          return;
        }
        console.log('使用寬鬆檢測成功');
      }
      
      e.preventDefault();
      this.isMouseDown = true;
      console.log('開始拖動玩家元件');
    },
    
    handleTouchStart(e) {
      if (this.gameState !== 'playing') return;
      
      const touch = e.touches[0];
      // 使用統一的座標轉換方法
      const { x, y } = this.convertToSVGCoordinates(touch);
      
      // 使用更大的容錯範圍來確保可以抓取
      const tolerance = 100; // 進一步增加容錯範圍
      
      const isOnPlayer = Math.abs(x - this.playerPosition.x) <= tolerance && 
                        Math.abs(y - this.playerPosition.y) <= tolerance;
      
      console.log('=== 觸摸檢測 ===');
      console.log('觸摸位置:', x, y);
      console.log('玩家位置:', this.playerPosition.x, this.playerPosition.y);
      console.log('距離:', Math.abs(x - this.playerPosition.x), Math.abs(y - this.playerPosition.y));
      console.log('容錯範圍:', tolerance);
      console.log('可抓取:', isOnPlayer);
      
      // 如果正常檢測失敗，嘗試更寬鬆的檢測
      if (!isOnPlayer) {
        const looseTolerance = 120; // 適度調整寬鬆檢測範圍
        const isOnPlayerLoose = Math.abs(x - this.playerPosition.x) <= looseTolerance && 
                              Math.abs(y - this.playerPosition.y) <= looseTolerance;
        console.log('寬鬆檢測 (容錯:', looseTolerance, '):', isOnPlayerLoose);
        
        if (!isOnPlayerLoose) {
          console.log('=== 觸摸檢測失敗 ===');
          return;
        }
        console.log('使用寬鬆檢測成功');
      }
      
      e.preventDefault();
      this.isMouseDown = true;
    },
    
    handleMove(e) {
      if (!this.isMouseDown || this.gameState !== 'playing') return;
      e.preventDefault();
      this.updatePlayerPosition(e);
    },
    
    handleTouchMove(e) {
      if (!this.isMouseDown || this.gameState !== 'playing') return;
      e.preventDefault();
      const touch = e.touches[0];
      this.updatePlayerPosition(touch);
    },
    
    handleEnd() {
      this.isMouseDown = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.pendingPosition = null;
    },
    
    // 統一的座標轉換方法
    convertToSVGCoordinates(e) {
      const svgRect = this.svgElement.getBoundingClientRect();
      
      console.log('=== 座標轉換調試 ===');
      console.log('滑鼠位置:', e.clientX, e.clientY);
      console.log('SVG位置:', svgRect.left, svgRect.top);
      console.log('SVG大小:', svgRect.width, svgRect.height);
      console.log('遊戲區域尺寸: 700px x 90vh');
      console.log('SVG尺寸:', this.levelConfig.svgWidth, 'x', this.levelConfig.svgHeight);
      
      // 計算相對於SVG的位置
      const relativeX = (e.clientX - svgRect.left) / svgRect.width;
      const relativeY = (e.clientY - svgRect.top) / svgRect.height;
      
      console.log('相對位置:', relativeX, relativeY);
      
      // 轉換為 SVG 座標系統，使用動態的SVG尺寸
      // 使用更精確的計算，考慮SVG的實際縮放比例
      const scaleX = this.levelConfig.svgWidth / svgRect.width;
      const scaleY = this.levelConfig.svgHeight / svgRect.height;
      
      const x = (e.clientX - svgRect.left) * scaleX;
      const y = (e.clientY - svgRect.top) * scaleY;
      
      console.log('縮放比例:', scaleX, scaleY);
      console.log('SVG座標:', x, y);
      console.log('玩家位置:', this.playerPosition.x, this.playerPosition.y);
      console.log('距離:', Math.abs(x - this.playerPosition.x), Math.abs(y - this.playerPosition.y));
      console.log('==================');
      
      return { x, y };
    },
    
    updatePlayerPosition(e) {
      // 使用統一的座標轉換方法
      const { x, y } = this.convertToSVGCoordinates(e);
      
      // 限制在 SVG 範圍內
      const clampedX = Math.max(0, Math.min(this.levelConfig.svgWidth, x));
      const clampedY = Math.max(0, Math.min(this.levelConfig.svgHeight, y));
      
      // 立即更新位置，提升響應性
      this.playerPosition = { x: clampedX, y: clampedY };
      
      // 減少碰撞檢測頻率：每30ms檢測一次，提高響應性
      const now = Date.now();
      if (now - this.lastCollisionCheck > 30) {
        this.lastCollisionCheck = now;
        
        // 檢查碰撞
        if (this.checkCollision(clampedX, clampedY)) {
          this.handleCollision();
          return;
        }
        
        // 檢查勝利條件
        if (this.checkWinCondition(clampedX, clampedY)) {
          this.winGame();
          return;
        }
      }
    },
    
    checkCollision(x, y) {
      // 碰撞檢測範圍與元件大小一致，根據遊戲區域調整精度
      const blockSize = 50; // 草莓糖果大小
      const pathWidth = 10; // 路徑寬度 (與SVG中的stroke-width一致)
      const tolerance = (blockSize / 2) + (pathWidth / 2) + 5; // 區塊半徑 + 路徑半寬 + 小緩衝
      
      for (let path of this.pathElements) {
        const pathLength = path.getTotalLength();
        const steps = Math.floor(pathLength / 15); // 提高檢測密度以適應更大的遊戲區域
        
        for (let i = 0; i <= steps; i++) {
          const point = path.getPointAtLength((i / steps) * pathLength);
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < tolerance) {
            return true;
          }
        }
      }
      
      return false;
    },
    
    checkWinCondition(x, y) {
      // 檢查是否到達終點矩形區域，使用動態的終點區域配置
      const endX = this.levelConfig.endZone.x + this.levelConfig.endZone.width / 2;
      const endY = this.levelConfig.endZone.y + this.levelConfig.endZone.height / 2;
      const rectWidth = this.levelConfig.endZone.width;
      const rectHeight = this.levelConfig.endZone.height;
      
      // 檢查點是否在矩形內
      return x >= (endX - rectWidth/2) && 
             x <= (endX + rectWidth/2) && 
             y >= (endY - rectHeight/2) && 
             y <= (endY + rectHeight/2);
    },
    
    handleCollision() {
      // 立即停止拖動
      this.isMouseDown = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.pendingPosition = null;
      
      // 設置閃電效果位置
      this.lightningPosition = { x: this.playerPosition.x, y: this.playerPosition.y };
      this.showLightning = true;
      
      // 播放碰撞音效
      this.playSound(this.collisionAudio);
      
      // 閃電效果保持顯示，不再隱藏
      
      // 延遲顯示失敗彈窗並播放失敗音效
      setTimeout(() => {
        this.gameOver();
      }, 1000);
      setTimeout(() => {
        this.playSound(this.failAudio);
      }, 1500); // 300ms 延遲，讓碰撞音效先播放
    },
    
    gameOver() {
      this.gameState = 'gameOver';
      this.isShaking = true;
      this.isMouseDown = false;
      
      if (this.scoreInterval) {
        clearInterval(this.scoreInterval);
      }
      
      // 更新最佳分數
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('bestScore', this.bestScore.toString());
      }
      
      // 停止震動效果
      setTimeout(() => {
        this.isShaking = false;
      }, 500);
    },
    
    winGame() {
      this.gameState = 'completed';
      this.isMouseDown = false;
      
      if (this.scoreInterval) {
        clearInterval(this.scoreInterval);
      }
      
      // 播放成功音效
      this.playSound(this.successAudio);
      
      // 勝利獎勵分數
      this.score += 100;
      
      // 更新最佳分數
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('bestScore', this.bestScore.toString());
      }
    }
  }
}
</script>

<style scoped>
.game {
  width: 100vw;
  height: 100vh;
  background-image: url('../assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  touch-action: none; /* 防止手機上的滾動和縮放 */
  user-select: none; /* 防止文字選取 */
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

.game-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.game-area {
  position: relative;
  width: 100%;
  max-width: 700px;
  height: 90vh;
  /* overflow: hidden; */
}

.line-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.path-1, .path-2, .path-3, .path-4 {
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));
  transition: stroke 0.3s ease;
}

.player {
  filter: drop-shadow(0 0 8px rgba(255,107,107,0.6));
  transition: none; /* 移除過渡動畫提升拖動順暢度 */
  cursor: grab;
  user-select: none;
  pointer-events: none; /* 讓圖片本身不阻擋拖動事件 */
}

.player:active {
  cursor: grabbing;
}

.player.shaking {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, -2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, 2px); }
}

.player.dragging {
  filter: drop-shadow(0 0 12px rgba(255,107,107,0.8));
}

.debug-circle {
  pointer-events: none;
  opacity: 0.5;
}

.lightning-effect {
  pointer-events: none;
  animation: lightning-flash 0.8s ease-out;
  filter: drop-shadow(0 0 10px rgba(255, 255, 0, 0.8));
}

@keyframes lightning-flash {
  0% {
    opacity: 0;
    /* transform: scale(0.5); */
  }
  20% {
    opacity: 1;
    /* transform: scale(1); */
  }
  40% {
    opacity: 0.8;
    /* transform: scale(0.5); */
  }
  100% {
    opacity: 1;
    /* transform: scale(1); */
  }
}

.end-zone {
  filter: drop-shadow(0 0 8px rgba(255,107,107,0.5));
}

.game-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.start-btn, .restart-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.start-btn:hover, .restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

.start-btn:active, .restart-btn:active {
  transform: translateY(0);
}

.instructions {
  color: white;
  text-align: center;
  font-size: 1rem;
  background: rgba(0,0,0,0.3);
  padding: 10px 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  animation: fadeInOut 2s infinite;
  margin-bottom: 10px;
}

.game-info {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.level-info, .candy-info {
  color: white;
  background: rgba(0,0,0,0.5);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  z-index: 20;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.2);
}

.game-over h2 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  color: #ff6b6b;
}

.game-over p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.new-record {
  color: #ffd93d !important;
  font-weight: bold;
  font-size: 1.2rem !important;
}

.completed {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.9);
  color: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  z-index: 20;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(78,205,196,0.5);
  box-shadow: 0 0 30px rgba(78,205,196,0.3);
}

.completed h2 {
  margin: 0 0 20px 0;
  font-size: 2rem;
  color: #4ecdc4;
  text-shadow: 0 0 10px rgba(78,205,196,0.5);
}

.completed p {
  margin: 15px 0;
  font-size: 1.1rem;
}

.completed-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.completed .restart-btn, .home-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  display: inline-block;
}

.home-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.completed .restart-btn:hover, .home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .game-area {
    height: 80vh;
    margin: 20px 0;
  }

  .game-controls {
    bottom: 10px;
  }

  .start-btn, .restart-btn {
    padding: 12px 25px;
    font-size: 1rem;
  }

  .instructions {
    font-size: 0.9rem;
    padding: 8px 15px;
  }

  .game-over {
    padding: 20px;
    margin: 0 20px;
  }

  .game-over h2 {
    font-size: 1.5rem;
  }

  .game-over p {
    font-size: 1rem;
  }

  .completed-actions {
    flex-direction: column;
    align-items: center;
  }

  .completed .restart-btn, .home-btn {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .game-container {
    padding: 10px;
  }

  .game-area {
    max-width: 400px;
    height: 80vh;
  }
}

/* 橫向模式優化 */
@media (orientation: landscape) and (max-height: 600px) {
  .game-area {
    height: 85vh;
    max-height: none;
  }

  .game-controls {
    bottom: 5px;
  }
}

.absolute-img {
  position: absolute;
}
.challenge-img {
  width: 280px;
  top: -20px;
  left: 50px;
}
.head-img {
  width: 100px;
  top: 385px;
  left: 80px;
}
.strawberry-img {
  width: 100px;
  transform: rotate(-30deg);
  top: 190px;
  left: -30px;
}
.grape1-img {
  width: 80px;
  top: 140px;
  left: 320px;
}
.grape2-img {
  width: 80px;
  top: 500px;
  left: -35px;
}
.star-img {
  width: 70px;
  top: 40px;
  left: 320px;
}
</style>
