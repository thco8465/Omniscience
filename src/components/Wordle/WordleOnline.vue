<template>
    <div id="app" class="wordle-container">
        <h1 class="game-title">Alpha Arena</h1>
        <div class="waiting" v-if="waiting">
            <h2>Waiting for second player...</h2>
        </div>
        <div class="gameOver" v-if="gameOver">
            <h3>{{ message }}</h3>
            <button @click="resetGame">Play Again?</button>
        </div>
        <div class="game-board" v-if="!waiting">
            <div class="player1">
                <h1>{{ players[1].username }}</h1>
                <WordGrid :guesses="players[1].guesses" :maxGuesses="6" :feedback="players[1].feedback"
                    :currentGuess="players[1].currentGuess" />
                <KeyBoard @letter="addLetter($event, 1)" @delete="deleteLetter(1)" @submit="submitGuess(1)"
                    :keyStates="players[1].keyStates" :disabled="gameOver || currentPlayer !== 1" :player_num="1" />
            </div>
            <div class="player2">
                <h1>{{ players[2].username }}</h1>
                <WordGrid :guesses="players[2].guesses" :maxGuesses="6" :feedback="players[2].feedback"
                    :currentGuess="players[2].currentGuess" />
                <KeyBoard @letter="addLetter($event, 2)" @delete="deleteLetter(2)" @submit="submitGuess(2)"
                    :keyStates="players[2].keyStates" :disabled="gameOver || currentPlayer !== 2" :player_num="2" />
            </div>

        </div>
    </div>
</template>


<script>
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
            message: '',
            waiting: true,
            userId: this.$store.state.user ? this.$store.state.user.id : -1,
            maxGuesses: 6,
            targetWord: "",
            currentPlayer: 1,
            socket: null,
            gameId: null,
            playerNumber: null, // Track which player this client is
            players: {
                1: {
                    guesses: [],
                    currentGuess: "",
                    feedback: [],
                    keyStates: {},
                    score: 0,
                    username: 'player 1'
                },
                2: {
                    guesses: [],
                    currentGuess: "",
                    feedback: [],
                    keyStates: {},
                    score: 0,
                    username: 'player 2'
                }
            }
        };
    },
    created() {
        this.connectToWebSocket();
    },
    methods: {
        connectToWebSocket() {
            if(this.socket){
                this.socket.disconnect();
            }
            console.log('connecting to web socket')
            // Connect to the keyclash namespace on your server (change the URL as needed)
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            this.socket = io(`${API_URL}/wordle`, { transports: ['websocket'] });
            this.socket.on("gameCreated", (data) => {
                console.log('game created', data)
                this.playerNumber = data.playerNumber
                this.gameId = data.gameId
                console.log('userId: ', this.userId)
                if(this.userId != -1){
                    console.log('userId: ', this.userId)
                    this.socket.emit('getUsername', this.gameId,this.userId, this.playerNumber)
                }
            })
            this.socket.on("gameError", (error) => {
                if (error.message === "No available games. Create a new one.") {
                    console.log("No open games, creating a new one...");
                    this.socket.emit("createGame");
                }
            });
            this.socket.on('gameAssigned', (data) => {
                console.log('game joined: ', data)
                // Server assigns player number
                this.playerNumber = data.playerNumber;
                this.gameId = data.gameId;
                if(this.userId != -1){
                    console.log('userId: ', this.userId)
                    this.socket.emit('getUsername', this.gameId, this.userId, this.playerNumber)
                }
                // Optional: Update URL with game ID for sharing
                this.updateUrlWithGameId();
            });
            this.socket.on('receiveUsername', (name, playerNum) => {
                console.log('name: ', name, 'playerNum: ', playerNum)
                this.players[playerNum].username = name

            });
            // Listen for game state updates
            this.socket.on('gameStateUpdate', (state) => {
                console.log(`Updating game state: `, state);

                this.updateGameState(state); // Update game state only when necessary
            });

            // Listen for game over event
            this.socket.on('gameOver', (data) => {
                this.gameOver = true;
                this.message = data.message
                //alert(message.message);
            });
        },
        updateUrlWithGameId() {
            // Update URL without reloading page
            if (this.$router) {
                this.$router.replace({
                    name: 'AlphaOnline',
                    query: { gameId: this.gameId }
                });
            }
        },
        resetGame(){
            this.socket.emit('resetGame', this.gameId)
        },
        updateGameState(state) {
            console.log('update: ', state)
            if (!state || !state.gameId || state.gameId !== this.gameId) return;

            this.targetWord = state.targetWord;
            this.currentPlayer = state.currentPlayer;

            this.players[1].username = state.username_1
            this.players[2].username = state.username_2
            this.players[1].currentGuess = state.currentGuess_1;
            this.players[2].currentGuess = state.currentGuess_2
            this.players[1].guesses = state.guesses_1;
            this.players[2].guesses = state.guesses_2;
            this.players[1].feedback = state.feedback_1;
            this.players[2].feedback = state.feedback_2;
            this.players[1].score = state.score_1;
            this.players[2].score = state.score_2;
            this.players[1].keyStates = state.keyStates_1;
            this.players[2].keyStates = state.keyStates_2;
            this.waiting = state.waiting;
            this.gameOver = state.gameOver;
        },
        addLetter(letter, player_num) {
            // Only process letter if it's this player's turn and matches the client's player number
            if (this.currentPlayer === player_num) {
                console.log('adding letter: ', letter, this.playerNumber, this.gameId)
                this.socket.emit('addLetter', { gameId: this.gameId, player: this.playerNumber, letter });
            }
        },

        deleteLetter(player_num) {
            if(this.currentPlayer === player_num){
                console.log('deleting letter')
                this.socket.emit('deleteLetter', { gameId: this.gameId, player: this.playerNumber });
            }
        },
        submitGuess(player_num) {
            if (this.gameOver || !this.players[this.playerNumber].currentGuess.trim()) return;
            if(this.currentPlayer !== player_num) return;
            console.log('submit guess')
            this.socket.emit('submitGuess', {
                gameId: this.gameId,
                player: this.playerNumber,
                guess: this.players[this.playerNumber].currentGuess.trim()
            });
        },
    },
    beforeUnmount() {
        if (this.socket) {
            console.log('unmounting')
            this.socket.emit('PlayerDisconnect')
            this.socket.disconnect()
        }
    }
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