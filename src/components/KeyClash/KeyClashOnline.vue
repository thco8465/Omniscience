<template>
    <div class="container">
        <div class="game-header">
            <h1>Key Clash (Online Quickplay)</h1>

            <!-- Show waiting screen if the second player hasn't joined -->
            <div v-if="waitingForPlayers" class="waiting">
                <h2>Waiting for second player...</h2>
            </div>

            <!-- Show ready buttons when both players are present but not yet ready -->
            <div v-else-if="!player1Ready || !player2Ready" class="ready-screen">
                <h2>Both players are connected! Get ready!</h2>
                <div class="ready-buttons">
                    <button v-if="playerID == 'player1'" @click="setPlayerReady(1)" :disabled="player1Ready">
                        {{ player1Ready ? "Ready ✔" : "I'm Ready!" }}
                    </button>
                    <button v-if="playerID == 'player2'" @click="setPlayerReady(2)" :disabled="player2Ready">
                        {{ player2Ready ? "Ready ✔" : "I'm Ready!" }}
                    </button>
                </div>
            </div>

            <!-- Show game screen when both players are ready -->
            <div v-else-if="gameStarted && !gameOverMessage" class="stage-info">
                <span class="stage">Stage: {{ currentStage }}/{{ maxStages }}</span>
                <span class="timer">Time: {{ formatTime(stageTimer) }}</span>
            </div>

            <!-- Game Over Screen -->
            <div v-else class="game-over">
                <h2>Game Over!</h2>
                <p>{{ gameOverMessage }}</p>
                <button @click="resetGame" class="reset-button">Play Again</button>
            </div>
        </div>

        <div class="game-container" v-if="gameStarted">
            <div class="screen" :class="{ 'winner': stageWinner === 1 }">
                <div class="player-info">
                    <h2>{{ usernames.player1 }}</h2>
                    <div class="score">Total Score: {{ total_scores.player1 }}</div>
                    <div class="score">Stage Score: {{ scores.player1 }}</div>
                    <div class="lives">Lives: {{ 3 - wins.player2 }}</div>
                </div>
                <div class="game-area" ref="player1GameArea">
                    <div class="key-lanes">
                        <div class="key-lane" v-for="(type, index) in keyTypes" :key="type">
                            <div class="lane-background"></div>
                        </div>
                    </div>

                    <div class="key-spawn-area">
                        <transition-group name="key-move">
                            <div v-for="key in keys.player1" :key="key.id" class="key" :class="[key.type, key.status]"
                                :style="{ top: `${key.position}px` }">
                                <i :class="getKeyIcon(key.type)"></i>
                            </div>
                        </transition-group>
                    </div>

                    <div class="target-zone-line"></div>

                    <div class="key-targets">
                        <div class="key-target left-target">
                            <span class="key-label">←</span>
                        </div>
                        <div class="key-target up-target">
                            <span class="key-label">↑</span>
                        </div>
                        <div class="key-target down-target">
                            <span class="key-label">↓</span>
                        </div>
                        <div class="key-target right-target">
                            <span class="key-label">→</span>
                        </div>
                    </div>
                </div>
                <div class="controls">
                    <div class="key-instructions">
                        <p>Use ←, ↑, ↓, → keys</p>
                    </div>
                </div>
            </div>

            <div class="screen" :class="{ 'winner': stageWinner === 2 }">
                <div class="player-info">
                    <h2>{{ usernames.player2 }}</h2>
                    <div class="score">Total Score: {{ total_scores.player2 }}</div>
                    <div class="score">Stage Score: {{ scores.player2 }}</div>
                    <div class="lives">Lives: {{ 3 - wins.player1 }}</div>
                </div>
                <div class="game-area" ref="player2GameArea">
                    <div class="key-lanes">
                        <div class="key-lane" v-for="(type, index) in keyTypes" :key="type">
                            <div class="lane-background"></div>
                        </div>
                    </div>

                    <div class="key-spawn-area">
                        <transition-group name="key-move">
                            <div v-for="key in keys.player2" :key="key.id" class="key" :class="[key.type, key.status]"
                                :style="{ top: `${key.position}px` }">
                                <i :class="getKeyIcon(key.type)"></i>
                            </div>
                        </transition-group>
                    </div>

                    <div class="target-zone-line"></div>

                    <div class="key-targets">
                        <div class="key-target left-target">
                            <span class="key-label">←</span>
                        </div>
                        <div class="key-target up-target">
                            <span class="key-label">↑</span>
                        </div>
                        <div class="key-target down-target">
                            <span class="key-label">↓</span>
                        </div>
                        <div class="key-target right-target">
                            <span class="key-label">→</span>
                        </div>
                    </div>
                </div>
                <div class="controls">
                    <div class="key-instructions">
                        <p>Use ←, ↑, ↓, → keys</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { io } from 'socket.io-client';
