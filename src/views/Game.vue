<template>
  <div class="game">
    <div class="game-container">
      <!-- 遊戲區域 -->
      <div class="game-area" ref="gameArea">
        <img src="@/assets/challenge.png" alt="challenge" class="challenge-img absolute-img">
        <img src="@/assets/head.png" alt="head" class="head-img absolute-img">
        <img src="@/assets/strawberry.png" alt="strawberry" class="strawberry-img absolute-img">
        <img src="@/assets/grape1.png" alt="grape" class="grape1-img absolute-img">
        <img src="@/assets/grape2.png" alt="grape" class="grape2-img absolute-img">
        <img src="@/assets/star.png" alt="star" class="star-img absolute-img">

        <!-- SVG 路徑 -->
        <svg class="line-svg" viewBox="0 0 760 1283" ref="svgElement">
          <!-- 路徑1 -->
          <path 
            d="M143 8H544.5C561.069 8 574.5 21.4315 574.5 38V319C574.5 335.569 561.069 349 544.5 349H325C308.431 349 295 362.431 295 379V384.5C295 401.069 308.431 414.5 325 414.5H722C738.569 414.5 752 427.931 752 444.5V633C752 649.569 738.569 663 722 663H229.75C181.839 663 143 701.839 143 749.75V749.75C143 797.661 181.839 836.5 229.75 836.5H611C627.569 836.5 641 849.931 641 866.5V1170.5C641 1187.07 627.569 1200.5 611 1200.5H238.5C221.931 1200.5 208.5 1213.93 208.5 1230.5V1275.5" 
            stroke="#999" 
            stroke-width="15" 
            stroke-linecap="round"
            fill="none"
            class="path-1"
          />
          <!-- 路徑2 -->
          <path 
            d="M149 135H423C439.569 135 453 148.431 453 165V197.5C453 214.069 439.569 227.5 423 227.5H193C176.431 227.5 163 240.931 163 257.5V502C163 518.569 176.431 532 193 532H619C624.799 532 629.5 536.701 629.5 542.5V542.5C629.5 548.299 624.799 553 619 553H208C97.543 553 8 643.043 8 753.5V753.5C8 863.957 97.5431 954 208 954H471.5C488.069 954 501.5 967.431 501.5 984V1024C501.5 1040.57 488.069 1054 471.5 1054H73C56.4315 1054 43 1067.43 43 1084V1271" 
            stroke="#999" 
            stroke-width="15" 
            stroke-linecap="round"
            fill="none"
            class="path-2"
          />
          
          <!-- 終點區域 -->
          <rect 
            x="100" 
            y="1240" 
            width="60" 
            height="60" 
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
            r="42.5" 
            fill="none" 
            stroke="rgba(255,0,0,0.5)" 
            stroke-width="2"
            class="debug-circle"
          />
        </svg>
      </div>

      <!-- 遊戲控制 -->
      <div class="game-controls">
        <button 
          v-if="gameState === 'gameOver'" 
          @click="restartGame" 
          class="restart-btn"
        >
          重新開始
        </button>
        <div v-if="gameState === 'playing'" class="instructions">
          拖動草莓糖果從起點到終點，不要碰到路徑！
        </div>
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
import lightningImage from '../assets/lightning.png'
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
      playerPosition: { x: 143, y: 70 }, // 起點位置
      isShaking: false,
      gameArea: null,
      svgElement: null,
      pathElements: [],
      isMouseDown: false,
      gameStartTime: null,
      scoreInterval: null,
      candyImage: candyStrawberry,
      lightningImage: lightningImage,
      // 音效相關
      audioContext: null,
      successAudio: null,
      collisionAudio: null,
      failAudio: null,
      // 拖動優化
      animationFrameId: null,
      pendingPosition: null,
      // 閃電效果
      showLightning: false,
      lightningPosition: { x: 0, y: 0 }
    }
  },
  mounted() {
    this.gameArea = this.$refs.gameArea;
    this.svgElement = this.$refs.svgElement;
    this.setupEventListeners();
    this.initializePaths();
    this.initializeAudio();
    this.startGame();
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
  },
  methods: {
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
        this.successAudio = new Audio(successSound);
        this.collisionAudio = new Audio(collisionSound);
        this.failAudio = new Audio(failSound);
        
        // 設置音效屬性
        [this.successAudio, this.collisionAudio, this.failAudio].forEach(audio => {
          audio.preload = 'auto';
          audio.volume = 0.7; // 設置音量
        });
      } catch (error) {
        console.warn('音效初始化失敗:', error);
      }
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
      this.playerPosition = { x: 143, y: 70 };
      this.gameStartTime = Date.now();
      this.showLightning = false; // 重置閃電效果
      
      // 開始計分
      this.scoreInterval = setInterval(() => {
        if (this.gameState === 'playing') {
          this.score += 1;
        }
      }, 100);
    },
    
    restartGame() {
      this.gameState = 'playing';
      this.playerPosition = { x: 143, y: 70 };
      this.isShaking = false;
      this.showLightning = false; // 重置閃電效果
      if (this.scoreInterval) {
        clearInterval(this.scoreInterval);
      }
      this.startGame();
    },
    
    handleStart(e) {
      if (this.gameState !== 'playing') return;
      
      // 使用SVG的getScreenCTM方法來獲取更精確的座標轉換
      const rect = this.gameArea.getBoundingClientRect();
      const svgRect = this.svgElement.getBoundingClientRect();
      
      // 計算相對於SVG的位置
      const relativeX = (e.clientX - svgRect.left) / svgRect.width;
      const relativeY = (e.clientY - svgRect.top) / svgRect.height;
      const x = relativeX * 760;
      const y = relativeY * 1283;
      
      // 使用更大的容錯範圍來確保可以抓取
      const tolerance = 80; // 進一步增加容錯範圍
      
      const isOnPlayer = Math.abs(x - this.playerPosition.x) <= tolerance && 
                        Math.abs(y - this.playerPosition.y) <= tolerance;
      
      console.log('點擊:', x, y, '玩家:', this.playerPosition.x, this.playerPosition.y, '距離:', Math.abs(x - this.playerPosition.x), Math.abs(y - this.playerPosition.y), '容錯:', tolerance, '可抓取:', isOnPlayer);
      
      if (!isOnPlayer) return;
      
      e.preventDefault();
      this.isMouseDown = true;
      console.log('開始拖動玩家元件');
    },
    
    handleTouchStart(e) {
      if (this.gameState !== 'playing') return;
      
      const touch = e.touches[0];
      // 使用SVG的getScreenCTM方法來獲取更精確的座標轉換
      const rect = this.gameArea.getBoundingClientRect();
      const svgRect = this.svgElement.getBoundingClientRect();
      
      // 計算相對於SVG的位置
      const relativeX = (touch.clientX - svgRect.left) / svgRect.width;
      const relativeY = (touch.clientY - svgRect.top) / svgRect.height;
      const x = relativeX * 760;
      const y = relativeY * 1283;
      
      // 使用更大的容錯範圍來確保可以抓取
      const tolerance = 80; // 進一步增加容錯範圍
      
      const isOnPlayer = Math.abs(x - this.playerPosition.x) <= tolerance && 
                        Math.abs(y - this.playerPosition.y) <= tolerance;
      
      console.log('觸摸:', x, y, '玩家:', this.playerPosition.x, this.playerPosition.y, '距離:', Math.abs(x - this.playerPosition.x), Math.abs(y - this.playerPosition.y), '容錯:', tolerance, '可抓取:', isOnPlayer);
      
      if (!isOnPlayer) return;
      
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
    
    
    updatePlayerPosition(e) {
      // 使用與抓取檢測相同的座標轉換方法
      const rect = this.gameArea.getBoundingClientRect();
      const svgRect = this.svgElement.getBoundingClientRect();
      
      // 計算相對於SVG的位置
      const relativeX = (e.clientX - svgRect.left) / svgRect.width;
      const relativeY = (e.clientY - svgRect.top) / svgRect.height;
      
      // 轉換為 SVG 座標系統
      const x = relativeX * 760;
      const y = relativeY * 1283;
      
      // 限制在 SVG 範圍內
      const clampedX = Math.max(0, Math.min(760, x));
      const clampedY = Math.max(0, Math.min(1283, y));
      
      // 先檢查碰撞，如果碰撞則立即停止拖動
      if (this.checkCollision(clampedX, clampedY)) {
        this.handleCollision();
        return;
      }
      
      // 檢查勝利條件
      if (this.checkWinCondition(clampedX, clampedY)) {
        this.winGame();
        return;
      }
      
      // 只有在沒有碰撞和勝利的情況下才更新位置
      this.playerPosition = { x: clampedX, y: clampedY };
    },
    
    checkCollision(x, y) {
      // 合理的碰撞檢測 - 檢查草莓糖果是否碰到路徑
      const blockSize = 50; // 草莓糖果大小
      const pathWidth = 15; // 路徑寬度
      const tolerance = (blockSize / 2) + (pathWidth / 2) + 5; // 區塊半徑 + 路徑半寬 + 5px緩衝
      
      for (let path of this.pathElements) {
        const pathLength = path.getTotalLength();
        const steps = Math.floor(pathLength / 20); // 適中的檢測密度
        
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
      // 檢查是否到達終點矩形區域
      const endX = 130; // 矩形中心 X
      const endY = 1270; // 矩形中心 Y (對應 y=1240 + 30)
      const rectWidth = 60;
      const rectHeight = 60;
      
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
  background-size: 100%;
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
  max-width: 400px;
  height: 80vh;
  /* overflow: hidden; */
}

.line-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.path-1, .path-2 {
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
