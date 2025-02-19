<script>
import HangMan from '../components/HangMan.vue';
import KeyBoard from '../components/KeyBoard.vue';
import InputBar from '../components/InputBar.vue';
import axios from 'axios';

export default {
    components: {
        HangMan,
        KeyBoard,
        InputBar,
    },
    data() {
        return {
            keyStates: {},
            secretWord: "Loading...", // Show loading text initially
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
            score: 0,
            earnedMedal: '', // Track the earned medal
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
                this.updateAchievements();
                return `${this.wordGuessed ? "🎉 You Win! 🎉" : "☠️ Game Over! The word was: " + this.secretWord} ${this.earnedMedal ? `You earned the ${this.earnedMedal} medal!` : ''}`;
            }
            return '';
        },
        uniqueLetters() {
            return [...new Set(this.secretWord.toLowerCase().replace(/\s/g, ''))];
        }
    },
    mounted() {
        this.fetchRandomPhrase();
    },
    methods: {
        restartGame() {
            this.guessedLetters = [];
            this.wrongGuesses = 0;
            this.fetchRandomPhrase();
            this.keyStates = {};
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
        async fetchRandomPhrase() {
            try {
                let phraseWords = [];
                const phraseLength = Math.floor(Math.random() * 3) + 2; // 2-4 words in total

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
    },
};
</script>


<template>
    <main>
        <div class="hang">
            <HangMan :wrongGuesses="wrongGuesses" />
        </div>
        <div class="input">
            <InputBar :secret-word="secretWord" :guessedLetters="guessedLetters" />
        </div>
        <KeyBoard :keyStates="keyStates" @letter="handleLetterPress" @delete="handleDelete" @submit="handleSubmit" />
        <div v-if="gameOver" class="game-over">
            <h2>{{ gameOverMessage }}, Score: {{ score }}</h2>
            <button @click="restartGame">Play Again</button>
        </div>
    </main>>
</template>
<style>
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