<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Click-a-Palooza Rules</h2>
      <p>Click all shapes except for the one highlighted! You have 10 seconds each level</p>
      <p>Gold: 10 Levels Reached</p>
      <p>Silver: 7 Levels Reached </p>
      <p>Bronze: 4 Levels Reached</p>
      <button @click="startGame" class="button-info">Start Game</button>
    </div>
  </div>
  <div v-if="start" class="container">
    <h1 class="game-title">Click-a-Palooza</h1>
    <p>Level: {{ level }}</p>
    <p>Do NOT click: <strong>{{ forbiddenShape }}</strong></p>
    <div v-if="gameOver" class="game-over">
      <p>Game Over!</p>
      <p>Your Score: {{ score }}</p>
      <p v-if="medal">You earned the {{ medal }} Medal</p>
      <button @click="startGame">Start Again</button>
    </div>
    <div v-else class="timer">
      <p>Time remaining: {{ timeRemaining }}s</p>
    </div>
    <div class="game-container">
      <div v-for="(shape, index) in shapes" :key="index" :class="['shape', shape.type, { clicked: shape.clicked }]"
        @click="handleShapeClick(index)" :style="{
          top: `${shape.top}px`,
          left: `${shape.left}px`,
          backgroundColor: shape.type !== 'triangle' ? shape.color : 'transparent',
          borderBottomColor: shape.type === 'triangle' ? shape.color : 'transparent'
        }"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      shapes: [],
      score: 0,
      timeRemaining: 60,
      gameOver: false,
      timer: null,
      level: 1,
      medal: '',
      start: false,
      forbiddenShape: ''
    };
  },
  methods: {
    startGame() {
      this.start = true;
      this.shapes = [];
      this.score = 0;
      this.level = 1;
      this.gameOver = false;
      this.forbiddenShape = '';

      this.$nextTick(() => {
        this.spawnShapes();
        this.startTimer();
      })
    },
    nextLevel() {
      this.shapes = [];
      this.level++;
      this.gameOver = false;
      clearInterval(this.timer);
      this.timeRemaining = 10;
      this.spawnShapes();
      this.startTimer();
    },
    spawnShapes() {
      const container = document.querySelector('.game-container');
      const containerRect = container.getBoundingClientRect();
      const numShapes = this.level * 2 + 4;
      const shapeTypes = ['circle', 'square', 'triangle'];
      const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
      const placedShapes = [];
      this.forbiddenShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

      for (let i = 0; i < numShapes; i++) {
        let newShape;
        let attempts = 0;

        do {
          newShape = {
            top: Math.random() * (containerRect.height - 50),
            left: Math.random() * (containerRect.width - 50),
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            clicked: false,
          };
          attempts++;
        } while (
          attempts < 50 &&
          placedShapes.some(
            (shape) =>
              Math.hypot(shape.top - newShape.top, shape.left - newShape.left) < 50
          )
        );

        placedShapes.push(newShape);
        this.shapes.push(newShape);
      }
    },
    handleShapeClick(index) {
      if (!this.gameOver && !this.shapes[index].clicked) {
        if (this.shapes[index].type === this.forbiddenShape) {
          this.gameOver = true;
          clearInterval(this.timer);
          this.updateAchievements();
          return;
        }
        this.shapes[index].clicked = true;
        this.score += 1;

        if (this.shapes.every((shape) => shape.clicked || shape.type === this.forbiddenShape)) {
          clearInterval(this.timer);
          setTimeout(() => this.nextLevel(), 500);
        }
      }
    },
    startTimer() {
      this.timeRemaining = 10;
      this.timer = setInterval(() => {
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer);
          this.gameOver = true;
          this.updateAchievements();
        }
      }, 1000);
    },
    async updateAchievements() {
      if (!this.$store.state.user) {
        console.log("No user in store");
        return;
      }

      const userId = this.$store.state.user.id;

      try {
        const response = await axios.get(`/achievements/${userId}`);
        const currentAchievements = response.data || { score: 0, bronze: 0, silver: 0, gold: 0 };

        let bronze = currentAchievements.bronze;
        let silver = currentAchievements.silver;
        let gold = currentAchievements.gold;

        if (this.level > 9) this.medal = "gold", gold += 1;
        else if (this.level > 6) this.medal = "silver", silver += 1;
        else if (this.level > 3) this.medal = "bronze", bronze += 1;

        await axios.post(`/achievements/${userId}`, {
          score: currentAchievements.score + this.score,
          bronze,
          silver,
          gold,
        });

        console.log("Achievements updated successfully");
      } catch (error) {
        console.log("Error updating achievements:", error);
      }
    },
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>



<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
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

.game-container {
  position: relative;
  width: 400px;
  height: 400px;
  background-color: #f3f3f3;
  border: 2px solid black;
  margin-top: 20px;
  overflow: hidden;
}

.shape {
  position: absolute;
  width: 50px;
  height: 50px;
  cursor: pointer;
}

/* Circle */
.circle {
  border-radius: 50%;
}

/* Square */
.square {}

/* Triangle */
.triangle {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 50px solid;
  position: absolute;
}

/* Clicked State */
.clicked {
  opacity: 0.3;
  pointer-events: none;
}

.timer {
  margin-top: 15px;
}

button {
  padding: 10px;
  background-color: #dfff00;
  color: #8e44ad;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  font-family: 'Arcade Classic', sans-serif;
  border-radius: 15px;
}

button:hover {
  background-color: rgb(160, 231, 160);
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
