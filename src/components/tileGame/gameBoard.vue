<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Tiles of Terror</h2>
      <div v-if="$route.query.daily?.toLowerCase() === 'true'">
        <p>Modification Name: {{ challengeName }}</p>
        <p>Modification Description: {{ challengeDescription }}</p>
      </div>
      <p v-else>Match the Tiles! Each level adds a letter. You have 60 seconds per level</p>
      <p>Gold: 7 Levels Passed</p>
      <p>Silver: 5 Levels Passed </p>
      <p>Bronze: 3 Levels Passed</p>
      <button @click="startGame" :disabled="!canStart" class="button-info">Start Game</button>
    </div>
  </div>

  <!-- End Game Screen -->
  <div v-if="gameOver" class="end-screen">
    <div class="end-content">
      <h2>Game Over</h2>
      <p>Your final score: {{ score }}</p>
      <p>Levels completed: {{ level - 1 }}</p>
      <p v-if="medal">Congratulations, you earned a {{ medal }} medal!</p>
      <button @click="startGame" class="button-info">Play Again</button>
    </div>
  </div>

  <div v-if="endStage" class="end-screen">
    <div class="end-content">
      <h2>Stage Over</h2>
      <h2>Level {{ level }} complete!</h2>
      <h2 v-if="challengeName == 'Time Crunch'">
        Complete in {{ 30 - timer }} seconds!
      </h2>
      <h2 v-else>Complete in {{ 60 - timer }} seconds!</h2>
      <button @click="startNewStage" class="button-info">Start Next Stage</button>
    </div>
  </div>

  <div class="game-board" v-if="!gameOver && start && modsLoaded">
    <h1 class="game-title">Tiles of Terror</h1>
    <div class="timer-container">
      <div class="level">Level: {{ level }}</div>
      <div class="timer">Time: {{ formattedTime }}</div>
      <div class="score">Score: {{ score }}</div>
      <div v-if="medal" class="game-over">Congratulations, you earned a {{ medal }} medal</div>
    </div>
    <div class="cards-container" ref="cardsContainer">
      <Card v-for="(card, index) in cards" :key="index" :is-flipped="card.flipped" :is-matched="card.matched"
        class="card" @flip="debouncedFlipCard(index)">
        {{ card.value }}
      </Card>
    </div>
  </div>
</template>

