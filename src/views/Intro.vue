<template>
  <div class="home" @click="enableBGM" @mousemove="enableBGM">
    <!-- 設備建議彈窗 -->
    <div class="device-modal" v-if="showDeviceModal" @click="closeDeviceModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>建議使用電腦＆平板進行遊玩</h3>
          <button class="close-btn" @click="closeDeviceModal">×</button>
        </div>
        <div class="modal-body">
          <p>為了獲得最佳遊戲體驗，建議您使用電腦或平板設備進行遊戲，手機設備可能會影響遊戲操作和視覺效果。</p>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeDeviceModal">我知道了</button>
        </div>
      </div>
    </div>

    <!-- 遊戲說明 -->
    <div class="home-container" v-if="step === 1">
      <div class="pc-view">
        <div class="relative pc-out">
          <img class="pc-img" src="@/assets/images/pc-step-1-new.webp" alt="" >
          <div class="pc-next-btn-1" @click="stepNext"></div>
        </div>
      </div>
      <div class="mb-view">
        <div class="relative">
          <img src="@/assets/images/mb-step-1-new.webp" alt="">
          <div class="mb-next-btn-1" @click="stepNext"></div>
        </div>
      </div>
    </div>

      
    <!-- 選擇嗨啾 -->
    <div class="home-container"  v-if="step === 2">
      <div class="pc-view">
        <div class="relative pc-out">
          <img class="pc-img" src="@/assets/images/pc-step-3.webp" alt="">
          <div class="pc-next-btn-3-1" @click="stepNext(1)">
            <img src="@/assets/candy_grape.webp" alt="">
          </div>
          <div class="pc-next-btn-3-2" @click="stepNext(2)">
            <img src="@/assets/candy_strawberry.webp" alt="">
          </div>
        </div>
      </div>
      <div class="mb-view">
        <div class="relative">
          <img src="@/assets/images/mb-step-3.webp" alt="">
          <div class="mb-next-btn-3-1" @click="stepNext(1)">
            <img src="@/assets/candy_grape.webp" alt="">
          </div>
          <div class="mb-next-btn-3-2" @click="stepNext(2)">
            <img src="@/assets/candy_strawberry.webp" alt="">
          </div>
        </div>
      </div>
    </div>

    <!-- 選擇關卡 -->
    <div class="home-container" v-if="step === 3">
      <div class="pc-view">
        <div class="relative pc-out">
          <img class="pc-img" src="@/assets/images/pc-step-2.webp" alt="">
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
        selectedCandy: null,
        uid: null,
        showDeviceModal: true
    }
  },
  mounted() {
    this.initializeBGM()
    this.uid = this.$route.query.uid || null
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
      this.stopBGM()
      this.router.push({
        path: '/game',
        query: {
          candy: this.selectedCandy,
          level: this.selectedLevel,
          uid: this.uid
        }
      })
    },
    
    stepNext(_value) {
      this.enableBGM() // 任何交互都觸發BGM
      this.selectedCandy = _value
      this.step++
    },
    
    closeDeviceModal() {
      this.showDeviceModal = false
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
  background-position: -1px ;
  background-repeat: no-repeat;
}

.home-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.home-container img {
  width: 100%;
  height: auto;
  
  object-fit: contain;
  /* cursor: pointer; */
}

.pc-img{
  width: 100%;
  height: auto;
  max-height: 100vh;
  object-fit: contain;
}

.relative{
  position: relative;
 
}

