<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref } from "vue";

const isOpen = ref(false);

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
  { name: 'Hangman', route: '/HangView' },
  { name: 'Alpha Arena', route: '/AlphaArena' },
  { name: 'Alpha Arena(Quickplay)', route: '/AlphaOnline' },
  {name: 'Alpha Arena (Custom)', route: '/AlphaRoom'},
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
    <div class="color-container">
      <button @click="isOpen = !isOpen" class="dropdown-button">
        {{ isOpen ? "Hide Color Impact" : "Show Color Impact" }}
      </button>

      <div v-if="isOpen" class="color">
        <h1>Color Impact on Cognition</h1>
        <h2 class="blu">🔵 Blue - Enhances Focus & Productivity</h2>
        <h2 class="gree">🟢 Green - Supports Balance & Learning</h2>
        <h2 class="yello">🟡 Yellow - Stimulates Attention & Creativity</h2>
        <h2 class="re">🔴 Red - Boosts Alertness & Emotion-Driven Memory</h2>
        <h2 class="purpl">🟣 Purple - Aids in Problem-Solving & Retention</h2>
      </div>
    </div>
    <!-- Game Grid -->
    <div class="game-grid">
      <template v-for="(game, index) in games" :key="index">
      <!-- If not signed in, Key Clash Online(Custom), Alpha Arena (Custom) -->
        <div v-if="!(game.name === 'Key Clash Online (Custom)' || game.name === 'Alpha Arena (Custom)' && !userId)" class="game-card">
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: #333;
  background-color: #f4f4f4;
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #4caf50;
  transition: transform 0.3s ease;
}
.dropdown-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
}

.dropdown-button:hover {
  background-color: #2980b9;
}
.color {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
h1:hover {
  transform: translateY(-5px);
}

h1:before {
  content: '⚡ ';
  font-size: 1.2rem;
  color: #4caf50;
}

/* Style for the main content */
main {
  text-align: center;
  margin-top: 30px;
}

/* Game Grid layout */
.game-grid {
  display: flex;
  flex-wrap: wrap;  /* Allows wrapping to the next row when needed */
  justify-content: center; /* Centers items horizontally */
  gap: 20px; /* Space between game cards */
  padding: 20px;
}

/* Each game card */
.game-card {
  width: 200px; /* Fixed width to maintain uniform size */
  flex: 1 1 auto; /* Allows cards to adjust within available space */
  max-width: 250px; /* Prevents overly large cards on wide screens */
  border: 2px solid #8e44ad;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.game-card h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #4a90e2;
}
.game-card button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.game-card button:hover {
  background-color: #45a049;
}

.blue {
  background-color: #4a90e2;
}

.green {
  background: #50c878;
}

.yellow {
  background-color: #f7c948;
}

.red {
  background-color: #e63946;
}

.purple {
  background-color: #8e44ad;
}
</style>
