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
import Store from '../views/MyStoreView.vue'
import LeaderBoards from '../views/LeaderBoards.vue'
import TwentyOne from '@/components/TwentyOne/twentyOne.vue'
import ConvertCurr from '@/components/ConvertCurr.vue'
import KeyClash from '@/components/KeyClash/KeyClash.vue'
import KeyClashSingle from '@/components/KeyClash/KeyClashSingle.vue'
import KeyClashOnline from '@/components/KeyClash/KeyClashOnline.vue'
import KeyClashInvite from '@/components/KeyClash/KeyClashRoom.vue'
import inviteClash from '@/components/KeyClash/InviteClash.vue'
import AlphaOnline from '@/components/Wordle/WordleOnline.vue'
import AlphaRoom from '@/components/Wordle/WordleRoom.vue'
import AlphaCustom from '@/components/Wordle/WordleInvite.vue'
import ScenicView from '@/views/ScenicView.vue'
import AboutSite from '@/components/AboutSite.vue'
import MyStats from '@/components/Statistics/MyStats.vue'
import MyJournal from '@/components/MyJournal.vue'
import DailyChallenge from '@/components/DailyChallenge/DailyChallenge.vue'

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
    },
    {
      path:'/Store',
      name: '/Store',
      component: Store,
    },
    {
      path:'/Leaderboards',
      name: '/Leaderboards',
      component: LeaderBoards,
    },
    {
      path: '/TwentyOne',
      name: 'TwentyOne',
      component: TwentyOne,
    },
    {
      path: '/ConvertCurr',
      name: 'ConvertCurr',
      component: ConvertCurr,
    },
    {
      path:'/KeyClash',
      name: 'KeyClash',
      component: KeyClash,
    },
    {
      path: '/KeyClashSingle',
      name: 'KeyClashSingle',
      component: KeyClashSingle,
    },
    {
      path: '/KeyClashOnline',
      name: 'KeyClashOnline',
      component: KeyClashOnline
    },
    {
      path: '/KeyClashInvite',
      name: 'KeyClashInvite',
      component: KeyClashInvite,
    },
    {
      path: '/inviteclash',
      name: 'inviteclash',
      component: inviteClash
    },
    {
      path: '/AlphaOnline',
      name: 'AlphaOnline',
      component: AlphaOnline
    },
    {
      path: '/AlphaRoom',
      name: 'AlphaRoom',
      component: AlphaRoom
    },
    {
      path: '/AlphaCustom',
      name: 'AlphaCustom',
      component: AlphaCustom
    },
    {
      path: '/ScenicView',
      name: 'ScenicView',
      component: ScenicView,
    },
    {
      path:'/AboutSite',
      name: '/AboutSite',
      component: AboutSite
    },
    {
      path:'/MyStats',
      name: 'MyStats',
      component: MyStats,
    },
    {
      path: '/MyJournal',
      name: 'MyJournal',
      component: MyJournal,
    },
    {
      path: '/DailyChallenge',
      name: 'DailyChallenge',
      component: DailyChallenge,
    }
  ],
})

export default router
