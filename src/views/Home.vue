<template>
  <div class="home" @click="enableBGM" @mousemove="enableBGM">
    <!-- 遊戲說明 -->
    <div class="home-container" v-if="step === 1">
      <div class="pc-view">
        <div class="relative">
          <img src="@/assets/images/pc-step-1.webp" alt="" >
          <div class="pc-next-btn-1" @click="stepNext"></div>
        </div>
      </div>
      <div class="mb-view">
        <div class="relative">
          <img src="@/assets/images/mb-step-1.webp" alt="">
          <div class="mb-next-btn-1" @click="stepNext"></div>
        </div>
      </div>
    </div>

      
    <!-- 選擇嗨啾 -->
    <div class="home-container"  v-if="step === 2">
      <div class="pc-view">
        <div class="relative">
          <img src="@/assets/images/pc-step-3.webp" alt="">
          <div class="pc-next-btn-3-1" @click="stepNext(1)"></div>
          <div class="pc-next-btn-3-2" @click="stepNext(2)"></div>
        </div>
      </div>
      <div class="mb-view">
        <div class="relative">
          <img src="@/assets/images/mb-step-3.webp" alt="">
          <div class="mb-next-btn-3-1" @click="stepNext(1)"></div>
          <div class="mb-next-btn-3-2" @click="stepNext(2)"></div>
        </div>
      </div>
    </div>

    <!-- 選擇關卡 -->
    <div class="home-container" v-if="step === 3">
      <div class="pc-view">
        <div class="relative">
          <img src="@/assets/images/pc-step-2.webp" alt="">
          <div class="pc-next-btn-2-1" @click="startGame('a')"></div>
          <div class="pc-next-btn-2-2" @click="startGame('b')"></div>
        </div>
      </div>
      <div class="mb-view">
        <div class="relative">  
          <img src="@/assets/images/mb-step-2.webp" alt="">
          <div class="mb-next-btn-2-1" @click="startGame('a')"></div>
          <div class="mb-next-btn-2-2" @click="startGame('b')"></div>
        </div>
      </div>
    </div>
  

  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import bgmSound from '../assets/mp3/bgm.mp3'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    return {
      router
    }
  },
  data() {
    return {
        step: 1,
        bgmAudio: null,
        bgmStarted: false,
        selectedLevel: null,
        selectedCandy: null
    }
  },
  mounted() {
    this.initializeBGM()
  },
  beforeUnmount() {
    this.stopBGM()
  },
  methods: {
    initializeBGM() {
      try {
        this.bgmAudio = new Audio(bgmSound)
        this.bgmAudio.loop = true
        this.bgmAudio.volume = 0.5
        
        // 嘗試自動播放，如果失敗則顯示提示
        this.playBGM()
      } catch (error) {
        console.warn('BGM 初始化失敗:', error)
      }
    },
    
    enableBGM() {
      this.playBGM()
    },
    
    playBGM() {
      if (this.bgmAudio) {
        try {
          this.bgmAudio.play().then(() => {
            this.bgmStarted = true
            console.log('BGM 播放成功')
          }).catch(error => {
            console.warn('BGM 播放失敗:', error)
            this.bgmStarted = false
          })
        } catch (error) {
          console.warn('BGM 播放錯誤:', error)
          this.bgmStarted = false
        }
      }
    },
    
    stopBGM() {
      if (this.bgmAudio) {
        this.bgmAudio.pause()
        this.bgmAudio.currentTime = 0
        this.bgmStarted = false
      }
    },
    
    startGame(_value) {
      this.selectedLevel = _value
      this.enableBGM() // 任何交互都觸發BGM
      this.router.push({
        path: '/game',
        query: {
          candy: this.selectedCandy,
          level: this.selectedLevel
        }
      })
    },
    
    stepNext(_value) {
      this.enableBGM() // 任何交互都觸發BGM
      this.selectedCandy = _value
      this.step++
    }
  }
}
</script>

<style scoped>
.home {
  width: calc(100vw + 10px);
  height: calc(100vh + 10px);
  overflow: auto;
  background-image: url('../assets/images/pc-bg.svg');
  background-size: cover;
  background-position: -5px -5px;
  background-repeat: no-repeat;
}

.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.home-container img {
  width: 100%;
  
  object-fit: contain;
  cursor: pointer;
}

.relative{
  position: relative;
}

.pc-next-btn-1{
  position: absolute;
  width: 24vw;
  height: 11vw;
  bottom: 2vw;
  left: calc(50% - 12vw);
  cursor: pointer;
}
.pc-next-btn-2-1{
  position: absolute;
  width: 22vw;
  height: 48vw;
  top: 5vw;
  left: calc(16% - 10vw);
  cursor: pointer;
  rotate: 170deg;
}
.pc-next-btn-2-2{
  position: absolute;
  width: 22vw;
  height: 48vw;
  top: 5vw;
  right: calc(16% - 10vw);
  cursor: pointer;
  rotate: 10deg;
}
.pc-next-btn-3-1{
  position: absolute;
  width: 17vw;
  height: 10vw;
  top: 11vw;
  right: calc(35% - 8vw);
  cursor: pointer;
  rotate: 19deg;
}
.pc-next-btn-3-2{
  position: absolute;
  width: 17vw;
  height: 10vw;
  top: 11vw;
  right: calc(14.5% - 8vw);
  cursor: pointer;
  rotate: 19deg;
}

.mb-next-btn-1{
  position: absolute;
  width: 67%;
  height: 13%;
  bottom: 8%;
  left: 16%;
  cursor: pointer;
  
}
.mb-next-btn-3-1{
  position: absolute;
  width: 38%;
  height: 9%;
  bottom: 34%;
  left: 9%;
  cursor: pointer;
  rotate: 19deg;
}
.mb-next-btn-3-2{
  position: absolute;
  width: 38%;
  height: 9%;
  bottom: 34%;
  right: 8%;
  cursor: pointer;
  rotate: 19deg;
}
.mb-next-btn-2-1{
  position: absolute;
  width: 44%;
  height: 43%;
  bottom: 32%;
  left: 11%;
  cursor: pointer;
  rotate: -11deg; 
  z-index: 1;
}
.mb-next-btn-2-2{
  position: absolute;
  width: 44%;
  height: 43%;
  bottom: 4%;
  right: 12.5%;
  cursor: pointer;
  rotate: 11deg; 
}


.mb-view{
  display: none;
}

.bgm-prompt {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
  animation: pulse 2s infinite;
}

.bgm-prompt-content {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 25px;
  font-size: 14px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bgm-prompt-content p {
  margin: 0;
  font-weight: bold;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@media (max-width: 768px) {
    .home-container{
     display: block;
    }
    .pc-view{
        display: none;
    }
    .mb-view{
        display: block;
    }
    
    .bgm-prompt {
      top: 10px;
      right: 10px;
    }
    
    .bgm-prompt-content {
      padding: 8px 12px;
      font-size: 12px;
    }
}
</style>
