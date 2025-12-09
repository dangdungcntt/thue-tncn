import { createWebHistory, createRouter } from 'vue-router'
import Home from './pages/Home.vue'
import GrossNet from './pages/Income.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/tinh-luong', component: GrossNet },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