import { useStore } from "vuex";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const socket = io(`${API_URL}/keyclash`, { transports: ['websocket'] });
const store = useStore();

// Game constants
const keyTypes = ['left', 'up', 'down', 'right'];
const MAX_STAGES = 5;
const TARGET_ZONE_POSITION = 450; // Position of the target zone from the top
const TARGET_ZONE_TOLERANCE = 30; // Pixels of tolerance for hitting the target
const STAGE_DURATION = 10; // Duration of each stage in seconds

// Game state
const playerID = ref(null);
const player1Ready = ref(false);
const player2Ready = ref(false);
const gameStarted = ref(false);
const waitingForPlayers = ref(true);
const currentStage = ref(1);
const maxStages = ref(MAX_STAGES);
const scores = ref({ player1: 0, player2: 0 });
const keys = ref({ player1: [], player2: [] });
const wins = ref({ player1: 0, player2: 0 });
const stageTimer = ref(STAGE_DURATION);
const stageActive = ref(false);
const stageWinner = ref(0);
const gameOverMessage = ref('');
const total_scores = ref({ player1: 0, player2: 0 })
const userId = store.state.user ? store.state.user.id : -1;
const usernames = ref({ player1: 'player1', player2: 'player' })

// Game timers and intervals
let keyGenerationInterval = null;
let gameUpdateInterval = null;
let stageTimerInterval = null;

// Computed properties
const gameSpeed = computed(() => {
    // Increase speed based on stage number
    return 2 + (currentStage.value - 1) * 0.5;
});

const keyFrequency = computed(() => {
    // Decrease time between keys as stages progress
    return 1000 - (currentStage.value - 1) * 150;
});

// Player readiness
const setPlayerReady = () => {
    if (playerID.value) {
        socket.emit('playerReady', playerID.value, userId);
        if (playerID.value === 'player1') {
            // socket.emit('player1Ready')
            player1Ready.value = true;
        } else {
            // socket.emit('player2Ready')
            player2Ready.value = true;
        }
        checkStartGame();
    }
};

const checkStartGame = () => {
    if (player1Ready.value && player2Ready.value) {
        // Don't set gameStarted locally, wait for server confirmation
        socket.emit('getUsernames'); // Request usernames
        socket.emit('startGame');
    }
};

// Game mechanics
const startStage = () => {
    resetStage();
    gameStarted.value = true;
    stageActive.value = true;
    stageTimer.value = STAGE_DURATION;

    console.log('startStage', currentStage.value);

    // Don't emit startStage from here to prevent race conditions
    // Let the server decide when to start stages

    // Start key generation
    keyGenerationInterval = setInterval(generateKeys, keyFrequency.value);

    // Start game update loop
    gameUpdateInterval = setInterval(updateGame, 16); // ~60fps

    // Use server-synchronized timer
    stageTimerInterval = setInterval(() => {
        // Only decrement locally if we're not receiving server updates
        if (stageActive.value) {
            stageTimer.value--;
            if (stageTimer.value <= 0) {
                socket.emit('timerEnded', currentStage.value);
                // Don't end locally, wait for server confirmation
                clearInterval(stageTimerInterval); // Just stop the timer
            }
        }
    }, 1000);
};

const resetStage = () => {
    scores.value = { player1: 0, player2: 0 };
    keys.value = { player1: [], player2: [] };
    stageWinner.value = 0;
    stageTimer.value = STAGE_DURATION;
};

