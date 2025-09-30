import { createApp } from 'vue'
import router from './router'
import Intro from './views/Intro.vue'

const app = createApp(Intro)
app.use(router)
app.mount('#app')
