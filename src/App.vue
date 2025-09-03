<template>
  <div class="app">
    <div class="game-container">
      <!-- 葡萄糖果 -->
      <div 
        ref="candy"
        alt="葡萄糖果" 
        class="candy"
        :style="{width: candySize + 'px', height: candySize + 'px',backgroundColor: 'red', backgroundPosition: 'center', left: (candyPosition.x * scale) + 'px', top: (candyPosition.y * scale) + 'px' }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      />
      
      <!-- 終點區域 -->
      <div 
        class="finish-zone"
        :style="{ width: finishZoneSize + 'px', height: finishZoneSize + 'px', left: (finishZone.x * scale) + 'px', top: (finishZone.y * scale) + 'px' }"
      ></div>
      
      <!-- 彎曲路徑線條 -->
      <svg class="path-svg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c0c0c0;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#e8e8e8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a0a0a0;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
                <!-- 第一條路徑 - 模仿圖片中的S型蜿蜒 -->
        <path 
          d="M 70 55 
             L 270 55
             L 280 75
             L 270 95
             L 170 95
             L 140 135
             L 140 185
             L 170 230
             L 310 230 
            "
          stroke="url(#pathGradient)"
          :stroke-width="8 * scale"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#glow)"
        />
        
        <!-- 第二條路徑 - 與第一條線相同形狀，間隔30px -->
        <path 
          d="M 70 5 
             L 300 5
             L 330 45
             L 330 95
             L 300 140
             L 210 140
             L 200 160
             L 210 180
             L 300 180
             L 310 180
            "
          stroke="url(#pathGradient)"
          :stroke-width="8 * scale"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#glow)"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      candyPosition: {
        x: 60,
        y: 192
      },
      finishZone: {
        x: 365,
        y: 350
      },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      candySize: 15,
      finishZoneSize: 50,
      scale: 1
    }
  },
  mounted() {
    this.calculateScale();
    window.addEventListener('resize', this.calculateScale);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateScale);
  },
  methods: {
    calculateScale() {
      // 計算縮放比例
      const container = this.$el.querySelector('.game-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const baseWidth = 400; // 基準寬度
        const baseHeight = 600; // 基準高度
        
        const scaleX = containerRect.width / baseWidth;
        const scaleY = containerRect.height / baseHeight;
        this.scale = Math.min(scaleX, scaleY, 1); // 不超過原始大小
        
        // 更新元素大小
        this.candySize = Math.max(10, 15 * this.scale);
        this.finishZoneSize = Math.max(30, 50 * this.scale);
        
        // 確保位置在有效範圍內
        this.adjustPositions();
      }
    },
    
    adjustPositions() {
      // 調整位置確保在有效範圍內
      const container = this.$el.querySelector('.game-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const maxX = (containerRect.width / this.scale) - (this.candySize / this.scale);
        const maxY = (containerRect.height / this.scale) - (this.candySize / this.scale);
        
        this.candyPosition.x = Math.max(0, Math.min(this.candyPosition.x, maxX));
        this.candyPosition.y = Math.max(0, Math.min(this.candyPosition.y, maxY));
        
        const finishMaxX = (containerRect.width / this.scale) - (this.finishZoneSize / this.scale);
        const finishMaxY = (containerRect.height / this.scale) - (this.finishZoneSize / this.scale);
        
        this.finishZone.x = Math.max(0, Math.min(this.finishZone.x, finishMaxX));
        this.finishZone.y = Math.max(0, Math.min(this.finishZone.y, finishMaxY));
      }
    },
    startDrag(event) {
      event.preventDefault();
      this.isDragging = true;
      const rect = this.$refs.candy.getBoundingClientRect();
      
      // 支援滑鼠和觸控
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      this.dragOffset.x = (clientX - rect.left) / this.scale;
      this.dragOffset.y = (clientY - rect.top) / this.scale;
      
      // 添加全局事件監聽器（滑鼠和觸控）
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.endDrag);
      document.addEventListener('touchmove', this.drag, { passive: false });
      document.addEventListener('touchend', this.endDrag);
    },
    drag(event) {
      if (!this.isDragging) return;
      event.preventDefault();
      
      const containerRect = this.$el.querySelector('.game-container').getBoundingClientRect();
      
      // 支援滑鼠和觸控
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      const newX = (clientX - containerRect.left - this.dragOffset.x) / this.scale;
      const newY = (clientY - containerRect.top - this.dragOffset.y) / this.scale;
      
      const maxX = (containerRect.width / this.scale) - (this.candySize / this.scale);
      const maxY = (containerRect.height / this.scale) - (this.candySize / this.scale);
      
      this.candyPosition.x = Math.max(0, Math.min(newX, maxX));
      this.candyPosition.y = Math.max(0, Math.min(newY, maxY));
      
      // 檢查碰撞
      this.checkCollision();
    },
    endDrag() {
      this.isDragging = false;
      // 移除全局事件監聽器（滑鼠和觸控）
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.endDrag);
      document.removeEventListener('touchmove', this.drag);
      document.removeEventListener('touchend', this.endDrag);
    },
    checkCollision() {
      // 獲取方塊的實際位置和大小
      const candyRect = this.$refs.candy.getBoundingClientRect();
      const container = this.$el.querySelector('.game-container');
      const svg = this.$el.querySelector('.path-svg');
      const containerRect = container.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      
      // 計算方塊在SVG中的相對位置，並增加7px的檢測範圍
      const buffer = 5;
      const candyLeft = candyRect.left - svgRect.left - buffer;
      const candyRight = candyRect.right - svgRect.left + buffer;
      const candyTop = candyRect.top - svgRect.top - buffer;
      const candyBottom = candyRect.bottom - svgRect.top + buffer;
      
      // 將方塊邊界轉換為SVG座標系統
      const svgScaleX = 400 / svgRect.width;
      const svgScaleY = 600 / svgRect.height;
      
      const candySvgLeft = candyLeft * svgScaleX;
      const candySvgRight = candyRight * svgScaleX;
      const candySvgTop = candyTop * svgScaleY;
      const candySvgBottom = candyBottom * svgScaleY;
      
      // 檢查是否與第一條線碰撞
      if (this.checkLineCollision(candySvgLeft, candySvgRight, candySvgTop, candySvgBottom, 1)) {
        alert('失敗！');
        this.resetCandyPosition();
        this.endDrag(); // 移除拖曳狀態
        return;
      }
      
      // 檢查是否與第二條線碰撞
      if (this.checkLineCollision(candySvgLeft, candySvgRight, candySvgTop, candySvgBottom, 2)) {
        alert('失敗！');
        this.resetCandyPosition();
        this.endDrag(); // 移除拖曳狀態
        return;
      }
      
      // 檢查是否到達終點區域
      this.checkFinishZone();
    },
    
    checkLineCollision(candyLeft, candyRight, candyTop, candyBottom, lineNumber) {
      // 定義兩條線的近似路徑點 - 匹配往左移動20px後的線條路徑
      const line1Points = [
        {x: 70, y: 55}, {x: 270, y: 55}, {x: 280, y: 75}, {x: 270, y: 95}, 
        {x: 170, y: 95}, {x: 140, y: 135}, {x: 140, y: 185}, {x: 170, y: 230}, 
        {x: 310, y: 230}
      ];
      
      const line2Points = [
        {x: 70, y: 5}, {x: 300, y: 5}, {x: 330, y: 45}, {x: 330, y: 95}, 
        {x: 300, y: 140}, {x: 210, y: 140}, {x: 200, y: 160}, {x: 210, y: 180}, 
        {x: 300, y: 180}, {x: 310, y: 180}
      ];
      
      const points = lineNumber === 1 ? line1Points : line2Points;
      
      // 檢查方塊是否與線條的任何線段相交
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // 檢查方塊是否與線段相交
        if (this.lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, candyLeft, candyTop, candyRight, candyBottom)) {
          return true;
        }
      }
      
      return false;
    },
    
    lineIntersectsRect(x1, y1, x2, y2, rectLeft, rectTop, rectRight, rectBottom) {
      // 更嚴格的碰撞檢測 - 只有真正相交才返回true
      
      // 檢查線段端點是否在矩形內（完全在內部）
      if ((x1 > rectLeft && x1 < rectRight && y1 > rectTop && y1 < rectBottom) ||
          (x2 > rectLeft && x2 < rectRight && y2 > rectTop && y2 < rectBottom)) {
        return true;
      }
      
      // 檢查線段是否與矩形的任何邊相交（真正的相交，不是接觸）
      const tolerance = 0.1; // 增加一點容差來避免浮點數精度問題
      
      // 檢查與上邊相交
      if (this.linesIntersect(x1, y1, x2, y2, rectLeft + tolerance, rectTop + tolerance, rectRight - tolerance, rectTop + tolerance)) {
        return true;
      }
      
      // 檢查與右邊相交
      if (this.linesIntersect(x1, y1, x2, y2, rectRight - tolerance, rectTop + tolerance, rectRight - tolerance, rectBottom - tolerance)) {
        return true;
      }
      
      // 檢查與下邊相交
      if (this.linesIntersect(x1, y1, x2, y2, rectRight - tolerance, rectBottom - tolerance, rectLeft + tolerance, rectBottom - tolerance)) {
        return true;
      }
      
      // 檢查與左邊相交
      if (this.linesIntersect(x1, y1, x2, y2, rectLeft + tolerance, rectBottom - tolerance, rectLeft + tolerance, rectTop + tolerance)) {
        return true;
      }
      
      return false;
    },
    
    linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
      // 檢查兩條線段是否相交 - 更嚴格的檢測
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (Math.abs(denom) < 1e-10) return false; // 平行線
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
      
      // 更嚴格的範圍檢查 - 排除端點接觸
      const epsilon = 0.01;
      return t > epsilon && t < (1 - epsilon) && u > epsilon && u < (1 - epsilon);
    },
    
    resetCandyPosition() {
      // 將紅色方塊重置到預設位置
      this.candyPosition.x = 60;
      this.candyPosition.y = 192;
    },
    
    checkFinishZone() {
      // 檢查紅色方塊是否碰到終點區域
      const candyLeft = this.candyPosition.x;
      const candyRight = this.candyPosition.x + (this.candySize / this.scale);
      const candyTop = this.candyPosition.y;
      const candyBottom = this.candyPosition.y + (this.candySize / this.scale);
      
      const finishLeft = this.finishZone.x;
      const finishRight = this.finishZone.x + (this.finishZoneSize / this.scale);
      const finishTop = this.finishZone.y;
      const finishBottom = this.finishZone.y + (this.finishZoneSize / this.scale);
      
      // 檢查是否重疊
      if (candyLeft < finishRight && candyRight > finishLeft && 
          candyTop < finishBottom && candyBottom > finishTop) {
        alert('過關！');
        this.resetCandyPosition();
        this.endDrag(); // 移除拖曳狀態
      }
    }
  }
}
</script>
<style>
  .app {
    width: 100vw;
    height: 100vh;
    max-width: 450px;
    margin: 0 auto;
    background-image: url('./assets/background.jpg');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    touch-action: none; /* 防止手機上的滾動和縮放 */
    user-select: none; /* 防止文字選取 */
  }

  .game-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .path-svg {
    width: 100%;
    height: 100%;
    max-width: 400px;
    max-height: 600px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .candy {
    position: absolute;
    cursor: grab;
    z-index: 10;
    user-select: none;
    border-radius: 2px;
    touch-action: none; /* 防止觸控時的預設行為 */
  }

  .candy:active {
    cursor: grabbing;
  }

  /* 手機觸控優化 */
  @media (max-width: 768px) {
    .candy {
      cursor: pointer;
    }
    
    .candy:active {
      cursor: pointer;
    }
    
    .app {
      /* max-width: 100vw; */
    }
  }

  /* 小螢幕優化 */
  @media (max-width: 480px) {
    .path-svg {
      max-width: 350px;
      max-height: 525px;
    }
  }

  /* 大螢幕優化 */
  @media (min-width: 1200px) {
    .app {
      max-width: 600px;
    }
    
    .path-svg {
      max-width: 600px;
      max-height: 900px;
    }
  }

  .finish-zone {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: #00ff00;
    border: 2px solid #00cc00;
    border-radius: 8px;
    z-index: 5;
    opacity: 0.8;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }
</style>
