<template>
    <div class="container">
      <div class="game-header">
        <h1>Key Clash (local)</h1>
        <div v-if="currentStage <= maxStages" class="stage-info">
          <span class="stage">Stage: {{ currentStage }}/{{ maxStages }}</span>
          <span class="timer">Time: {{ formatTime(stageTimer) }}</span>
        </div>
        <!-- test -->
        <div v-else class="game-over">
          <h2>Game Over!</h2>
          <p>{{ gameOverMessage }}</p>
          <button @click="resetGame" class="reset-button">Play Again</button>
        </div>
      </div>
  
      <div class="game-container">
        <div class="screen" :class="{ 'winner': stageWinner === 1 }">
          <div class="player-info">
            <h2>Player 1</h2>
            <div class="score">Score: {{ player1Score }}</div>
            <div class="lives">Lives: {{ maxStages - player2Wins }}</div>
          </div>
          <div class="game-area" ref="player1GameArea">
            <div class="key-lanes">
              <div class="key-lane" v-for="(type, index) in keyTypes" :key="type">
                <div class="lane-background"></div>
              </div>
            </div>
            
            <div class="key-spawn-area">
              <transition-group name="key-move">
                <div 
                  v-for="key in player1Keys" 
                  :key="key.id" 
                  class="key" 
                  :class="[key.type, key.status]" 
                  :style="{ top: `${key.position}px` }"
                >
                  <i :class="getKeyIcon(key.type)"></i>
                </div>
              </transition-group>
            </div>
            
            <div class="target-zone-line"></div>
            
            <div class="key-targets">
              <div class="key-target left-target">
                <span class="key-label">A</span>
              </div>
              <div class="key-target up-target">
                <span class="key-label">W</span>
              </div>
              <div class="key-target down-target">
                <span class="key-label">S</span>
              </div>
              <div class="key-target right-target">
                <span class="key-label">D</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <div class="key-instructions">
              <p>Use A, W, S, D keys</p>
            </div>
          </div>
        </div>
  
        <div class="screen" :class="{ 'winner': stageWinner === 2 }">
          <div class="player-info">
            <h2>Player 2</h2>
            <div class="score">Score: {{ player2Score }}</div>
            <div class="lives">Lives: {{ maxStages - player1Wins }}</div>
          </div>
          <div class="game-area" ref="player2GameArea">
            <div class="key-lanes">
              <div class="key-lane" v-for="(type, index) in keyTypes" :key="type">
                <div class="lane-background"></div>
              </div>
            </div>
            
            <div class="key-spawn-area">
              <transition-group name="key-move">
                <div 
                  v-for="key in player2Keys" 
                  :key="key.id" 
                  class="key" 
                  :class="[key.type, key.status]" 
                  :style="{ top: `${key.position}px` }"
                >
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
  
  // Game constants
  const keyTypes = ['left', 'up', 'down', 'right'];
  const MAX_STAGES = 5;
  const TARGET_ZONE_POSITION = 450; // Position of the target zone from the top
  const TARGET_ZONE_TOLERANCE = 30; // Pixels of tolerance for hitting the target
  const STAGE_DURATION = 10; // Duration of each stage in seconds
  
  // Game state
  const maxStages = ref(MAX_STAGES);
  const currentStage = ref(1);
  const player1Score = ref(0);
  const player2Score = ref(0);
  const player1Keys = ref([]);
  const player2Keys = ref([]);
  const player1Wins = ref(0);
  const player2Wins = ref(0);
  const stageTimer = ref(STAGE_DURATION);
  const stageActive = ref(false);
  const stageWinner = ref(0);
  const gameOverMessage = ref('');
  
  // References to game areas for dimensions
  const player1GameArea = ref(null);
  const player2GameArea = ref(null);
  
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
  
  // Game mechanics
  const startStage = () => {
    player1Score.value = 0;
    player2Score.value = 0;
    player1Keys.value = [];
    player2Keys.value = [];
    stageWinner.value = 0;
    stageTimer.value = STAGE_DURATION;
    stageActive.value = true;
  
    // Start key generation
    keyGenerationInterval = setInterval(generateKeys, keyFrequency.value);
    
    // Start game update loop
    gameUpdateInterval = setInterval(updateGame, 16); // ~60fps
    
    // Start stage timer
    stageTimerInterval = setInterval(() => {
      stageTimer.value--;
      if (stageTimer.value <= 0) {
        endStage();
      }
    }, 1000);
  };
  
  const endStage = () => {
    stageActive.value = false;
    clearInterval(keyGenerationInterval);
    clearInterval(gameUpdateInterval);
    clearInterval(stageTimerInterval);
    
    // Determine stage winner
    if (player1Score.value > player2Score.value) {
      stageWinner.value = 1;
      player1Wins.value++;
    } else if (player2Score.value > player1Score.value) {
      stageWinner.value = 2;
      player2Wins.value++;
    } else {
      // Handle tie - both players get a point
      stageWinner.value = 3;
    }
    
    // Check if game is over
    if (player1Wins.value >= maxStages.value / 2 + 0.5) {
      endGame(1);
    } else if (player2Wins.value >= maxStages.value / 2 + 0.5) {
      endGame(2);
    } else {
      // Move to next stage after a delay
      setTimeout(() => {
        currentStage.value++;
        startStage();
      }, 3000);
    }
  };
  
  const endGame = (winner) => {
    currentStage.value = maxStages.value + 1; // Set to value that shows game over screen
    gameOverMessage.value = `Player ${winner} wins the game!`;
  };
  
  const resetGame = () => {
    currentStage.value = 1;
    player1Wins.value = 0;
    player2Wins.value = 0;
    stageWinner.value = 0;
    startStage();
  };
  
  // Key generation and management
  const generateKeys = () => {
    if (!stageActive.value) return;
    
    // Create a pattern to ensure both players get the same sequence
    const keyType = keyTypes[Math.floor(Math.random() * keyTypes.length)];
    
    const key1 = {
      id: Date.now() + Math.random(),
      type: keyType,
      position: 0,
      status: 'active'
    };
    
    const key2 = {
      id: Date.now() + Math.random() + 1,
      type: keyType,
      position: 0,
      status: 'active'
    };
    
    player1Keys.value.push(key1);
    player2Keys.value.push(key2);
  };
  
  const updateGame = () => {
    if (!stageActive.value) return;
    
    // Update player 1 keys
    player1Keys.value = player1Keys.value.filter(key => {
      key.position += gameSpeed.value;
      
      // Remove keys that went past the bottom
      if (key.position > TARGET_ZONE_POSITION + TARGET_ZONE_TOLERANCE && key.status === 'active') {
        key.status = 'missed';
        setTimeout(() => {
          player1Keys.value = player1Keys.value.filter(k => k.id !== key.id);
        }, 300);
        return true;
      }
      
      // Keep only active or temporarily showing hit/missed keys
      return key.status === 'active' || (key.status !== 'active' && key.position < TARGET_ZONE_POSITION + 100);
    });
    
    // Update player 2 keys
    player2Keys.value = player2Keys.value.filter(key => {
      key.position += gameSpeed.value;
      
      // Remove keys that went past the bottom
      if (key.position > TARGET_ZONE_POSITION + TARGET_ZONE_TOLERANCE && key.status === 'active') {
        key.status = 'missed';
        setTimeout(() => {
          player2Keys.value = player2Keys.value.filter(k => k.id !== key.id);
        }, 300);
        return true;
      }
      
      // Keep only active or temporarily showing hit/missed keys
      return key.status === 'active' || (key.status !== 'active' && key.position < TARGET_ZONE_POSITION + 100);
    });
  };
  
  // Key press handling
  const handleKeyPress = (event) => {
    if (!stageActive.value) return;
    event.preventDefault();
    
    // Player 1 controls (WASD)
    if (event.key === 'a' || event.key === 'A') {
      checkKeyHit(player1Keys, 'left', 1);
    } else if (event.key === 'w' || event.key === 'W') {
      checkKeyHit(player1Keys, 'up', 1);
    } else if (event.key === 's' || event.key === 'S') {
      checkKeyHit(player1Keys, 'down', 1);
    } else if (event.key === 'd' || event.key === 'D') {
      checkKeyHit(player1Keys, 'right', 1);
    }
    
    // Player 2 controls (Arrow keys)
    if (event.key === 'ArrowLeft') {
      checkKeyHit(player2Keys, 'left', 2);
    } else if (event.key === 'ArrowUp') {
      checkKeyHit(player2Keys, 'up', 2);
    } else if (event.key === 'ArrowDown') {
      checkKeyHit(player2Keys, 'down', 2);
    } else if (event.key === 'ArrowRight') {
      checkKeyHit(player2Keys, 'right', 2);
    }
  };
  
  const checkKeyHit = (playerKeys, keyType, playerNumber) => {
  // Find all active keys of the matching type within the target zone
  const targetKeys = playerKeys.value.filter(key => 
    key.type === keyType && 
    key.status === 'active' && 
    key.position >= TARGET_ZONE_POSITION - TARGET_ZONE_TOLERANCE && 
    key.position <= TARGET_ZONE_POSITION + TARGET_ZONE_TOLERANCE
  );
  
  if (targetKeys.length > 0) {
    // Sort by position to get the closest to target (ascending order)
    targetKeys.sort((a, b) => Math.abs(TARGET_ZONE_POSITION - a.position) - Math.abs(TARGET_ZONE_POSITION - b.position));
    
    // Get the closest key (first in the sorted array)
    const key = targetKeys[0];
    
    // Calculate score based on accuracy (closer to target = higher score)
    const accuracy = Math.abs(TARGET_ZONE_POSITION - key.position);
    const scoreForHit = Math.max(100 - Math.floor(accuracy * 3), 10);
    console.log(accuracy, scoreForHit);
    
    // Mark key as hit and remove after a short delay
    key.status = 'hit';
    setTimeout(() => {
      playerKeys.value = playerKeys.value.filter(k => k.id !== key.id);
    }, 300);
    
    // Update the score for the player
    if (playerNumber === 1) {
      player1Score.value += scoreForHit;
    } else {
      player2Score.value += scoreForHit;
    }
  }
};

  
  // Utility functions
  const getKeyIcon = (type) => {
    switch (type) {
      case 'left':
        return 'fas fa-arrow-left';
      case 'up':
        return 'fas fa-arrow-up';
      case 'down':
        return 'fas fa-arrow-down';
      case 'right':
        return 'fas fa-arrow-right';
      default:
        return '';
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress);
    startStage();
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
    clearInterval(keyGenerationInterval);
    clearInterval(gameUpdateInterval);
    clearInterval(stageTimerInterval);
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

.score, .lives {
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
  background-color: #FF9800;
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
  background-color: rgba(255, 152, 0, 0.8);
  border-color: #FF9800;
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