<script>
import Card from './MyCard.vue';
import Observer from './MyObserver.js'; // Import the Observer class
import _debounce from 'lodash-es/debounce';
import axios from 'axios';
export default {
  components: {
    Card,
  },
  data() {
    return {
      cards: [],
      flippedCards: [],
      timer: 60,
      intervalId: null,
      observer: new Observer(), // Instantiate the Observer
      debouncedFlipCard: _debounce(this.flipCard, 200),
      level: 1,
      score: 0,
      medal: null,
      isActive: true,
      start: false,
      gameOver: false, // New property to track game over state,
      endStage: false,
      challengeName: '',
      challengeDescription: '',
      imposterActive: false,
      modifiers: {},
      tilesMoveActive: false,
      tilesShuffleIntervalId: null,
      isFlipping: false,
      modsLoaded: false,
    };
  },

  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    canStart() {
      return this.modsLoaded;
    }
  },
  methods: {
    async loadModifiers() {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const res = await axios.get(`${API_URL}/challenge/daily`);
        const challenge = res.data;
        console.log("Loaded Tiles of Terror challenge:", challenge);

        if (challenge && challenge.game === "Tiles of Terror" && challenge.variation) {
          this.challengeName = challenge.variation || '';
          this.challengeDescription = challenge.goal || '';
          this.applyModifiers();
        }
      } catch (err) {
        console.error("Failed to fetch challenge modifiers", err);
      }
      this.modsLoaded = true
    },
    applyModifiers() {
      if (this.challengeName == "Time Crunch") {
        this.timer = 30;
      }

      if (this.challengeName == "Extra Imposter") {
        this.imposterActive = true;
      }
      if (this.challengeName == "Shifty Tiles") {
        this.tilesMoveActive = true;
        this.startTileShuffling();
      }
    },
    async startGame() {
      // Reset all game state variables
      this.level = 1;
      this.start = true;
      this.score = 0;
      this.timer = this.getTimerForChallenge();
      this.medal = null;
      this.gameOver = false;
      this.cards = [];
      this.flippedCards = [];
      this.endStage = false


      // Wait until modifiers are loaded
      if (!this.modsLoaded) {
        await this.loadModifiers();
      }

      // Reset the game board layout
      const cardsContainer = document.querySelector('.cards-container');
      if (cardsContainer) {
        cardsContainer.style.gridTemplateColumns = ''; // Reset grid layout
        cardsContainer.style.gridTemplateRows = ''; // Reset grid layout
      }
      clearInterval(this.tileShuffleIntervalId);
      // Start a new level
      this.startNewLevel();
    },
    getTimerForChallenge() {
      return this.challengeName === "Time Crunch" ? 30 : 60;
    },
    shuffleCards(level) {
      //If challenge name = extra imposter then there should be one extra tile that will not be matched and has '!' on its face
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      let selectedLetters = letters.slice(0, level + 3); // Use letters up to the current level
      let pairs = selectedLetters.flatMap(letter => [
        { value: letter, flipped: false, matched: false },
        { value: letter, flipped: false, matched: false }
      ]);

      // Defensive check to avoid double-adding imposter
      if (this.imposterActive && !pairs.some(card => card.value === '!')) {
        pairs.push({ value: '!', flipped: false, matched: false });
      }


      const totalPairs = pairs.length;
      const columns = Math.min(4 + Math.floor(totalPairs / 10), 6); // Increase columns dynamically but max out at 6
      const rows = Math.ceil(totalPairs / columns); // Increase rows instead of columns

      this.$nextTick(() => {
        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        cardsContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      });

      //return pairs.sort(() => Math.random() - 0.5);
      return this.shuffleArray(pairs)
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    flipCard(index) {
      if (this.cards[index].flipped || this.flippedCards.length >= 2) return;
      this.cards[index].flipped = true;
      this.flippedCards.push(index);

      this.isFlipping = true;

      if (this.flippedCards.length === 2) {
        // Temporarily disable clicking to prevent fast interactions
        this.$nextTick(() => {
          const cardsContainer = this.$refs.cardsContainer;
          if (cardsContainer) {
            cardsContainer.style.pointerEvents = "none";
          }
        });

        setTimeout(() => {
          this.checkMatch();
          const cardsContainer = this.$refs.cardsContainer;
          if (cardsContainer) {
            cardsContainer.style.pointerEvents = "auto"; // Re-enable clicking after checking
          }
          this.isFlipping = false;
        }, 1000);
      }
    },
    startTileShuffling() {
      this.tileShuffleIntervalId = setInterval(() => {
        if (this.isFlipping || this.flippedCards.length > 0) {
          // Don't shuffle while user is interacting with cards
          return;
        }

        console.log('Shuffling Tiles');
        this.cards = [...this.cards].sort(() => Math.random() - 0.5);

        // Add animation class to each card after shuffling
        const cardsElements = document.querySelectorAll('.card');
        cardsElements.forEach((card) => {
          card.classList.remove('shuffled');  // Remove any previous shuffle class
          void card.offsetWidth; // Trigger reflow
          card.classList.add('shuffled');     // Add shuffle animation
        });
      }, 4000);
    },
    checkMatch() {
      const [index1, index2] = this.flippedCards;
      if (this.cards[index1].value === this.cards[index2].value) {
        this.cards[index1].matched = true;
        this.cards[index2].matched = true;
        this.score += 2;
      } else {
        this.cards[index1].flipped = false;
        this.cards[index2].flipped = false;
        this.decrementTimer(1);
      }

      this.flippedCards = [];

      if (this.allCardsMatched()) {
        clearInterval(this.intervalId);
        //alert(`Congratulations, level ${this.level} complete in ${60 - this.timer} seconds!`);
        this.endStage = true
        // this.level++;
        // this.startNewLevel();
      }
    },
    startNewStage() {
      this.endStage = false
      this.level++;
      clearInterval(this.tileShuffleIntervalId);
      this.startNewLevel();
    },
    allCardsMatched() {
      return this.cards
        .filter(card => card.value !== '!')  // ignore imposter
        .every(card => card.matched);
    },
    startNewLevel() {
      this.cards = this.shuffleCards(this.level);
      this.flippedCards = [];
      if (this.tilesMoveActive) {
        this.startTileShuffling();
      }
      //If challengename = Time Crunch the timer should be set to 30
      this.timer = this.getTimerForChallenge();
      this.startTimer();
      this.observer.notify(this.level);
    },
    startTimer() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.intervalId = setInterval(() => {
        this.decrementTimer(1);
      }, 1000);
    },
    decrementTimer(seconds) {
      this.timer -= seconds;
      if (this.timer == 0) {
        clearInterval(this.intervalId);
        clearInterval(this.tileShuffleIntervalId);
        this.gameOver = true;
        this.updateAchievements();
        this.submitScoreToLeaderboard();
      }
      //this.observer.notify(this.timer); // Notify observers when the timer changes
    },
    async updateAchievements() {
      if (!this.$store.state.user) {
        console.log("No user in store");
        return;
      }

      const userId = this.$store.state.user.id;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        // Fetch current achievements from the database
        const response = await axios.get(`${API_URL}/achievements/${userId}`);
        const currentAchievements = response.data || { score: 0, bronze: 0, silver: 0, gold: 0 };
        // Calculate medals based on the current session's score
        let bronze = currentAchievements.bronze;
        let silver = currentAchievements.silver;
        let gold = currentAchievements.gold;

        if (this.level > 6) this.medal = "gold", gold += 1;
        else if (this.level > 4) this.medal = "silver", silver += 1;
        else if (this.level > 2) this.medal = "bronze", bronze += 1;

        // Update achievements in the database by adding new values
        await axios.post(`${API_URL}/achievements/${userId}`, {
          score: currentAchievements.score + this.score,  // Add new score to existing score
          bronze,
          silver,
          gold,
        });

        console.log("Achievements updated successfully");
      } catch (error) {
        console.log("Error updating achievements:", error);
      }
    },
    async submitScoreToLeaderboard() {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (!this.$store.state.user) {
        console.log("No user logged in!");
        return;
      }
      const userId = this.$store.state.user.id;
      const gameName = 'Tiles of Terror';
      const userScore = this.score;

      try {
        const response = await axios.post(`${API_URL}/leaderboard/` + gameName, {
          user_id: userId,
          score: userScore,
        });

        console.log('Score submitted to leaderboard:', response.data);
      } catch (error) {
        console.error('Error submitting score to leaderboard:', error);
      }
    },
  },
  async mounted() {
    //this.startNewLevel();
    // Subscribe to the observer to perform actions when the timer changes
    if (this.$route.query.daily?.toLowerCase() === "true") {
      await this.loadModifiers()

    } else {
      this.modsLoaded = true
    }
    this.observer.subscribe((newTime) => {
      // Perform actions when the timer changes (e.g., update UI, trigger events)
      console.log(`Timer changed: ${newTime} seconds`);
    });
  },
  beforeUnmount() {
    this.isActive = false; // Prevent alerts when navigating away
    clearInterval(this.intervalId);
    clearInterval(this.tileShuffleIntervalId);

  },
  beforeRouteLeave(to, from, next) {
    this.isActive = false; // Ensure no alerts after leaving the route
    clearInterval(this.intervalId);
    clearInterval(this.tileShuffleIntervalId);
    next();
  },
};
</script>

