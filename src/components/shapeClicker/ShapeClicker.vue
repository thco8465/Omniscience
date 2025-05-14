<template>
  <div v-if="!start" class="info-screen">
    <div class="info-content">
      <h2>Click-a-Palooza Rules</h2>
      <div v-if="dailyModifiers.targetSpecificShape">
        <p v-if="challengeName"><strong>Challenge:</strong> {{ challengeName }}</p>
        <p v-if="challengeDescription">{{ challengeDescription }}</p>
        <p>Click only the <strong class="target">{{ targetShape }}</strong> shapes!</p>
      </div>
      <p v-else>
        Click all shapes except for the one highlighted!
      </p>
      <p>Gold: 10 Levels Reached</p>
      <p>Silver: 7 Levels Reached </p>
      <p>Bronze: 4 Levels Reached</p>
      <button @click="startGame" class="button-info">Start Game</button>
    </div>
  </div>
  <div v-if="start" class="container">
    <h1 class="game-title">Click-a-Palooza</h1>
    <div v-if="gameOver" class="game-over">
      <p>Game Over!</p>
      <p>Your Score: {{ score }}</p>
      <p v-if="medal">You earned the {{ medal }} Medal</p>
      <button @click="startGame">Start Again</button>
    </div>
    <div v-else class="timer">
      <div class="level-time">
        <p>Level: {{ level }}</p>
        <p>Time remaining: {{ timeRemaining }}s</p>
        <div class="timer-bar-container">
          <div class="timer-bar" :style="{ width: (timeRemaining / totalTime * 100) + '%' }"></div>
        </div>

      </div>
      <div>
        <p>Do NOT click: <strong class="forbidden">{{ forbiddenShape }}</strong></p>
      </div>
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
      forbiddenShape: '',
      targetShape: '',
      totalTime: 10, // default, overridden in startTimer
      // existing state...
      dailyModifiers: {},
      challengeName: '',
      challengeDescription: '',
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
    async loadModifiers() {
      console.log('inside load')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const res = await axios.get(`${API_URL}/challenge/daily`);
        const challenge = res.data;
        console.log("Loaded Click-a-Palooza challenge:", challenge);

        if (challenge && challenge.game === "Click-a-Palooza" && challenge.variation) {
          this.challengeName = challenge.name || '';
          this.challengeDescription = challenge.description || '';

          const modifierObj = JSON.parse(challenge.variation);
          this.dailyModifiers = modifierObj;
        }
      } catch (err) {
        console.error("Failed to fetch Click-a-Palooza challenge modifiers", err);
      }
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
      if (this.dailyModifiers.targetSpecificShape) {
        this.targetShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      }
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
        if (this.dailyModifiers.shapesMove) {
          this.moveShape(i); // ✅ i is defined here
        }
      }
    },
    moveShape(index) {
      const container = document.querySelector('.game-container');
      const containerRect = container.getBoundingClientRect();
      const interval = setInterval(() => {
        if (this.gameOver || this.shapes[index].clicked) {
          clearInterval(interval);
          return;
        }
        this.shapes[index].top = Math.random() * (containerRect.height - 50);
        this.shapes[index].left = Math.random() * (containerRect.width - 50);
      }, 1000); // move every second
    },
    handleShapeClick(index) {
      if (!this.gameOver && !this.shapes[index].clicked) {
        const shape = this.shapes[index];

        if (this.dailyModifiers.targetSpecificShape) {
          if (shape.type !== this.targetShape) {
            this.gameOver = true;
            clearInterval(this.timer);
            this.updateAchievements();
            this.submitScoreToLeaderboard();
            return;
          }
        } else {
          if (shape.type === this.forbiddenShape) {
            this.gameOver = true;
            clearInterval(this.timer);
            this.updateAchievements();
            this.submitScoreToLeaderboard();
            return;
          }
        }

        shape.clicked = true;
        this.score += 1;

        if (this.shapes.every((s) =>
          s.clicked ||
          (this.dailyModifiers.targetSpecificShape ? s.type !== this.targetShape : s.type === this.forbiddenShape)
        )) {
          clearInterval(this.timer);
          setTimeout(() => this.nextLevel(), 500);
        }
      }
    },
    async submitScoreToLeaderboard() {
      if (!this.$store.state.user) {
        console.log("No user logged in!");
        return;
      }
      const userId = this.$store.state.user.id;
      const gameName = 'Click-a-Palooza';
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
    startTimer() {
      this.totalTime = this.dailyModifiers.reducedTimePerLevel ? 5 : 10;
      this.timeRemaining = this.totalTime;

      this.timer = setInterval(() => {
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
          clearInterval(this.timer);
          this.gameOver = true;
          this.updateAchievements();
          this.submitScoreToLeaderboard();
        }
      }, 1000);
    },
    async updateAchievements() {
      if (!this.$store.state.user) {
        console.log("No user in store");
        return;
      }

      const userId = this.$store.state.user.id;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const response = await axios.get(`${API_URL}/achievements/${userId}`);
        const currentAchievements = response.data || { score: 0, bronze: 0, silver: 0, gold: 0 };
        let bronze = currentAchievements.bronze;
        let silver = currentAchievements.silver;
        let gold = currentAchievements.gold;

        if (this.level > 9) this.medal = "gold", gold += 1;
        else if (this.level > 6) this.medal = "silver", silver += 1;
        else if (this.level > 3) this.medal = "bronze", bronze += 1;

        await axios.post(`${API_URL}/achievements/${userId}`, {
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
  async mounted() {
    if (this.$route.query.daily?.toLowerCase() === "true") {
      await this.loadModifiers()

    }
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
  font-family: Arial, sans-serif;
  margin: 0px auto;
  background-color: rgba(230, 57, 70, 0.8);
  /* Transparent red (#e63946) with 80% opacity */
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  min-height: 80vh;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(247, 201, 72, 0.5);
  /* Transparent border */
}

/* Info Screen Styles */
.info-screen {
  position: fixed;
  top: 100px;
  left: 0;
  width: 100%;
  height: 80%;
  background-color: rgba(255, 255, 255, 0.8);
  /* Transparent white with 80% opacity */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  transition: opacity 0.5s ease;
}

.timer-bar-container {
  width: 100%;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  margin-top: 5px;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 1s linear;
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
  background-color: rgba(52, 152, 219, 0.8);
  /* Transparent blue (#3498db) with 80% opacity */
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 1s ease;
}

.button-info:hover {
  background-color: rgba(41, 128, 185, 0.8);
  /* Darker blue on hover */
}

.game-title {
  color: rgba(247, 201, 72, 0.8);
  /* Transparent yellow (#f7c948) with 80% opacity */
  text-shadow: 2px 2px 2px black, -1px 0 3px #002823;
  font-family: 'Libre Baskerville', serif;
  background-color: rgba(142, 68, 173, 0.8);
  /* Transparent purple (#8e44ad) with 80% opacity */
  border-radius: 15px;
  display: flex;
  justify-content: center;
  width: 500px;
}

.game-container {
  position: relative;
  width: 400px;
  height: 400px;
  background-color: rgba(243, 243, 243, 0.8);
  /* Transparent light gray (#f3f3f3) with 80% opacity */
  border: 2px solid rgba(0, 0, 0, 0.8);
  /* Transparent black border */
  margin-top: 0px;
  overflow: hidden;
  border-radius: 10px;
}

.forbidden {
  font-size: 20px;
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
  border-radius: 0 !important; /* Prevent rounding */
}

/* Clicked State */
.clicked {
  opacity: 0.3;
  pointer-events: none;
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0px;
}

.shape {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: top 0.5s ease, left 0.5s ease;
}

.shape.square {
  border-radius: 0;
}

.shape.triangle {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 50px solid;
  background: none;
}

.level-time {
  display: flex;
  justify-content: center;
  gap: 20px;
  /* Adds space between the level and time remaining */
}

button {
  padding: 10px;
  background-color: rgba(223, 255, 0, 0.8);
  /* Transparent yellow (#dfff00) with 80% opacity */
  color: rgba(142, 68, 173, 0.8);
  /* Transparent purple (#8e44ad) with 80% opacity */
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  font-family: 'Arcade Classic', sans-serif;
  border-radius: 15px;
}

button:hover {
  background-color: rgba(160, 231, 160, 0.8);
  /* Transparent greenish-yellow on hover */
}

.game-over {
  text-align: center;
  margin: 10px;
  font-size: 24px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.7);
  /* Transparent black with 70% opacity */
  color: white;
  padding: 20px;
  border-radius: 10px;
}
</style>
