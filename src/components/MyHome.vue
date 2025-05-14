<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
// Access the store to get the userId
const store = useStore();
const userId = store.state.user?.id; // Use optional chaining to avoid errors if user is undefined

// Use router to navigate to the selected game route
const router = useRouter();

const navigateToGame = (route) => {
  router.push(route);
};
// Define the games list
const games = [
  {name: 'Daily Challenge', route: '/DailyChallenge'},
  { name: 'Hangman', route: '/HangView' },
  { name: 'Alpha Arena', route: '/AlphaArena' },
  { name: 'Alpha Arena(Quickplay)', route: '/AlphaOnline' },
  { name: 'Alpha Arena (Custom)', route: '/AlphaRoom' },
  { name: 'Terminology Twisters', route: '/Scramble' },
  { name: 'Click-a-Palooza', route: '/ShapeClicker' },
  { name: 'Tiles of Terror', route: '/Tiles' },
  { name: 'Copy Cat', route: '/Repeater' },
  { name: 'Twenty One', route: '/TwentyOne' },
  { name: 'Key Clash(Single)', route: '/KeyClashSingle' },
  { name: 'Key Clash (local two-player)', route: '/KeyClash' },
  { name: 'Key Clash Online (Quickplay)', route: '/KeyClashOnline' },
  { name: 'Key Clash Online (Custom)', route: '/KeyClashInvite' },
];
</script>

<template>
  <main>
    <!-- Display message only if userId is falsy (user not logged in) -->
    <h1 v-if="!userId">Create an account and login to earn medals, save progress, and customize your profile!</h1>
    <!-- Game Grid -->
    <div class="game-grid">
      <template v-for="(game, index) in games" :key="index">
        <!-- If not signed in, Key Clash Online(Custom), Alpha Arena (Custom) -->
        <div
          v-if="!(game.name === 'Key Clash Online (Custom)' && !userId || game.name === 'Alpha Arena (Custom)' && !userId)"
          class="game-card">
          <h2>{{ game.name }}</h2>
          <button @click="navigateToGame(game.route)">
            Play
          </button>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-family: 'Libre Baskerville', serif;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: rgba(51, 51, 51, 0.9);
  background-color: rgba(244, 244, 244, 0.9);
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 5px solid rgba(76, 175, 80, 0.8);
  transition: transform 0.3s ease;
}

h1:hover {
  transform: translateY(-5px);
}

h1:before {
  content: '⚡ ';
  font-size: 1.2rem;
  color: rgba(76, 175, 80, 0.8);
}

/* Style for the main content */
main {
  text-align: center;
  margin-top: 30px;
}

/* Game Grid layout */
.game-grid {
  display: flex;
  flex-wrap: wrap;
  /* Allows wrapping to the next row when needed */
  justify-content: center;
  /* Centers items horizontally */
  gap: 20px;
  /* Space between game cards */
  padding: 20px;
  padding-left: 80px;
}

/* Each game card */
.game-card {
  width: 200px;
  /* Fixed width to maintain uniform size */
  flex: 1 1 auto;
  /* Allows cards to adjust within available space */
  max-width: 250px;
  /* Prevents overly large cards on wide screens */
  border: 2px solid rgba(142, 68, 173, 0.8);
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(249, 249, 249, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.8);
}

.game-card h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: rgba(74, 144, 226, 0.9);
}

.game-card button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: rgba(74, 144, 226, 0.6);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.game-card button:hover {
  background-color: rgba(69, 160, 73, 0.6);
}

.blue {
  background-color: rgba(74, 144, 226, 0.8);
}

.green {
  background: rgba(80, 200, 120, 0.8);
}

.yellow {
  background-color: rgba(247, 201, 72, 0.8);
}

.red {
  background-color: rgba(230, 57, 70, 0.8);
}

.purple {
  background-color: rgba(142, 68, 173, 0.8);
}
</style>