const endStage = () => {
    stageActive.value = false;
    clearIntervals();

    const { player1, player2 } = scores.value;

    // Determine stage winner
    if (player1 > player2) {
        stageWinner.value = 1;
        wins.value.player1++;
    } else if (player2 > player1) {
        stageWinner.value = 2;
        wins.value.player2++;
    } else {
        // Handle tie - both players get a point
        stageWinner.value = 3;
    }

    // Emit endStage to server, but don't progress locally
    socket.emit('endStage', {
        stageWinner: stageWinner.value,
        wins: wins.value,
        scores: scores.value,
        total_scores: total_scores.value,
        currentStage: currentStage.value
    });
};

const resetGame = () => {
    socket.emit('resetGame');
};

// Key generation and management
const generateKeys = () => {
    if (!stageActive.value) return;

    // Create a pattern to ensure both players get the same sequence
    const keyType = keyTypes[Math.floor(Math.random() * keyTypes.length)];
    const key = { id: Date.now(), type: keyType, position: 0, status: 'active' };

    // Only add the key locally if you're player1 (to prevent duplicates)
    if (playerID.value === 'player1') {
        keys.value.player1.push({ ...key });
        keys.value.player2.push({ ...key });
        socket.emit('keyGenerated', key);
    }
};

const updateGame = () => {
    if (!stageActive.value) return;

    ['player1', 'player2'].forEach(player => {
        keys.value[player] = keys.value[player].map(key => ({
            ...key,
            position: key.position + gameSpeed.value
        })).filter(key => {
            if (keyMissed(key)) return false;
            return key.status === 'active' || key.position < TARGET_ZONE_POSITION + 100;
        });
    });
};

const keyMissed = (key) => {
    if (key.position > TARGET_ZONE_POSITION + TARGET_ZONE_TOLERANCE && key.status === 'active') {
        key.status = 'missed';

        setTimeout(() => {
            ['player1', 'player2'].forEach(player => {
                const index = keys.value[player]?.findIndex(k => k.id === key.id);
                if (index !== -1) {
                    keys.value[player].splice(index, 1);
                }
            });
        }, 300);

        return true;
    }
    return false;
};

// Key press handling
const handleKeyPress = (event) => {
    if (!stageActive.value) return;
    event.preventDefault();

    const keyMap = { 'ArrowLeft': 'left', 'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowRight': 'right' };
    const playerKeys = keys.value[playerID.value];

    if (keyMap[event.key] && playerKeys) {
        checkKeyHit(playerKeys, keyMap[event.key], playerID.value);
        socket.emit('keyPress', { playerID: playerID.value, key: keyMap[event.key] });
    }
};

const checkKeyHit = (playerKeys, keyType, playerNumber) => {
    const targetKeys = playerKeys.filter(key =>
        key.type === keyType &&
        key.status === 'active' &&
        key.position >= TARGET_ZONE_POSITION - TARGET_ZONE_TOLERANCE &&
        key.position <= TARGET_ZONE_POSITION + TARGET_ZONE_TOLERANCE
    );

    if (targetKeys.length > 0) {
        targetKeys.sort((a, b) => Math.abs(TARGET_ZONE_POSITION - a.position) - Math.abs(TARGET_ZONE_POSITION - b.position));

        const key = targetKeys[0];

        const accuracy = Math.abs(TARGET_ZONE_POSITION - key.position);
        const scoreForHit = Math.max(100 - Math.floor(accuracy * 3), 10);

        key.status = 'hit';
        setTimeout(() => {
            const index = keys.value[playerNumber]?.findIndex(k => k.id === key.id);
            if (index !== -1) {
                keys.value[playerNumber].splice(index, 1);
            }
        }, 300);

        //scores.value[playerNumber] += scoreForHit;
        socket.emit('updateScore', { player: playerNumber, score: scoreForHit });
    }
};

