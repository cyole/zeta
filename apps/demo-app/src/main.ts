import type { RouteRecordRaw } from 'vue-router'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Callback from './pages/Callback.vue'
import Home from './pages/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/callback', component: Callback },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
