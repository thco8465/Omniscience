<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Terminology Twister Rules</h2>
      <div v-if="$route.query.daily === 'true'" class="daily-challenge-banner">
        <h2 class="daily-name">Daily Challenge: {{ challengeName }}</h2>
        <p class="daily-description">{{ challengeDescription }}</p>
      </div>
      <div v-else>
        <p>Unscramble each word or abbrieviation! You have 60 seconds. Difficulty increases every three correct guesses
        </p>
      </div>
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
      <div class="definitions" v-if="wordList.length">
        <h3>Words and Definitions</h3>
        <ul :style="{ fontSize: fontSize }">
          <li v-for="(item, index) in wordList" :key="index">
            <strong>{{ item.word }}</strong>
            <span v-if="item.definition.match(/^\w+/)">
              ({{ item.definition.match(/^\w+/)[0] }})
            </span>:
            {{ item.definition.replace(/^\w+\s*/, '') }}
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
      modifiers: {},
      challengeName: '',
      challengeDescription: '',
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
    async loadModifiers() {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const res = await axios.get(`${API_URL}/challenge/daily`);
        const challenge = res.data;
        console.log("Loaded challenge:", challenge);

        if (challenge && challenge.game === "Terminology Twisters" && challenge.variation) {
          this.challengeName = challenge.name || '';
          this.challengeDescription = challenge.description || '';

          const modifierObj = JSON.parse(challenge.variation);
          this.modifiers = modifierObj;

          this.applyModifiers(); // Apply things like timer or wordCount
        }
      } catch (err) {
        console.error("Failed to fetch challenge modifiers", err);
      }
    },
    async fetchWord() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const wordCount = this.modifiers.wordCount || 1;

        let allWords = [];
        for (let i = 0; i < wordCount; i++) {
          const response = await fetch(`${API_URL}/get-word?length=${this.level + 2}`);
          const data = await response.json();
          let definition = data.definition || '';
          if (definition) {
            const firstSentence = definition.split('.')[0];
            definition = firstSentence + (firstSentence ? '.' : '');
          }
          allWords.push({ word: data.word, definition });
        }

        const combinedWord = allWords.map(w => w.word).join('');
        const combinedScrambled = this.scrambleWord(combinedWord);

        this.currentWord = { original: combinedWord, scrambled: combinedScrambled };

        allWords.forEach(entry => {
          this.wordList.push({ word: entry.word, definition: entry.definition });
        });

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

      // Apply modifier-based timer if available
      if (this.$route.query.daily == "true" && this.modifiers.timer && this.modifiers.timeLimitSeconds) {
        this.timeRemaining = this.modifiers.timeLimitSeconds;
      } else {
        this.timeRemaining = 60;
      }

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
      if (this.userInput.trim().toLowerCase() === this.currentWord.original.toLowerCase()) {
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
    if (this.$route.query.daily == "true") {
      console.log('mods loaded')
      this.loadModifiers()
    }
  },
  beforeUnmount() {
    this.isActive = false; // Prevent alerts when navigating away
    clearInterval(this.timer);
  },
  beforeRouteLeave(to, from, next) {
    this.isActive = false; // Ensure no alerts after leaving the route
    clearInterval(this.timer);
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
  min-height: 40vh;
  /* Optional: set a minimum height, but let it grow */
  text-align: center;
  margin-top: 50px;
  font-family: Arial, sans-serif;
  margin: 20px auto;
  background-color: rgba(247, 201, 72, 0.8);
  /* Transparent yellow (#f7c948) with 80% opacity */
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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

.daily-challenge-banner {
  background-color: #fff3cd;
  border-left: 5px solid #ffc107;
  padding: 10px;
  margin: 10px 0 20px;
  border-radius: 5px;
}

.daily-name {
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 5px;
}

.daily-description {
  margin: 0;
  font-size: 1em;
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
  background-color: rgba(52, 152, 219, 0.8);
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.button-info:hover {
  background-color: rgba(41, 128, 185, 0.8);
  /* Darker blue on hover */
}

.game-title {
  color: rgba(247, 201, 72, 0.8);
  /* Transparent yellow with 80% opacity */
  text-shadow: 1px 1px 1px black, -1px 0 3px #002823;
  font-family: 'Libre Baskerville', serif;
  background-color: rgba(142, 68, 173, 0.8);
  /* Transparent purple (#8e44ad) with 80% opacity */
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
  max-height: 200px;
  overflow-y: auto;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(142, 68, 173, 0.8);
  /* Transparent purple border */
  text-align: left;
}


button {
  padding: 10px;
  background-color: rgba(142, 68, 173, 0.8);
  /* Transparent purple (#8e44ad) with 80% opacity */
  color: rgba(247, 201, 72, 0.8);
  /* Transparent yellow text with 80% opacity */
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  margin-left: 5px;
  font-family: 'Arcade Classic', sans-serif;
  border-radius: 15px;
  transition: background-color 1s ease, opacity 1s ease;
}

button:hover {
  background-color: rgba(74, 144, 226, 0.8);
  /* Transparent blue on hover (#4a90e2) */
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
