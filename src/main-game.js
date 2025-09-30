import { createApp } from 'vue'
import router from './router'
import Game from './views/Game.vue'

const app = createApp(Game)
app.use(router)
app.mount('#app')
