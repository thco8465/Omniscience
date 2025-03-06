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
  { name: 'Hangman', route: '/HangView' },
  { name: 'Alpha Arena', route: '/AlphaArena' },
  { name: 'Terminology Twisters', route: '/Scramble' },
  { name: 'Click-a-Palooza', route: '/ShapeClicker' },
  { name: 'Tiles of Terror', route: '/Tiles' },
  { name: 'Copy Cat', route: '/Repeater' },
  {name: 'Twenty One', route: '/TwentyOne'},
];
</script>

<template>
  <main>
    <!-- Display message only if userId is falsy (user not logged in) -->
    <h1 v-if="!userId">Create an account and login to earn medals, save progress, and customize your profile!</h1>

    <!-- Game Grid -->
    <div class="game-grid">
      <div v-for="(game, index) in games" :key="index" class="game-card">
        <h2>{{ game.name }}</h2>
        <button @click="navigateToGame(game.route)">Play</button>
      </div>
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Each game card */
.game-card {
  border: 2px solid #4caf50;
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
}

.game-card button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.game-card button:hover {
  background-color: #45a049;
}
</style>
