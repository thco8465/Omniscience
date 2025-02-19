import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HangView from '../views/HangView.vue'
import AlphaView from '../views/AlphaView.vue'
import Achievements from '../views/AchievementsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import RepeaterView from '@/views/RepeaterView.vue'
import ScrambleView from '@/views/ScrambleView.vue'
import ShapeClickerView from '@/views/ShapeClickerView.vue'
import TileView from '@/views/TileView.vue'
import CreateAccount from '../components/CreateAccount.vue'
import Login from '../components/MyLogin.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path:'/CreateAccount',
      name: 'CreateAccount',
      component: CreateAccount,
    },
    {
      path:'/Login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/HangView',
      name: 'HangView',
      component: HangView,
    },
    {
      path:'/AlphaArena',
      name:'/AlphaArena',
      component: AlphaView
    },
    {
      path:'/Achievements',
      name:'/Achievements',
      component: Achievements
    },
    {
      path:'/Profile',
      name:'/Profile',
      component: ProfileView
    },
    {
      path:'/Repeater',
      name:'/Repeater',
      component: RepeaterView
    },
    {
      path:'/Scramble',
      name:'/Scramble',
      component: ScrambleView
    },
    {
      path:'/ShapeClicker',
      name:'/ShapeClicker',
      component: ShapeClickerView
    },
    {
      path:'/Tiles',
      name:'/Tiles',
      component: TileView
    }
  ],
})

export default router
