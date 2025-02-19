<template>
  <div class="container">
    <h1 class="game-title">Funky Forms Click-a-Palooza</h1>
    <p>Level: {{ level }}</p>
    <div class="game-container">
      <div v-for="(shape, index) in shapes" :key="index" :class="['shape', shape.type, { clicked: shape.clicked }]"
        @click="handleShapeClick(index)" :style="{
          top: `${shape.top}px`,
          left: `${shape.left}px`,
          backgroundColor: shape.type !== 'triangle' ? shape.color : 'transparent',
          borderBottomColor: shape.type === 'triangle' ? shape.color : 'transparent'
        }"></div>
    </div>
    <div v-if="gameOver" class="game-over">
      <p>Game Over!</p>
      <p>Your Score: {{ score }}</p>
      <p v-if="medal">You earned the {{ medal }} Medal</p>
      <button @click="startGame">Start Again</button>
    </div>
    <div v-else class="timer">
      <p>Time remaining: {{ timeRemaining }}s</p>
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
    };
  },
  methods: {
    startGame() {
      this.shapes = [];
      this.score = 0;
      this.level = 1;
      this.gameOver = false;
      this.spawnShapes();
      this.startTimer();
    },
    nextLevel() {
      this.shapes = [];
      this.level++;
      clearInterval(this.timer); // ✅ Clear existing timer
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
        this.shapes[index].clicked = true;
        this.score += 1;

        if (this.shapes.every((shape) => shape.clicked)) {
          clearInterval(this.timer); // ✅ Clear timer before starting a new level
          setTimeout(() => this.nextLevel(), 500); // ✅ Slight delay to improve UX
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
          this.updateAchievements()
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
        // Fetch current achievements from the database
        const response = await axios.get(`/achievements/${userId}`);
        const currentAchievements = response.data || { score: 0, bronze: 0, silver: 0, gold: 0 };

        // Calculate medals based on the current session's score
        let bronze = currentAchievements.bronze;
        let silver = currentAchievements.silver;
        let gold = currentAchievements.gold;

        if (this.level > 9) this.medal = "gold", gold += 1;
        else if (this.level > 6) this.medal = "silver", silver += 1;
        else if (this.level > 3) this.medal = "bronze", bronze += 1;

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
  },
  mounted() {
    this.startGame();
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
