<template>
    <div id="app" class="wordle-container">
        <h1 class="game-title">Alpha Arena</h1>
        <div class="game-board">
            <div class="player1">
                <WordGrid :guesses="guesses_1" :maxGuesses="6" :feedback="feedback_1" :currentGuess="currentGuess_1" />
                <KeyBoard @letter="addLetter(1, $event)" @delete="deleteLetter(1)" @submit="submitGuess(1)"
                    :keyStates="keyStates_1" :disabled="gameOver || currentPlayer !== 1" :player_num="1" />
            </div>

            <div class="player2">
                <WordGrid :guesses="guesses_2" :maxGuesses="6" :feedback="feedback_2" :currentGuess="currentGuess_2" />
                <KeyBoard @letter="addLetter(2, $event)" @delete="deleteLetter(2)" @submit="submitGuess(2)"
                    :keyStates="keyStates_2" :disabled="gameOver || currentPlayer !== 2" :player_num="2" />
            </div>

        </div>
    </div>
</template>


<script>
import axios from 'axios'; // Make sure axios is imported
import WordGrid from './WordGrid.vue'
import KeyBoard from './KeyBoard.vue'
import { io } from 'socket.io-client';


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
            currentPlayer: 1,
            socket: null, // WebSocket connection
            gameId: null, // Store game ID for session
        };
    },
    created() {
        this.fetchWords();
        this.connectToWebSocket();
    },
    methods: {
        async fetchWords() {
            try {
                const response = await axios.get('https://api.datamuse.com/words', {
                    params: { sp: '?????', max: 1000 },
                });
                if (response.data.length === 0) return;
                const words = response.data.map(wordObj => wordObj.word);
                this.wordList = words;
                this.validWords = words;
                this.selectRandomWord();
            } catch (error) {
                console.error("Error fetching words:", error);
            }
        },

        selectRandomWord() {
            const randomIndex = Math.floor(Math.random() * this.wordList.length);
            this.targetWord = this.wordList[randomIndex];
        },

        connectToWebSocket() {
            // Connect to the keyclash namespace on your server (change the URL as needed)
            this.socket = io(`${API_URL}/wordle`, { transports: ['websocket'] });

            // Emit "Connected" event after successful connection
            this.socket.emit('Connected', this.socket);

            // Listen for game state updates
            this.socket.on('gameStateUpdate', (state) => {
                this.updateGameState(state);
            });

            // Listen for game over event
            this.socket.on('gameOver', (message) => {
                this.gameOver = true;
                alert(message);
            });

            // Listen for new guesses
            this.socket.on('newGuess', (guessData) => {
                this.handleNewGuess(guessData);
            });
        },

        handleNewGuess(data) {
            // Process the guess from the other player
            if (data.player === 1) {
                this.guesses_1.push(data.guess);
                this.feedback_1.push(data.feedback);
            } else {
                this.guesses_2.push(data.guess);
                this.feedback_2.push(data.feedback);
            }
        },

        updateGameState(state) {
            this.targetWord = state.targetWord;
            this.guesses_1 = state.guesses_1;
            this.guesses_2 = state.guesses_2;
            this.feedback_1 = state.feedback_1;
            this.feedback_2 = state.feedback_2;
            this.currentPlayer = state.currentPlayer;
            this.score_1 = state.score_1;
            this.score_2 = state.score_2;
            this.keyStates_1 = state.keyStates_1;
            this.keyStates_2 = state.keyStates_2;
        },

        addLetter(player_num, letter) {
            if (player_num === this.currentPlayer && this[`currentGuess_${player_num}`].length < this.targetWord.length) {
                this[`currentGuess_${player_num}`] += letter.toUpperCase();
                this.emitGameUpdate();
            }
        },

        deleteLetter(player_num) {
            if (player_num === this.currentPlayer) {
                this[`currentGuess_${player_num}`] = this[`currentGuess_${player_num}`].slice(0, -1);
                this.emitGameUpdate();
            }
        },

        async submitGuess(player_num) {
            if (this.gameOver || player_num !== this.currentPlayer) return;

            const isValid = await this.validateWord(this[`currentGuess_${player_num}`]);
            if (!isValid) return alert("Invalid word!");

            const feedback = this.processGuess(player_num);
            this[`guesses_${player_num}`].push([...this[`currentGuess_${player_num}`].toUpperCase()]);
            this[`feedback_${player_num}`].push(feedback);
            this.emitGameUpdate();

            if (this.checkGameOver(player_num)) return;

            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        },

        async validateWord(word) {
            try {
                const response = await axios.get('https://api.datamuse.com/words', { params: { sp: word, max: 1 } });
                return response.data.length > 0 && response.data[0].word.toLowerCase() === word.toLowerCase();
            } catch (error) {
                console.error("Error validating word:", error);
                return false;
            }
        },

        processGuess(player_num) {
            const normalizedGuess = this[`currentGuess_${player_num}`].toLowerCase();
            const normalizedTarget = this.targetWord.toLowerCase();
            const feedback = [];
            const targetCounts = {};

            for (const char of normalizedTarget) {
                targetCounts[char] = (targetCounts[char] || 0) + 1;
            }

            let correct = 0;

            normalizedGuess.split("").forEach((char, idx) => {
                if (char === normalizedTarget[idx]) {
                    feedback[idx] = "correct";
                    correct++;
                    targetCounts[char]--;
                    this[`keyStates_${player_num}`][char] = "correct";
                }
            });

            normalizedGuess.split("").forEach((char, idx) => {
                if (feedback[idx]) return;
                if (targetCounts[char] > 0) {
                    feedback[idx] = "present";
                    targetCounts[char]--;
                    this[`keyStates_${player_num}`][char] = "present";
                } else {
                    feedback[idx] = "absent";
                    if (!this[`keyStates_${player_num}`][char]) {
                        this[`keyStates_${player_num}`][char] = "absent";
                    }
                }
            });

            this[`score_${player_num}`] = correct;
            return feedback;
        },

        checkGameOver(player_num) {
            const normalizedGuess = this[`currentGuess_${player_num}`].toLowerCase();
            if (normalizedGuess === this.targetWord.toLowerCase()) {
                alert(`${player_num === 1 ? "Player 1" : "Player 2"} wins!`);
                this.gameOver = true;
                return true;
            }
            if (this[`guesses_${player_num}`].length >= this.maxGuesses) {
                alert(`Game Over! The word was ${this.targetWord}`);
                this.gameOver = true;
                return true;
            }
            return false;
        },

        emitGameUpdate() {
            if (this.socket && this.gameId) {
                this.socket.emit('gameStateUpdate', {
                    gameId: this.gameId,
                    state: {
                        targetWord: this.targetWord,
                        guesses_1: this.guesses_1,
                        guesses_2: this.guesses_2,
                        feedback_1: this.feedback_1,
                        feedback_2: this.feedback_2,
                        currentPlayer: this.currentPlayer,
                        score_1: this.score_1,
                        score_2: this.score_2,
                        keyStates_1: this.keyStates_1,
                        keyStates_2: this.keyStates_2,
                    },
                });
            }
        }
    },
};
</script>

<style scoped>
.game-title {
    font-family: Arial, sans-serif;
    font-size: 36px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 20px;
    /* Adds space between the title and the game boards */
    text-align: center;
    /* Centers the title */
}

/* Main container for the game */
.wordle-container {
    font-family: Arial, sans-serif;
    text-align: center;
    margin: 20px auto;
    background-color: #f4f4f4;
    padding: 20px;
    border-radius: 10px;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    /* Keeps the title above the boards */
    justify-content: flex-start;
    align-items: center;
    /* Centers the content */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.game-board {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
}

.player1,
.player2 {
    width: 48%
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

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
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