<template>
  <div class="app">
    <div class="game-container">
      <!-- 遊戲區域 -->
      <div class="game-area" ref="gameArea">
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
          <!-- <image 
            :x="playerPosition.x - 15" 
            :y="playerPosition.y - 15" 
            width="30" 
            height="30"
            :href="candyImage"
            class="player"
            :class="{ 'shaking': isShaking, 'dragging': isMouseDown }"
            transform-origin="center"
          /> -->
          
          <!-- 玩家元件（可拖動的黃色區塊） -->
          <rect 
            :x="playerPosition.x - 15" 
            :y="playerPosition.y - 15" 
            width="30" 
            height="30"
            fill="#ffd93d"
            stroke="#ff6b6b"
            stroke-width="2"
            class="player"
            :class="{ 'shaking': isShaking, 'dragging': isMouseDown }"
          />
          
          <!-- 調試用：顯示碰撞檢測範圍 -->
          <circle 
            v-if="gameState === 'playing'"
            :cx="playerPosition.x" 
            :cy="playerPosition.y" 
            r="27.5" 
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
          v-if="gameState === 'ready'" 
          @click="startGame" 
          class="start-btn"
        >
          開始遊戲
        </button>
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
        <button @click="restartGame" class="restart-btn">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script>
import candyStrawberry from './assets/candy_strawberry.png'

export default {
  name: 'App',
  data() {
    return {
      gameState: 'ready', // ready, playing, gameOver, completed
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
      candyImage: candyStrawberry
    }
  },
  mounted() {
    this.gameArea = this.$refs.gameArea;
    this.svgElement = this.$refs.svgElement;
    this.setupEventListeners();
    this.initializePaths();
  },
  beforeUnmount() {
    this.removeEventListeners();
    if (this.scoreInterval) {
      clearInterval(this.scoreInterval);
    }
  },
  methods: {
    setupEventListeners() {
      // 滑鼠事件
      this.gameArea.addEventListener('mousedown', this.handleStart);
      this.gameArea.addEventListener('mousemove', this.handleMove);
      this.gameArea.addEventListener('mouseup', this.handleEnd);
      this.gameArea.addEventListener('mouseleave', this.handleEnd);
      
      // 觸控事件
      this.gameArea.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.gameArea.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.gameArea.addEventListener('touchend', this.handleEnd);
      
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
    
    startGame() {
      this.gameState = 'playing';
      this.score = 0;
      this.playerPosition = { x: 143, y: 70 };
      this.gameStartTime = Date.now();
      
      // 開始計分
      this.scoreInterval = setInterval(() => {
        if (this.gameState === 'playing') {
          this.score += 1;
        }
      }, 100);
    },
    
    restartGame() {
      this.gameState = 'ready';
      this.playerPosition = { x: 143, y: 70 };
      this.isShaking = false;
      if (this.scoreInterval) {
        clearInterval(this.scoreInterval);
      }
    },
    
    handleStart(e) {
      if (this.gameState !== 'playing') return;
      
      // 檢查是否點擊在玩家元件上
      const rect = this.gameArea.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;
      const x = relativeX * 760;
      const y = relativeY * 1283;
      
      // 檢查點擊位置是否在玩家元件附近（使用更大的容錯範圍）
      const tolerance = 50; // 更大的容錯範圍
      const isOnPlayer = Math.abs(x - this.playerPosition.x) <= tolerance && 
                        Math.abs(y - this.playerPosition.y) <= tolerance;
      
      console.log('點擊位置:', x, y);
      console.log('玩家位置:', this.playerPosition.x, this.playerPosition.y);
      console.log('距離:', Math.abs(x - this.playerPosition.x), Math.abs(y - this.playerPosition.y));
      console.log('是否在玩家上:', isOnPlayer);
      
      if (!isOnPlayer) return;
      
      e.preventDefault();
      this.isMouseDown = true;
      console.log('開始拖動玩家元件');
    },
    
    handleTouchStart(e) {
      if (this.gameState !== 'playing') return;
      
      const touch = e.touches[0];
      // 檢查是否點擊在玩家元件上
      const rect = this.gameArea.getBoundingClientRect();
      const relativeX = (touch.clientX - rect.left) / rect.width;
      const relativeY = (touch.clientY - rect.top) / rect.height;
      const x = relativeX * 760;
      const y = relativeY * 1283;
      
      // 檢查點擊位置是否在30x30的玩家元件範圍內（+ 20像素緩衝）
      const tolerance = 35; // 30/2 + 20像素緩衝
      const isOnPlayer = Math.abs(x - this.playerPosition.x) <= tolerance && 
                        Math.abs(y - this.playerPosition.y) <= tolerance;
      
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
    },
    
    updatePlayerPosition(e) {
      const rect = this.gameArea.getBoundingClientRect();
      
      // 計算相對於遊戲區域的百分比
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;
      
      // 轉換為 SVG 座標系統
      const x = relativeX * 760;
      const y = relativeY * 1283;
      
      // 限制在 SVG 範圍內
      const clampedX = Math.max(0, Math.min(760, x));
      const clampedY = Math.max(0, Math.min(1283, y));
      
      // 檢查是否碰到路徑
      if (this.checkCollision(clampedX, clampedY)) {
        this.gameOver();
        return;
      }
      
      // 檢查是否到達終點
      if (this.checkWinCondition(clampedX, clampedY)) {
        this.winGame();
        return;
      }
      
      this.playerPosition = { x: clampedX, y: clampedY };
    },
    
    checkCollision(x, y) {
      // 合理的碰撞檢測 - 檢查黃色區塊是否碰到路徑
      const blockSize = 30; // 黃色區塊大小
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
<style>
  .app {
    width: 100vw;
    height: 100vh;
    margin: 0 auto;
    /* background-image: url('./assets/background.jpg');
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat; */
    background-color: #030b7a;
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

  .game-header {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .game-header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .score, .best-score {
    font-size: 1.1rem;
    font-weight: bold;
    background: rgba(255,255,255,0.2);
    padding: 5px 10px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .game-area {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 80vh;
    overflow: hidden;
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
    /* 暫時移除 transform 來測試座標對齊 */
    /* transform: scale(1.1); */
    filter: drop-shadow(0 0 12px rgba(255,107,107,0.8));
  }

  .debug-circle {
    pointer-events: none;
    opacity: 0.5;
  }

  .start-point {
    filter: drop-shadow(0 0 8px rgba(78,205,196,0.8));
    animation: pulse 2s infinite;
  }

  .end-zone {
    filter: drop-shadow(0 0 8px rgba(255,107,107,0.5));
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
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

  .completed .restart-btn {
    margin-top: 20px;
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

  .completed .restart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  }

  /* 響應式設計 */
  @media (max-width: 768px) {


    .game-area {
      /* max-width: 350px; */
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
  }

  @media (max-width: 480px) {
    .game-container {
    padding: 10px;
    }

    .game-area {
      max-width: 400px;
      height: 80vh;
    }

    .game-header h1 {
      font-size: 1rem;
    }

    .score, .best-score {
      font-size: 0.8rem;
      padding: 2px 6px;
    }
  }

  /* 橫向模式優化 */
  @media (orientation: landscape) and (max-height: 600px) {
    .game-area {
      height: 85vh;
      max-height: none;
    }

    .game-header {
      top: 5px;
    }

    .game-controls {
      bottom: 5px;
    }
  }
</style>