// Utility functions
const getKeyIcon = (type) => {
    return `fas fa-arrow-${type}`;
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const clearIntervals = () => {
    clearInterval(keyGenerationInterval);
    clearInterval(gameUpdateInterval);
    clearInterval(stageTimerInterval);
};

// Socket event listeners
onMounted(() => {
    window.addEventListener('keydown', handleKeyPress);

    socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('requestPlayerID', {gameType: 'quickplay'});
    });

    socket.on('assignPlayer', (id) => {
        playerID.value = id;
        waitingForPlayers.value = true;
    });

    socket.on('player1Joined', () => {
        console.log('Player 1 has joined');
    });

    socket.on('player2Joined', () => {
        console.log('Player 2 has joined');
        waitingForPlayers.value = false;
    });

    // Listen for updates to player readiness
    socket.on('player1Ready', () => {
        player1Ready.value = true;
        console.log('Player 1 is ready');
    });

    socket.on('player2Ready', () => {
        player2Ready.value = true;
        console.log('Player 2 is ready');
    });

    socket.on('startGame', () => {
        gameStarted.value = true;
        // Don't call startStage here - wait for startStage event
        console.log('Game started');
    });
    
    socket.on('receiveUsernames', (names) => {
        console.log('Usernames received:', names);
        usernames.value.player1 = names.player1
        usernames.value.player2 = names.player2
    });

    socket.on('startStage', (stageNumber) => {
        // Update stage number first
        currentStage.value = stageNumber;
        console.log(`Starting stage ${stageNumber}`);

        // Then start the stage
        if (!stageActive.value) {
            startStage();
        }
    });

    socket.on('endStage', (results) => {
        // Always accept the server state as the source of truth
        stageWinner.value = results.stageWinner;
        wins.value = results.wins;
        scores.value = results.scores;
        total_scores.value = results.total_scores;


        // Stop any ongoing activity for this stage
        stageActive.value = false;
        clearIntervals();

        console.log(`Stage ended. Winner: Player ${results.stageWinner}. Wins: P1=${results.wins.player1}, P2=${results.wins.player2}`);

    });

    socket.on('nextStage', (nextStageNumber) => {
        console.log(`Advancing to stage ${nextStageNumber}`);
        currentStage.value = nextStageNumber;
        // Don't start the stage here - wait for startStage event
    });

    socket.on('keyGenerated', (key) => {
        // Add key to both players if it doesn't already exist
        if (!keys.value.player1.some(k => k.id === key.id)) {
            keys.value.player1.push({ ...key });
            keys.value.player2.push({ ...key });
        }
    });

    socket.on('keyPress', ({ playerID: playerId, key }) => {
        if (keys.value[playerId]) {  // Safety check
            checkKeyHit(keys.value[playerId], key, playerId);
        } else {
            console.warn(`Keys for ${playerId} not initialized!`);
        }
    });

    socket.on('updateScore', ({ player, score }) => {
        console.log(`Updating score for ${player}: ${score}`);
        scores.value[player] += score;
        //total_scores.value[player] = total_scores;
        console.log(`Scores: ${JSON.stringify(scores.value)}`);
        //console.log(`Total Scores: ${JSON.stringify(total_scores.value)}`);
    });

    socket.on('timerEnded', () => {
        // When the server confirms timer has ended, end the stage
        if (stageActive.value) {
            endStage();
        }
    });

    socket.on('resetGame', () => {
        console.log("Game reset received from server");

        // Reset game state locally
        currentStage.value = 1;
        wins.value = { player1: 0, player2: 0 };
        scores.value = { player1: 0, player2: 0 };
        total_scores.value = { player1: 0, player2: 0 }
        stageWinner.value = 0;
        keys.value = { player1: [], player2: [] };
        gameOverMessage.value = '';
        player1Ready.value = false;
        player2Ready.value = false;
        gameStarted.value = false;
        stageActive.value = false;
        clearIntervals();
        //socket.emit('startGame')
    });

    socket.on('gameOver', (message) => {
        console.log("Game over received from server:", message);
        stageActive.value = false;
        clearIntervals();
        gameOverMessage.value = message;
    });

    socket.on('updateTimer', (newTime) => {
        stageTimer.value = newTime;
    });
    socket.on('playerDisconnected', (id) => {
        console.log('player disconnected: ', id)
        stageActive.value = false;
        clearIntervals();
        gameOverMessage.value = `Player disconnected ${id}`;
    })
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
    clearIntervals();
    socket.off('assignPlayer');
    socket.off('player1Joined');
    socket.off('player2Joined');
    socket.off('player1Ready');
    socket.off('player2Ready');
    socket.off('startGame');
    socket.off('startStage');
    socket.off('endStage');
    socket.off('nextStage');
    socket.off('keyGenerated');
    socket.off('keyPress');
    socket.off('updateScore');
    socket.off('resetGame');
    socket.off('gameOver');
    socket.off('updateTimer');
    socket.off('timerEnded');
    socket.removeAllListeners();
    socket.disconnect();
    console.log('Component unmounted and cleaned up');
});
</script>