<style scoped>
.game-title {
  color: #f7c948;
  text-shadow: 1px 1px 1px black, -1px 0 3px #002823;
  font-family: 'Libre Baskerville', serif;
  background-color: rgba(142, 68, 173, .5);
  /* Transparent background */
  border-radius: 15px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  padding: 15px;
  font-size: 30px;
  margin-bottom: 20px;
  margin-top: 0px;
}

.game-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  /* Changed to ensure it grows as needed */
  min-height: 65vh;
  /* Minimum height */
  padding: 20px;
  font-family: Arial, sans-serif;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  background-color: rgba(74, 144, 226, .5);
  /* Fully transparent background */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: visible;
  /* Allow overflow */
}

/* Info Screen Styles */
.info-screen {
  position: fixed;
  top: 100px;
  left: 0;
  width: 100%;
  height: 80%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  transition: opacity 0.5s ease;
}


.info-content {
  text-align: center;
  max-width: 400px;
}

.info-content h2 {
  font-size: 32px;
  margin-bottom: 20px;
}

.info-content p {
  font-size: 18px;
  margin-bottom: 30px;
}

.button-info {
  padding: 15px 30px;
  background-color: #3498db;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 1s ease
}

.button-info:hover {
  background-color: #2980b9;
}

.timer-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.level,
.timer,
.score {
  font-weight: bold;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  /* Start with 4 columns */
  grid-auto-rows: 1fr;
  /* Allow rows to grow dynamically */
  grid-gap: 10px;
  justify-items: center;
  width: 100%;
  margin-top: 10px;
  background-color: rgba(221, 221, 221, .5);
  /* Fully transparent background */
  /* Light gray background to differentiate cards */
  padding: 20px;
  border-radius: 10px;
  box-sizing: border-box;
  /* Ensures padding is included in the total width */
  overflow-y: auto;
  max-height: 500px
}

.cards-container {
  width: 100%;
  max-width: 100%;
  /* Ensure it takes full width but no more than the parent */
  margin-left: auto;
  margin-right: auto;
}

.game-over {
  text-align: center;
  margin-top: 20px;
  font-size: 24px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  margin: 20px auto;
}

.end-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  /* Ensure it appears above the game board */
}

.end-content {
  text-align: center;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
}

.end-content h2 {
  font-size: 36px;
  color: #333;
}

.end-content p {
  font-size: 20px;
  color: #555;
}

.end-content button {
  margin-top: 20px;
  padding: 15px 30px;
  background-color: #3498db;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.end-content button:hover {
  background-color: #2980b9;
}

@keyframes shuffle-animation {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }

  25% {
    transform: translate(-10px, -10px);
    opacity: 0.7;
  }

  50% {
    transform: translate(10px, 10px);
    opacity: 0.9;
  }

  75% {
    transform: translate(-10px, 10px);
    opacity: 0.7;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}

.card {
  transition: all 0.3s ease;
  animation: shuffle-animation 0.5s ease-in-out;
}

.card.shuffled {
  animation: shuffle-animation 0.5s ease-in-out;
}
</style>