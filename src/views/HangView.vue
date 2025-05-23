<script>
import HangMan from '../components/Hangman/HangMan.vue';
import KeyBoard from '../components/Wordle/KeyBoard.vue';
import InputBar from '../components/Hangman/InputBar.vue';
import axios from 'axios';

export default {
    components: {
        HangMan,
        KeyBoard,
        InputBar,
    },
    data() {
        return {
            start: false,
            keyStates: {},
            secretWord: "Loading...", // Show loading text initially
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
            score: 0,
            earnedMedal: '', // Track the earned medal
            modifiers: [],
            timeLeft: 60,
            timerInterval: null, // Store the timer interval ID
        };
    },
    computed: {
        gameOver() {
            return this.wrongGuesses >= this.maxWrongGuesses || this.wordGuessed;
        },
        wordGuessed() {
            return [...this.secretWord.toLowerCase().replace(/\s/g, '')].every(letter => this.guessedLetters.includes(letter));
        },
        gameOverMessage() {
            if (this.gameOver) {
                clearInterval(this.timerInterval);
                return `${this.wordGuessed ? "🎉 You Win! 🎉" : "☠️ Game Over! The word was: " + this.secretWord} ${this.earnedMedal ? `You earned the ${this.earnedMedal} medal!` : ''}`;
            }
            return '';
        },
        uniqueLetters() {
            return [...new Set(this.secretWord.toLowerCase().replace(/\s/g, ''))];
        }
    },
    watch: {
        gameOver(newVal) {
            if (newVal) {
                // If the game is over, handle the game over logic
                this.handleGameOver();
            }
        }
    },
    mounted() {
        const isDailyChallenge = this.$route.query.daily === 'true';
        if (isDailyChallenge) {
            this.loadModifiers();
        } else {
            this.fetchRandomPhrase(); // Skip modifiers
        }
    },
    methods: {
        async loadModifiers() {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                const res = await axios.get(`${API_URL}/challenge/daily`);
                const challenge = res.data;
                console.log(challenge)
                if (challenge && challenge.game == "Hangman" && challenge.variation) {
                    this.modifiers = challenge.variation.split(',');
                    this.applyModifiers();
                }
            } catch (err) {
                console.error("Failed to fetch challenge modifiers", err);
            }
            await this.fetchRandomPhrase();
        },
        applyModifiers() {
            if (this.modifiers.includes("5 guesses")) {
                this.maxWrongGuesses = 5;
                this.wrongGuesses = 1;
            }
            console.log("Applied Modifiers:", this.modifiers);
            console.log("Max Wrong Guesses:", this.maxWrongGuesses);
            console.log("Timer started?", this.timer ? "Yes" : "No");

        },
        startTimer() {
            this.timeLeft = 60;

            this.timerInterval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    clearInterval(this.timerInterval);
                    this.gameOver = true; // Set the game as over when the timer runs out
                }
            }, 1000);

            // Fail the game after 60 seconds
            this.timer = setTimeout(() => {
                if (!this.gameOver) {
                    this.wrongGuesses = this.maxWrongGuesses;
                }
            }, 60000); // 1 minute
        },
        beforeUnmount() {
            if (this.timer) clearTimeout(this.timer);
            if (this.timerInterval) clearInterval(this.timerInterval);
        },
        startGame() {
            this.start = true;
            if (this.modifiers.includes("Timer")) {
                this.startTimer();
            }
        },
        handleGameOver() {
            this.updateAchievements();
            this.submitScoreToLeaderboard();
        },
        restartGame() {
            this.guessedLetters = [];
            this.wrongGuesses = 0;
            this.fetchRandomPhrase();
            this.keyStates = {};
            if (this.modifiers.includes("Timer")) {
                this.timer = 60;
                this.startTimer();
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

                const totalUniqueLetters = this.uniqueLetters.length;

                if (this.score >= totalUniqueLetters) {
                    gold += 1;
                    this.earnedMedal = 'Gold';  // Track the earned medal
                } else if (this.score >= totalUniqueLetters / 2) {
                    silver += 1;
                    this.earnedMedal = 'Silver';
                } else if (this.score > totalUniqueLetters / 3) {
                    bronze += 1;
                    this.earnedMedal = 'Bronze';
                }

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
        async fetchRandomPhrase() {
            try {
                let phraseWords = [];
                const phraseLength = this.modifiers.includes("Two words instead of one") ? 2 : 1;

                while (phraseWords.length <= phraseLength) {
                    // Fetch a random adjective
                    const adjResponse = await fetch("https://api.datamuse.com/words?rel_jjb=thing&max=50");
                    const adjectives = await adjResponse.json();
                    const adjWord = adjectives.length ? adjectives[Math.floor(Math.random() * adjectives.length)].word : null;

                    if (adjWord) {
                        phraseWords.push(adjWord);
                    }

                    if (phraseWords.length < phraseLength) {
                        // Fetch a noun related to the adjective
                        const nounResponse = await fetch(`https://api.datamuse.com/words?rel_jja=${adjWord}&max=50`);
                        const nouns = await nounResponse.json();
                        const nounWord = nouns.length ? nouns[Math.floor(Math.random() * nouns.length)].word : null;

                        if (nounWord) {
                            phraseWords.push(nounWord);
                        }
                    }
                }

                // Set the phrase ensuring it doesn't exceed the intended length
                this.secretWord = phraseWords.slice(0, phraseLength).join(" ");
            } catch (error) {
                console.error("Error fetching phrase:", error);
                this.secretWord = "error phrase"; // Fallback
            }
        },
        handleLetterPress(letter) {
            const lowerLetter = letter.toLowerCase();

            if (this.guessedLetters.includes(lowerLetter)) return;
            this.guessedLetters.push(lowerLetter);
            if (this.uniqueLetters.includes(lowerLetter)) { // Check against unique letters
                this.keyStates = { ...this.keyStates, [lowerLetter]: "correct" };
                this.score += 1; // Only increase score when guessing a unique letter
            } else {
                this.keyStates = { ...this.keyStates, [lowerLetter]: "absent" };
                this.wrongGuesses++;
            }
        },
        handleDelete() {
            console.log("Delete pressed");
        },
        handleSubmit() {
            console.log("Submit pressed");
        },
        async submitScoreToLeaderboard() {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (!this.$store.state.user) {
                console.log("No user logged in!");
                return;
            }
            const userId = this.$store.state.user.id;
            const gameName = 'Hangman';
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
};
</script>


<template>
    <main>
        <div v-if="!start" class="info-screen">
            <div class="info-content">
                <h2>Hangman Rules</h2>
                <p>Guess the word by selecting the correct letters. You have a limited number of wrong guesses!</p>
                <p>Gold: All letters guessed</p>
                <p>Silver: Half of letters guessed</p>
                <p>Bronze: Third of letters guessed</p>
                <button class="button-info" @click="startGame">Start Game</button>
            </div>
        </div>

        <div v-if="start" class="container">
            <div v-if="gameOver" class="game-over">
                <h2>{{ gameOverMessage }}, Score: {{ score }}</h2>
                <button @click="restartGame">Play Again</button>
            </div>
            <div v-if="modifiers.length" class="modifiers-active">
                <h3>Daily Challenge Modifiers:</h3>
                <ul>
                    <li v-for="mod in modifiers" :key="mod">{{ mod }}</li>
                </ul>
            </div>
            <div v-if="modifiers.includes('Timer')" class="timer">
                <h3>⏳ Time Left: {{ timeLeft }}s</h3>
            </div>

            <div class="hang">
                <HangMan :wrongGuesses="wrongGuesses" />
            </div>
            <div class="input">
                <InputBar :secret-word="secretWord" :guessedLetters="guessedLetters" />
            </div>
            <KeyBoard :keyStates="keyStates" @letter="handleLetterPress" @delete="handleDelete"
                @submit="handleSubmit" />
        </div>
    </main>
</template>
<style scoped>
.container {
    text-align: center;
    margin-top: 50px;
    font-family: Arial, sans-serif;
    text-align: center;
    margin: 20px auto;
    background-color: rgba(142, 68, 173, 0.6);
    /* Purple with 60% opacity */
    padding: 20px;
    border-radius: 10px;
    max-width: 10000px;
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

.timer {
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

h2 {
    color: #4a90e2;
}

.button-info {
    padding: 15px 30px;
    background-color: #4a90e2;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 18px;
    cursor: pointer;
}

.button-info:hover {
    background-color: #2980b9;
}

.hang {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.input {
    margin-bottom: 10px;
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

button {
    margin-top: 10px;
    padding: 10px 20px;
    font-size: 18px;
    background: #4e54c8;
    color: white;
    border: none;
    cursor: pointer;
}
</style>