import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateRoomView from '@/views/CreateRoomView.vue'
import RoomView from '@/views/RoomView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/create-room',
      name: 'create-room',
      component: CreateRoomView,
    },
    {
      path: '/room/:id',
      name: 'room',
      component: RoomView,
    }
  ],
})

export default router
