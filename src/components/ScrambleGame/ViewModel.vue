<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Terminology Twister Rules</h2>
      <p>Unscramble each word or abbrieviation! You have 60 seconds. Difficulty increases every three correct guesses
      </p>
      <p>Gold: 10 Words Guessed</p>
      <p>Silver: 5 Words Guessed </p>
      <p>Bronze: 3 Words Guessed</p>
      <button @click="startGame" class="button-info">Start Game</button>
    </div>
  </div>
  <div v-if="start" class="container">
    <h1 class="game-title">Terminology Twisters</h1>
    <div v-if="!gameOver">
      <p>Unscramble the word: {{ currentWord.scrambled }}</p>
      <input v-model="userInput" placeholder="Enter unscrambled word" @keyup.enter="checkAnswer"
        :class="{ shake: incorrect }" />
      <button @click="checkAnswer">Submit Guess</button>
      <button @click="skipWord">Skip</button>
      <p>Time remaining: {{ timeRemaining }}s</p>
      <p v-if="incorrect" class="incorrect-message">Incorrect</p>
      <p>Level: {{ level }}</p>
    </div>
    <div v-else class="game-over">
      <p>Game Over!</p>
      <p>Your Score: {{ score }}</p>
      <p v-if="medal">You earned the {{ medal }} medal</p>

      <!-- Show the list of words and definitions -->
      <div class ="definitions" v-if="wordList.length">
        <h3>Words and Definitions</h3>
        <ul :style="{ fontSize: fontSize }">
          <li v-for="(item, index) in wordList" :key="index">
            <strong>{{ item.word }}:</strong> {{ item.definition }}
          </li>
        </ul>
      </div>

      <button @click="startGame">Start Again</button>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
export default {
  data() {
    return {
      currentWord: { original: "", scrambled: "" },
      userInput: '',
      score: 0,
      timeRemaining: 20,
      gameOver: false,
      timer: null,
      incorrect: false,
      level: 1,
      medal: '',
      wordList: [],  // Array to store words and definitions,
      isActive: true,
      start: false,
    };
  },
  computed: {
    // Dynamically calculate font size based on wordList length
    fontSize() {
      const wordCount = this.wordList.length;
      if (wordCount <= 5) {
        return '18px'; // Default size for a small list
      } else if (wordCount <= 10) {
        return '16px'; // Slightly smaller font size
      } else if (wordCount <= 15) {
        return '14px'; // Further reduced font size
      } else {
        return '12px'; // Smallest font size for large lists
      }
    }
  },
  methods: {
    async fetchWord() {
      try {
        const response = await fetch(`http://localhost:3000/get-word?length=${this.level + 2}`);
        const data = await response.json();
        const randomWord = data.word;
        let definition = data.definition;

        // Truncate definition to only the first sentence
        if (definition) {
          const firstSentence = definition.split('.')[0];  // Get the part before the first period
          definition = firstSentence + (firstSentence ? '.' : '');  // Ensure it ends with a period
        }

        console.log(data, definition);
        this.currentWord = { original: randomWord, scrambled: this.scrambleWord(randomWord) };

        // Store word and truncated definition in wordList
        this.wordList.push({ word: randomWord, definition });
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    },
    scrambleWord(word) {
      return word.split("").sort(() => Math.random() - 0.5).join("");
    },
    startGame() {
      this.start = true;
      this.score = 0;
      this.gameOver = false;
      this.incorrect = false;  // Reset incorrect state
      this.level = 1;
      this.wordList = [];  // Clear word list when starting a new game
      this.nextWord();
      this.startTimer();
    },
    async nextWord() {
      await this.fetchWord();  // Fetch a new word and scramble it
      this.userInput = "";
      this.incorrect = false;  // Reset incorrect state
      if (this.score % 3 === 0 && this.score > 0) {
        this.level += 1;
      }
    },
    checkAnswer() {
      if (this.userInput.toLowerCase() == this.currentWord.original) {
        console.log('Correct guess');
        this.score += 1;
        this.nextWord();  // Get a new word after a correct answer
      } else {
        this.incorrect = true;  // Trigger incorrect state
      }
    },
    skipWord() {
      this.nextWord();  // Fetch a new word when skipped
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

        if (this.score > 9) this.medal = "gold", gold += 1;
        else if (this.score > 4) this.medal = "silver", silver += 1;
        else if (this.score > 2) this.medal = "bronze", bronze += 1;

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
      if (!this.$store.state.user) {
        console.log("No user logged in!");
        return;
      }
      const userId = this.$store.state.user.id;
      const gameName = 'Terminology Twisters';
      const userScore = this.score;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    startTimer() {
      this.timeRemaining = 20;
      this.timer = setInterval(() => {
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer);
          this.gameOver = true;
          this.updateAchievements()
          this.submitScoreToLeaderboard()
        }
      }, 1000);
    },
  },
  mounted() {
    //this.startGame();
  }, beforeUnmount() {
    this.isActive = false; // Prevent alerts when navigating away
    clearInterval(this.intervalId);
  },
  beforeRouteLeave(to, from, next) {
    this.isActive = false; // Ensure no alerts after leaving the route
    clearInterval(this.intervalId);
    next();
  },
};

</script>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* height: 40vh; */
  min-height: 40vh; /* Optional: set a minimum height, but let it grow */
  text-align: center;
  text-align: center;
  margin-top: 50px;
  font-family: Arial, sans-serif;
  text-align: center;
  margin: 20px auto;
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Info Screen Styles */
.info-screen {
  position: fixed;
  top: 145px;
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
}

.button-info:hover {
  background-color: #2980b9;
}

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

.game-over {
  margin-top: 20px;
  text-align: center;
}
.definitions {
  max-height: 200px; /* Set a maximum height to limit the container */
  overflow-y: auto; /* Enable vertical scrolling when the content overflows */
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
button {
  padding: 10px;
  background-color: #DFFF00;
  color: #8e44ad;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  margin-left: 5px;
  font-family: 'Arcade Classic', sans-serif;
  border-radius: 15px;
}

button:hover {
  background-color: rgb(160, 231, 160);
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(0);
  }
}

.incorrect-message {
  color: red;
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
}
</style>
