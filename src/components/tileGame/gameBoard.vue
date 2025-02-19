<!-- used to observe changes in the timer value. The timer value is incremented 
every second, and subscribers are notified when the timer changes. -->
<template>
  <div class="game-board">
    <h1 class="game-title">Tiles of Terror</h1>
    <div class="timer-container">
      <div class="level">Level: {{ level }}</div>
      <div class="timer">Time: {{ formattedTime }}</div>
      <div class="score">Score: {{ score }}</div>
      <div v-if="medal" class="game-over">Congratulations, you earned a {{ medal }} medal</div>
    </div>
    <div class="cards-container">
      <Card v-for="(card, index) in cards" :key="index" :is-flipped="card.flipped" :is-matched="card.matched"
        @flip="debouncedFlipCard(index)">
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
      debouncedFlipCard: _debounce(this.flipCard, 200), // Adjust the debounce delay as needed
      level: 1,
      score: 0,
      medal: '',
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
  },
  methods: {
    shuffleCards(level) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      let selectedLetters = letters.slice(0, level + 3); // Use letters up to the current level
      let pairs = selectedLetters.flatMap(letter => [
        { value: letter, flipped: false, matched: false },
        { value: letter, flipped: false, matched: false }
      ]);

      const columns = Math.min(level * 2, 6); // Max columns set to 6 to prevent extreme widening
      this.$nextTick(() => {
        document.querySelector('.cards-container').style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      });

      return pairs.sort(() => Math.random() - 0.5);
    },
    flipCard(index) {
      if (this.cards[index].flipped || this.flippedCards.length >= 2) return;
      this.cards[index].flipped = true;
      this.flippedCards.push(index);

      if (this.flippedCards.length === 2) {
        // Temporarily disable clicking to prevent fast interactions
        this.$nextTick(() => {
          this.$el.style.pointerEvents = "none";
        });

        setTimeout(() => {
          this.checkMatch();
          this.$el.style.pointerEvents = "auto"; // Re-enable clicking after checking
        }, 1000)
      }
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
        alert(`Congratulations, level ${this.level} complete in ${this.formattedTime} seconds!`);
        this.level++;
        this.startNewLevel();
      }
    },
    allCardsMatched() {
      return this.cards.every((card) => card.matched);
    },
    startNewLevel() {
      this.cards = this.shuffleCards(this.level);
      this.flippedCards = [];
      this.timer = 60;
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
      if (this.timer <= 0) {
        clearInterval(this.intervalId);
        alert("Time's up! Game over.");
        this.updateAchievements();
      }
      //this.observer.notify(this.timer); // Notify observers when the timer changes
    },
    async updateAchievements() {
      if (!this.$store.state.user) {
        console.log("No user in store");
        return;
      }

      const userId = this.$store.state.user.id;

      try {
        // Fetch current achievements from the database
        const response = await axios.get(`/achievements/${userId}`);
        const currentAchievements = response.data || { score: 0, bronze: 0, silver: 0, gold: 0 };

        // Calculate medals based on the current session's score
        let bronze = currentAchievements.bronze;
        let silver = currentAchievements.silver;
        let gold = currentAchievements.gold;

        if (this.level > 6) this.medal = "gold", gold += 1;
        else if (this.score > 4) this.medal = "silver", silver += 1;
        else if (this.score > 2) this.medal = "bronze", bronze += 1;

        // Update achievements in the database by adding new values
        await axios.post(`/achievements/${userId}`, {
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
  },
  mounted() {
    this.startNewLevel();
    // Subscribe to the observer to perform actions when the timer changes
    this.observer.subscribe((newTime) => {
      // Perform actions when the timer changes (e.g., update UI, trigger events)
      console.log(`Timer changed: ${newTime} seconds`);
    });
  },
};
</script>
<style scoped>
.game-title {
  color: gold;
  text-shadow: 1px 1px 1px white, -1px 0 3px #002823;
  font-family: 'Libre Baskerville', serif;
  background-color: #2c3e50;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  width: 500px;
}

/* Add your styles for the game board */
.game-board {
  display: flex;
  flex-direction: column;
  /* Stack title, timer, and cards vertically */
  align-items: center;
  /* Center horizontally */
  justify-content: center;
  /* Center vertically */
  height: 100vh;
  /* Full screen height */
  margin-top: 35px;
}

.timer-container {
  grid-column: span 4;
  /* Span the full width of the grid */
  margin-bottom: 10px;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  /* Adjust tile size as needed */
  grid-gap: 10px;
  justify-content: center;
  max-width: 90vw;
  /* Prevents it from expanding too much */
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
}
</style>