import { createRouter, createWebHistory } from 'vue-router'
import Intro from '../views/Intro.vue'
import Game from '../views/Game.vue'

const routes = [
  {
    path: '/',
    name: 'Intro',
    component: Intro
  },
  {
    path: '/game',
    name: 'Game',
    component: Game
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
