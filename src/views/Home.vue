<template>
  <div class="home" @click="enableBGM" @mousemove="enableBGM">
    <div class="home-container" v-if="step === 1">
        <img src="@/assets/pc-1.png" alt="" class="pc-img" @click="startGame">
        <img src="@/assets/mb-1.png" alt="" class="mb-img" @click="startGame">
    </div>
    
    <!-- 遊戲說明彈窗 -->
    <div class="home-container"  v-if="step === 2">
        <img src="@/assets/pc-2.png" alt="" class="pc-img" @click="goToGame">
        <img src="@/assets/mb-2.png" alt="" class="mb-img" @click="goToGame">
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
        bgmStarted: false
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
    
    startGame() {
      this.enableBGM() // 任何交互都觸發BGM
      this.step = 2
    },
    
    goToGame() {
      this.enableBGM() // 任何交互都觸發BGM
      this.router.push('/game')
    }
  }
}
</script>

<style scoped>
.home {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-image: url('../assets/pc-bg.svg');
  background-size: cover;
  background-position: center;
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

.mb-img{
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
    .pc-img{
        display: none;
    }
    .mb-img{
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
