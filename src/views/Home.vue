<template>
  <div class="home">
    <div class="home-container" v-if="step === 1">
        <img src="@/assets/pc-1.jpg" alt="" class="pc-img" @click="startGame">
        <img src="@/assets/mb-1.jpg" alt="" class="mb-img" @click="startGame">
    </div>
    
    <!-- 遊戲說明彈窗 -->
    <div class="home-container"  v-if="step === 2">
        <img src="@/assets/pc-2.jpg" alt="" class="pc-img" @click="router.push('/game')">
        <img src="@/assets/mb-2.jpg" alt="" class="mb-img" @click="router.push('/game')">
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

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
    }
  },
  methods: {
    startGame() {
      this.step = 2
    },
  }
}
</script>

<style scoped>
.home {
  width: 100vw;
  height: 100%;
  overflow: auto;
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
}
</style>
