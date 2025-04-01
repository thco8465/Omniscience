<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Alpha Arena Rules</h2>
      <p>Guess each letter of the word to win! Green= present + correct placement, yellow = present, red = wrong</p>
      <p>Gold: All Words Guessed</p>
      <p>Silver: 3 Words Guessed </p>
      <p>Bronze: 2 Words Guessed</p>
      <button @click="startGame" class="button-info">Start Game</button>
    </div>
  </div>
  <div v-if="start" id="app" class="wordle-container">
    <h1 class="game-title">Alpha Arena</h1>
    <div v-if="showEnd" class="endMsg">
      <p v-if="medal">You have earned the {{ medal }} Medal!</p>
      <p v-else>Game Over</p>
      <button @click="resetGame" class="playAgain-btn">Play Again</button>
    </div>
    <WordGrid :guesses="guesses" :maxGuesses="6" :feedback="feedback" :currentGuess="currentGuess" />
    <KeyBoard @letter="addLetter" @delete="deleteLetter" @submit="submitGuess" :keyStates="keyStates" />

    <!-- Hint Button -->
    <button @click="showHintModal = true" class="hint-button">Hint</button>

    <!-- Hint Modal -->
    <div v-if="showHintModal" class="hint-modal">
      <div class="modal-content">
        <h3>Choose a Hint Type</h3>
        <button @click="getDefinitionHint">Definition</button>
        <button @click="getSynonymHint">Synonym</button>
        <button @click="getPartOfSpeechHint">Part of Speech</button>
        <button @click="showHintModal = false" class="close-button">Close</button>
      </div>
    </div>

    <!-- Hint Display -->
    <div v-if="hint" class="hint-box">
      <p>{{ hint }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; // Make sure axios is imported
import WordGrid from './WordGrid.vue'
import KeyBoard from './KeyBoard.vue'

export default {
  components: {
    WordGrid,
    KeyBoard,
  },
  data() {
    return {
      start: false,
      wordList: [],
      validWords: [],
      targetWord: "",
      definition: "",
      guesses: [],
      currentGuess: "",
      maxGuesses: 6,
      feedback: [],
      keyStates: {},
      showHintModal: false,
      hint: "",
      score: 0,
      medal: '',
      showEnd: false,
    };
  },
  created() {
    this.fetchWords()
  },
  methods: {
    startGame() {
      this.start = true;
    },
    resetGame(){
      this.start= false,
      this.wordList= [],
      this.validWords= [],
      this.targetWord= "",
      this.definition= "",
      this.guesses= [],
      this.currentGuess= "",
      this.maxGuesses= 6,
      this.feedback= [],
      this.keyStates= {},
      this.showHintModal= false,
      this.hint= "",
      this.score= 0,
      this.medal= '',
      this.showEnd= false
      this.fetchWords()
    },
    async getDefinitionHint() {
      this.hint = "Fetching definition...";
      this.showHintModal = false;

      try {
        const definition = await this.getDefinition(this.targetWord);
        if (definition) {
          this.hint = definition.split('. ')[0] + '.';
        } else {
          this.hint = "No definition available for this word.";
        }
      } catch (error) {
        console.error("Error fetching definition hint:", error);
        this.hint = "Unable to fetch a definition.";
      }
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

        if (this.score >= 5) this.medal = "gold", gold += 1;
        else if (this.score >= 3) this.medal = "silver", silver += 1;
        else if (this.score >= 2) this.medal = "bronze", bronze += 1;
        console.log(this.score, this.medal)

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
    async fetchWords() {
      try {
        // Fetch words from Datamuse API
        const response = await axios.get('https://api.datamuse.com/words', {
          params: {
            sp: '?????', // Pattern for 5-letter words (wildcard)
            max: 1000,   // Maximum number of words to return
          },
        });

        if (response.data.length === 0) {
          console.log("No words found.");
          return;
        }

        const words = response.data.map(wordObj => wordObj.word); // Extract words from the response

        // Check the retrieved words
        console.log("Fetched words:", words);

        // Assign to data properties
        this.wordList = words;
        this.validWords = words; // All 5-letter words can be valid words

        // Select a random word from the word list
        this.selectRandomWord();
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    },
    selectRandomWord() {
      const randomIndex = Math.floor(Math.random() * this.wordList.length);
      this.targetWord = this.wordList[randomIndex];
      //console.log(this.targetWord)
    },
    addLetter(letter) {
      if (this.currentGuess.length < this.targetWord.length) {
        this.currentGuess += letter.toUpperCase();
      }
    },
    deleteLetter() {
      this.currentGuess = this.currentGuess.slice(0, -1);
    },
    async validateWord(word) {
      try {
        // Call Datamuse API to validate the word
        const response = await axios.get('https://api.datamuse.com/words', {
          params: { sp: word, max: 1 },
        });

        // Check if the API returned a matching word
        return response.data.length > 0 && response.data[0].word.toLowerCase() === word.toLowerCase();
      } catch (error) {
        console.error("Error validating word:", error);
        return false; // Assume invalid if there's an error
      }
    },
    async getPartOfSpeechHint() {
      this.hint = "Fetching part of speech...";
      this.showHintModal = false;

      try {
        const definition = await this.getDefinition(this.targetWord);
        if (definition) {
          const partOfSpeech = definition.match(/\((.*?)\)/)?.[1] || "No part of speech found.";
          this.hint = partOfSpeech ? `The word is a "${partOfSpeech[1]}".` : "No part of speech found.";
        } else {
          this.hint = "No part of speech available for this word.";
        }
      } catch (error) {
        console.error("Error fetching part-of-speech hint:", error);
        this.hint = "Unable to fetch part of speech.";
      }
    },
    async getSynonymHint() {
      this.hint = "Fetching synonym...";
      this.showHintModal = false;

      try {
        const response = await axios.get('https://api.datamuse.com/words', {
          params: { rel_syn: this.targetWord, max: 1 },
        });
        if (response.data.length > 0) {
          this.hint = `A synonym is: "${response.data[0].word}".`;
        } else {
          this.hint = "No synonyms available for this word.";
        }
      } catch (error) {
        console.error("Error fetching synonym hint:", error);
        this.hint = "Unable to fetch a synonym.";
      }
    },
    async getDefinition(word) {
      //console.log(word)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        // Call your backend server instead of the dictionary API
        const response = await axios.get(`${API_URL}/get-definition/${word}`);
        return response.data; // Return the definition from the backend
      } catch (error) {
        console.error("Error fetching definition:", error);
        return null; // If error occurs, return null
      }
    },
    async submitGuess() {
      console.log("Current guess:", this.currentGuess);

      if (this.currentGuess.length === this.targetWord.length) {
        // Validate the guessed word
        const isValid = await this.validateWord(this.currentGuess);

        if (!isValid) {
          alert("Invalid word! Please guess a valid word.");
          return;
        }
        // Normalize to lowercase for comparisons
        const normalizedGuess = this.currentGuess.toLowerCase();
        const normalizedTarget = this.targetWord.toLowerCase();

        // Initialize feedback and target letter counts
        const feedback = [];
        const targetCounts = {};
        let correct = 0;

        // Count occurrences of each letter in the target word
        for (const char of normalizedTarget) {
          targetCounts[char] = (targetCounts[char] || 0) + 1;
        }

        // First pass: Mark "correct" letters
        normalizedGuess.split("").forEach((char, idx) => {
          if (char === normalizedTarget[idx]) {
            feedback[idx] = "correct";
            correct++;
            targetCounts[char]--; // Decrement count for this letter
            this.keyStates[char] = "correct"
          }
        });

        // Second pass: Mark "present" and "absent" letters
        normalizedGuess.split("").forEach((char, idx) => {
          if (feedback[idx]) return; // Skip already marked as "correct"
          if (targetCounts[char] > 0) {
            feedback[idx] = "present";
            targetCounts[char]--; // Decrement count for this letter
            if (this.keyStates[char] !== "correct") {
              this.keyStates[char] = "present"
            }
          } else {
            feedback[idx] = "absent";
            if (!this.keyStates[char]) {
              this.keyStates[char] = "absent"
            }
          }
        });

        // Push the guess and its feedback
        this.guesses.push([...this.currentGuess.toUpperCase()]); // Preserve original casing for display
        this.feedback.push(feedback);
        console.log("Normalized guess:", normalizedGuess);
        console.log("Normalized target:", normalizedTarget);
        console.log("Feedback:", feedback);

        // Check if the guess is correct
        this.score = correct
        //console.log(this.score)
        if (normalizedGuess === normalizedTarget) {
          await this.updateAchievements()
          this.submitScoreToLeaderboard();
          this.showEnd = true
          alert("You win!");
        } else if (this.guesses.length >= this.maxGuesses) {
          await this.updateAchievements()
          this.submitScoreToLeaderboard();
          this.showEnd = true
          alert(`Game Over! The word was ${this.targetWord}`);
        }

        // Reset the current guess
        this.currentGuess = "";
      }
    },
    async submitScoreToLeaderboard() {
      if (!this.$store.state.user) {
        console.log("No user logged in!");
        return;
      }
      const userId = this.$store.state.user.id;
      const gameName = 'Alpha Arena';
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
  },
};
</script>

<style scoped>
.wordle-container {
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

h2 {
  color: #007bff;
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

.space {
  margin-left: 40px;
}

.tile {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  /* Square tile */
  height: 50px;
  /* Matches width for a square */
  background-color: #444;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 5px;
  /* Rounded corners for modern touch */
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
}

.grid {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.guess-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

:root {
  --tile-correct: green;
  --tile-present: yellow;
  --tile-absent: gray;
  --tile-default: #444;
}

.tile.correct {
  background-color: var(--tile-correct);
}

.tile.present {
  background-color: var(--tile-present);
}

.tile.absent {
  background-color: var(--tile-absent);
}

.tile {
  background-color: var(--tile-default);
}

button {
  padding: 15px;
  font-size: 18px;
  margin: 5px;
  cursor: pointer;
  border-radius: 5px;
  background-color: #ddd;
  border: none;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #ccc;
}

button:active {
  background-color: #bbb;
}

.keyboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.title {
  animation: slideIn 1s ease-in-out;
}
.playAgain-btn{
  margin: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4e54c8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.playAgain-btn:hover{
  background-color: #8f94fb;
}

.hint-button {
  margin: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4e54c8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.hint-button:hover {
  background-color: #8f94fb;
}

.hint-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.hint-box {
  margin: 20px auto;
  padding: 10px;
  background-color: #f8f9fa;
  border-left: 5px solid #4e54c8;
  font-size: 16px;
  max-width: 600px;
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