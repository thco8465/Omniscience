<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Copy Cat Rules</h2>
      <p>You have ten seconds to memorize each sequence! You then have 10 seconds to repeat it! Each level adds a
        character to memorize</p>
      <p>Gold: 7 Sequences Memorized</p>
      <p>Silver: 5 Sequences Memorized</p>
      <p>Bronze: 3 Sequences Memorized</p>
      <button class="button-info" @click="startGame">Start Game</button>
    </div>
  </div>
  <div v-if="start" class="memory-game">
    <h1 class="game-title">Copy Cat</h1>
    <div v-if="showSequence">
      <h2>Memorize the Sequence (Level {{ level }}):</h2>
      <p>{{ sequence }}</p>
    </div>
    <div v-if="showCountdown">
      <h2>Repeat the Sequence:</h2>
      <input v-model="userSequence" type="text" maxlength="20" />
      <p>Time remaining: {{ countdown }} seconds</p>
      <button v-if="!showResult" @click="checkSequence">Submit</button>
    </div>
    <div v-if="showResult">
      <h2>{{ resultMessage }}</h2>
      <div v-if="isCorrect">
        <button @click="nextLevel">Next Level</button>
      </div>
      <div v-else>
        <button @click="restartGame">Play Again</button>
      </div>
      <!-- Medal display based on score -->
      <div class="game-over">
        <p v-if="earnedMedal">Congratulations! You earned the {{ earnedMedal }} medal!</p>
        <p>Score: {{ score }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      start: false,
      sequence: '',
      userSequence: '',
      showSequence: false,
      showCountdown: false,
      showResult: false,
      resultMessage: '',
      level: 1,
      countdown: 10,
      countdownTimer: null,
      sequenceTimer: null,
      isCorrect: false,  // Track whether the submission was correct
      score: 0,
      earnedMedal: '', // Track the earned medal
    };
  },
  methods: {
    startGame() {
      this.start = true,
        this.sequence = this.generateSequence();
      this.showSequence = true;
      // Show sequence for 5 seconds
      this.sequenceTimer = setTimeout(() => {
        this.showSequence = false;
        this.startCountdown();
      }, 5000); // 5 seconds
    },
    generateSequence() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let generatedSequence = '';
      for (let i = 0; i < this.level + 2; i++) {  // Length increases with each level
        const randomIndex = Math.floor(Math.random() * characters.length);
        generatedSequence += characters[randomIndex];
      }
      return generatedSequence;
    },
    startCountdown() {
      this.showCountdown = true;
      this.countdown = 10; // Start with 10 seconds countdown
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          this.checkSequence();  // Automatically check when time runs out
        }
      }, 1000); // Update countdown every second
    },
    checkSequence() {
      clearInterval(this.countdownTimer); // Stop the countdown timer when checking the sequence
      if (this.userSequence.toLowerCase() === this.sequence.toLowerCase()) {
        this.resultMessage = 'Correct! You remembered the sequence.';
        this.isCorrect = true;  // Set to true if the answer is correct
        this.level++;  // Increase level on correct guess
        this.score++;
      } else {
        this.resultMessage = 'Incorrect! Start Over.';
        this.updateAchievements();
        this.submitScoreToLeaderboard();
        this.level = 1;
        this.isCorrect = false;  // Set to false if the answer is incorrect
        this.calculateMedal();  // Calculate medal after result
      }
      this.showResult = true;
    },
    nextLevel() {
      this.resetLevel();
      this.startGame();  // Restart the game for the next level
    },
    restartGame(){
      this.level = 1
      this.score = 0
      this.earnedMedal = ''
      this.resetLevel();
      this.startGame();
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

        if (this.score > 6) gold += 1;
        else if (this.score > 4) silver += 1;
        else if (this.score > 2) bronze += 1;

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
    calculateMedal() {
      if (this.score > 6) {
        this.earnedMedal = 'Gold';
      } else if (this.score > 4) {
        this.earnedMedal = 'Silver';
      } else if (this.score > 2) {
        this.earnedMedal = 'Bronze';
      }
    },
    resetLevel() {
      clearInterval(this.countdownTimer); // Clear any active timers
      clearTimeout(this.sequenceTimer); // Clear the sequence timer
      this.sequence = '';
      this.userSequence = '';
      this.showResult = false;
      this.resultMessage = '';
      this.showCountdown = false;
    },
    async submitScoreToLeaderboard() {
      if (!this.$store.state.user) {
        console.log("No user logged in!");
        return;
      }
      const userId = this.$store.state.user.id;
      const gameName = 'Copy Cat';
      const userScore = this.score;

      try {
        const response = await axios.post('/leaderboard/' + gameName, {
          user_id: userId,
          score: userScore,
        });

        console.log('Score submitted to leaderboard:', response.data);
      } catch (error) {
        console.error('Error submitting score to leaderboard:', error);
      }
    },
  },
};
</script>


<style scoped>
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

.memory-game {
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
  min-height: 80vh;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #007bff;
}

p {
  font-size: 24px;
  margin: 20px 0;
}

input {
  padding: 10px;
  font-size: 16px;
  width: 300px;
  margin-top: 20px;
  border-radius: 5px;
  border: 1px solid #007bff;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #0056b3;
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
