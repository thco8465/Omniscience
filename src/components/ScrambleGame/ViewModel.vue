<template>
  <div class="container">
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
      timeRemaining: 60,
      gameOver: false,
      timer: null,
      incorrect: false,
      level: 1,
      medal: '',
    };
  },
  methods: {
    async fetchWord() {
      try {
        const response = await fetch(`http://localhost:3000/get-word?length=${this.level + 2}`);
        const data = await response.json();
        const randomWord = data.word;
        console.log(data);
        this.currentWord = { original: randomWord, scrambled: this.scrambleWord(randomWord) };
      } catch (error) {
        console.error("Error fetching word:", error);
      }
    },
    scrambleWord(word) {
      return word.split("").sort(() => Math.random() - 0.5).join("");
    },
    startGame() {
      this.score = 0;
      this.gameOver = false;
      this.incorrect = false;  // Reset incorrect state
      this.level = 1;
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
        console.log('Correct guess')
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

      try {
        // Fetch current achievements from the database
        const response = await axios.get(`/achievements/${userId}`);
        const currentAchievements = response.data || { score: 0, bronze: 0, silver: 0, gold: 0 };

        // Calculate medals based on the current session's score
        let bronze = currentAchievements.bronze;
        let silver = currentAchievements.silver;
        let gold = currentAchievements.gold;

        if (this.score > 9) this.medal = "gold", gold += 1;
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
    startTimer() {
      this.timeRemaining = 60;
      this.timer = setInterval(() => {
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer);
          this.gameOver = true;
        }
      }, 1000);
      this.updateAchievements()
    },
  },
  mounted() {
    this.startGame();
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
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