.pc-out{
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pc-next-btn-1{
  position: absolute;
  width: 26%;
  height: 20%;
  bottom: 3%;
  left: 37%;
  cursor: pointer;
  
}
.pc-next-btn-2-1{
  position: absolute;
  width: 19.9%;
  height: 71.7%;
  top: 20.2%;
  left: 9.5%;
  border-radius: 34px;
  cursor: pointer;
  rotate: 170deg;
  background-color: rgba(34, 146, 183, 0.1);
  transition: all 0.3s ease;
}
.pc-next-btn-2-2{
  position: absolute;
  width: 19.9%;
  height: 71.7%;
  top: 20.2%;
  right: 9%;
  border-radius: 34px;
  cursor: pointer;
  rotate: 10deg;
  background-color: rgba(34, 146, 183, 0.1);
  transition: all 0.3s ease;
}

.pc-next-btn-2-1:hover, .pc-next-btn-2-2:hover,.mb-next-btn-2-1:hover, .mb-next-btn-2-2:hover{
  background-color: rgba(34, 146, 183, 0.3);
  box-shadow: 0 0 20px #2292b7, 0 0 40px rgba(34, 146, 183, 0.5);
  transform: scale(1);
}
@keyframes wiggle {
  0%, 100% { transform: rotate(14deg); }
  50% { transform: rotate(0deg); }
  
}

.pc-next-btn-3-1{
  position: absolute;
  width: 17%;
  height: 17%;
  top: 22%;
  right: 25%;
  cursor: pointer;
  rotate: 14deg;
  animation: wiggle 1.5s ease-in-out infinite;
}

.pc-next-btn-3-2{
  position: absolute;
  width: 17%;
  height: 17%;
  top: 22%;
  right: 4.5%;
  cursor: pointer;
  rotate: 14deg;
  animation: wiggle 1.5s ease-in-out infinite;
}
.pc-next-btn-3-1 img, .pc-next-btn-3-2 img{
  position: relative;
  bottom: 11%;
  rotate: -5deg;
}
.mb-next-btn-1{
  position: absolute;
  width: 67%;
  height: 13%;
  bottom: 8%;
  left: 16%;
  cursor: pointer;
  
}

@keyframes wiggle-mb {
  0%, 100% { transform: rotate(14deg); }
  50% { transform: rotate(0deg); }
  
}

.mb-next-btn-3-1{
  position: absolute;
  width: 38%;
  height: 9.5%;
  bottom: 30%;
  left: 8%;
  cursor: pointer;
  rotate: 14deg;
  animation: wiggle-mb 1.5s ease-in-out infinite;
}
.mb-next-btn-3-2{
  position: absolute;
  width: 38%;
  height: 9.5%;
  bottom: 30%;
  right: 6%;
  cursor: pointer;
  rotate: 14deg;
  animation: wiggle-mb 1.5s ease-in-out infinite;
}
.mb-next-btn-3-1 img, .mb-next-btn-3-2 img{
  position: relative;
  bottom: 13%;
  rotate: -7deg;
}

.mb-next-btn-2-1{
  position: absolute;
  width: 43.4%;
  height: 43.1%;
  bottom: 32.2%;
  left: 11.2%;
  cursor: pointer;
  rotate: -10deg;
  z-index: 1;
  border-radius: 17px;
}
.mb-next-btn-2-2{
  position: absolute;
  width: 43.4%;
  height: 43.1%;
  bottom: 4.2%;
  right: 12.5%;
  cursor: pointer;
  rotate: 10deg;
  border-radius: 29px;
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

/* 設備建議彈窗樣式 */
.device-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 0;
  max-width: 800px;
  min-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  overflow: hidden;
}

.modal-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 35px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 44px;
  cursor: pointer;
  padding: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 25px;
  color: white;
}

.modal-body p {
  margin: 0 0 15px 0;
  font-size: 30px;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-footer {
  padding: 20px 25px;
  display: flex;
  justify-content: center;
}

.confirm-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  margin-top: 60px;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.confirm-btn:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
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
    
    /* 手機版彈窗樣式 */
    .modal-content {
      max-width: 90%;
      min-width: 90%;
      margin: 20px;
    }
    
    .modal-header {
      padding: 15px;
    }
    
    .modal-header h3 {
      font-size: 23px;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .modal-body p {
      font-size: 18px;
    }
    
    .modal-footer {
      padding: 15px 20px;
    }
    
    .confirm-btn {
      margin-top: 20px;
      padding: 10px 25px;
      font-size: 18px;
    }
}
</style>