<style scoped>
/* Base container styling */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
}

/* Game header and info */
.game-header {
    text-align: center;
    margin-bottom: 30px;
}

.stage-info {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 18px;
    margin-bottom: 20px;
}

.game-over {
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 10px;
    margin: 30px auto;
    text-align: center;
    max-width: 80%;
}

.reset-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    margin: 20px auto;
    display: block;
}

/* Game container layout */
.game-container {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.screen {
    flex: 1;
    border: 3px solid #333;
    border-radius: 10px;
    overflow: hidden;
    background-color: #222;
    color: white;
    transition: all 0.3s ease;
    min-width: 400px;
    max-width: 600px;
    margin-bottom: 20px;
}

.screen.winner {
    border-color: gold;
    box-shadow: 0 0 20px gold;
}

/* Player information */
.player-info {
    background-color: #333;
    padding: 15px;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.player-info h2 {
    margin: 0;
    flex: 1;
}

.score,
.lives {
    flex: 1;
    font-size: 18px;
    padding: 0 10px;
}

/* Game area */
.game-area {
    position: relative;
    height: 500px;
    background-color: #111;
    overflow: hidden;
}

.key-lanes {
    position: absolute;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    height: 100%;
}

.key-lane {
    position: relative;
}

.lane-background {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 50px;
    transform: translateX(-50%);
    background-color: rgba(255, 255, 255, 0.05);
}

.key-spawn-area {
    position: relative;
    height: 100%;
    width: 100%;
}

/* Key styling */
.key {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: white;
    transform: translateX(-50%);
    transition: top 0.3s linear, opacity 0.3s ease;
}

.key.left {
    left: 12%;
    background-color: #f44336;
}

.key.up {
    left: 37%;
    background-color: #4CAF50;
}

.key.down {
    left: 62%;
    background-color: #2196F3;
}

.key.right {
    left: 88%;
    background-color: #f7c948;
}

.key.hit {
    transform: translateX(-50%) scale(1.5);
    opacity: 0;
}

.key.missed {
    opacity: 0.3;
    filter: grayscale(100%);
}

/* Target zone */
.target-zone-line {
    position: absolute;
    bottom: 50px;
    width: 100%;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.7);
}

.key-targets {
    position: absolute;
    bottom: 50px;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.key-target {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
    margin: 0 auto;
    transform: translateY(25px);
}

.key-label {
    text-align: center;
    font-weight: bold;
    margin-top: 5px;
}

.left-target {
    background-color: rgba(244, 67, 54, 0.8);
    border-color: #f44336;
}

.up-target {
    background-color: rgba(76, 175, 80, 0.8);
    border-color: #4CAF50;
}

.down-target {
    background-color: rgba(33, 150, 243, 0.8);
    border-color: #2196F3;
}

.right-target {
    background-color: #f7c948;
    border-color: #ebd69a;
}

/* Controls */
.controls {
    background-color: #333;
    padding: 15px;
    text-align: center;
}

.key-instructions {
    font-size: 14px;
    color: #ccc;
    line-height: 1.5;
    padding: 0 15px;
}

/* Responsive adjustments */
@media (max-width: 900px) {
    .game-container {
        flex-direction: column;
        align-items: center;
    }

    .screen {
        min-width: 350px;
        max-width: 100%;
    }
}

/* Transitions */
.key-move-enter-active,
.key-move-leave-active {
    transition: all 0.3s ease;
}

.key-move-enter-from,
.key-move-leave-to {
    opacity: 0;
    transform: scale(0.5);
}
</style>