<template>
    <div id="app" class="wordle-container">
        <h1 class="game-title">Alpha Arena</h1>
        <div class="player1">
            <WordGrid :guesses="guesses_1" :maxGuesses="6" :feedback="feedback_1" :currentGuess="currentGuess_1" />
            <KeyBoard @letter="addLetter(1)" @delete="deleteLetter(1)" @submit="submitGuess(1)"
                :keyStates="keyStates_1" 
                :disabled="gameOver"/>
        </div>
        <div class="player2">
            <WordGrid :guesses="guesses_2" :maxGuesses="6" :feedback="feedback_2" :currentGuess="currentGuess_2" />
            <KeyBoard @letter="addLetter(2)" @delete="deleteLetter(2)" @submit="submitGuess(2)"
                :keyStates="keyStates_2" 
                :disabled="gameOver"/>
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
            gameOver: false,
            wordList: [],
            validWords: [],
            targetWord: "",
            maxGuesses: 6,
            guesses_1: [],
            currentGuess_1: "",
            feedback_1: [],
            keyStates_1: {},
            score_1: 0,
            guesses_2: [],
            currentGuess_2: "",
            feedback_2: [],
            keyStates_2: {},
            score_2: 0,
        };
    },
    created() {
        this.fetchWords()
    },
    methods: {
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
        addLetter(player_num, letter) {
            if (this[`currentGuess_${player_num}`].length < this.targetWord.length) {
                this[`currentGuess_${player_num}`] += letter.toUpperCase();
            }
        },
        deleteLetter(player_num) {
            this[`currentGuess_${player_num}`] = this[`currentGuess_${player_num}`].slice(0, -1);
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
        async submitGuess(player_num) {
            if(this.gameOver) return
            console.log("Current guess:", this[`currentGuess_${player_num}`]);

            if (this[`currentGuess_${player_num}`].length === this.targetWord.length) {
                // Validate the guessed word
                const isValid = await this.validateWord(this[`currentGuess_${player_num}`]);

                if (!isValid) {
                    alert("Invalid word! Please guess a valid word.");
                    return;
                }
                // Normalize to lowercase for comparisons
                const normalizedGuess = this[`currentGuess_${player_num}`].toLowerCase();
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
                        this[`keyStates_${player_num}`][char] = "correct"
                    }
                });

                // Second pass: Mark "present" and "absent" letters
                normalizedGuess.split("").forEach((char, idx) => {
                    if (feedback[idx]) return; // Skip already marked as "correct"
                    if (targetCounts[char] > 0) {
                        feedback[idx] = "present";
                        targetCounts[char]--; // Decrement count for this letter
                        if (this[`keyStates_${player_num}`][char] !== "correct") {
                            this[`keyStates_${player_num}`][char] = "present"
                        }
                    } else {
                        feedback[idx] = "absent";
                        if (!this[`keyStates_${player_num}`][char]) {
                            this[`keyStates_${player_num}`][char] = "absent"
                        }
                    }
                });

                // Push the guess and its feedback
                this[`guesses_${player_num}`].push([...this.currentGuess.toUpperCase()]); // Preserve original casing for display
                this[`feedback_${player_num}`].push(feedback);
                console.log("Normalized guess:", normalizedGuess);
                console.log("Normalized target:", normalizedTarget);
                console.log("Feedback:", this[`feedback_${player_num}`]);

                // Check if the guess is correct
                this[`score_${player_num}`] = correct
                //console.log(this.score)
                if (normalizedGuess === normalizedTarget) {
                    alert(`${player_num} wins!`);
                } else if (this[`guesses_${player_num}`].length >= this.maxGuesses) {
                    alert(`Game Over! The word was ${this.targetWord}`);
                }

                // Reset the current guess
                this[`currentGuess_${player_num}`] = ""
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