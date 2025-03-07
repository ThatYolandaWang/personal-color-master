import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/color-test',
    name: 'ColorTest',
    component: () => import('@/views/ColorTest.vue')
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/Report.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router