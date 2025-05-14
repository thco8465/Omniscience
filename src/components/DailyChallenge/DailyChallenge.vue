<template>
  <div class="daily-challenge-wrapper">
    <h1>🎯 Daily Challenge</h1>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="challenge-card">
      <h2>{{ challenge.game }}</h2>
      <p><strong>Variation:</strong> {{ challenge.variation }}</p>
      <p><strong>Goal:</strong> {{ challenge.goal }}</p>
      <p><strong>Reward:</strong> 🧠 x{{ challenge.reward }}</p>

      <div class="streak-info">
        <p>🔥 Streak: {{ status.streak }} day<span v-if="status.streak !== 1">s</span></p>
        <p v-if="status.todayComplete" class="complete-msg">✅ Challenge completed today!</p>
      </div>

      <div class="buttons">
        <button @click="goToGame">Start Challenge</button>
        <button v-if="!status.todayComplete" @click="markComplete">Mark as Complete</button>
      </div>

      <p class="countdown">🕒 New challenge in: {{ countdown }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const challenge = ref({})
const status = ref({ streak: 0, todayComplete: false })
const loading = ref(true)
const countdown = ref('')
const store = useStore()
const router = useRouter()

const userId = computed(() => store.state.user?.id)

onMounted(() => {
  if (!userId.value) return
  fetchChallenge()
  fetchStatus()
  startCountdown()
})

async function fetchChallenge() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  try {
    console.log('try')
    const res = await axios.get(`${API_URL}/challenge/daily`)
    challenge.value = res.data
    console.log(res.data)
  } catch (err) {
    console.error('Failed to fetch challenge', err)
  } finally {
    loading.value = false
  }
}

async function fetchStatus() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  try {
    const res = await axios.get(`${API_URL}/challenge/daily/status/${userId.value}`)
    status.value = res.data
  } catch (err) {
    console.error('Failed to fetch status', err)
  }
}

async function markComplete() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  try {
    await axios.post(`${API_URL}/challenge/daily/complete`, { userId: userId.value })
    await fetchStatus()
  } catch (err) {
    console.error('Failed to mark complete', err)
  }
}

function goToGame() {
  const route = getGameRoute(challenge.value.game)
  if (route) {
    router.push({ path: route, query: { daily: 'true' } });
  }
}

function getGameRoute(gameName) {
  const routes = {
    'Hangman': '/HangView',
    'Terminology Twisters': '/Scramble',
    'Click-a-Palooza': '/ShapeClicker',
    'Tiles of Terror': '/Tiles',
    'Copy Cat': '/Repeater',
    'Twenty One': '/TwentyOne',
    'Key Clash Single': '/KeyClashSingle'
  }
  return routes[gameName] || '/'
}

// Countdown to next midnight
function startCountdown() {
  const update = () => {
    const now = new Date()
    const next = new Date()
    next.setDate(now.getDate() + 1)
    next.setHours(0, 0, 0, 0)

    const diff = next - now
    const hrs = Math.floor(diff / 1000 / 60 / 60)
    const mins = Math.floor((diff / 1000 / 60) % 60)
    const secs = Math.floor((diff / 1000) % 60)
    countdown.value = `${hrs}h ${mins}m ${secs}s`
  }

  update()
  setInterval(update, 1000)
}
</script>

<style scoped>
.daily-challenge-wrapper {
  max-width: 600px;
  margin: auto;
  text-align: center;
}

.challenge-card {
  background: #fdfdfd;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px #ddd;
}

.streak-info {
  margin-top: 1rem;
  font-weight: bold;
}

.complete-msg {
  color: green;
}

.countdown {
  margin-top: 1.5rem;
  font-style: italic;
  color: #555;
}

.buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  background: #4caf50;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #388e3c;
}
</style>