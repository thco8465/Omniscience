<template>
    <div class="grid">
      <div v-for="(guess, index) in guesses" :key="index" class="prev-guess-row">
        <div v-for="(letter, idx) in guess" :key="idx" :class="feedback[index][idx]">
          {{ letter }}
        </div>
      </div>
  
      <!-- Display the current guess while typing (always show it) -->
      <div v-if="!isGameOver" class="curr-guess-row">
        <div v-for="(letter, idx) in Array.from({ length: 5 })" :key="idx" class="letter-box">
          {{ currentGuess[idx] || '' }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      guesses: {
        type: Array,
        required: true
      },
      feedback: {
        type: Array,
        required: true
      },
      currentGuess: {
        type: String,
        default: "" // Provide a default value for currentGuess
      },
      maxGuesses: {
        type: Number,
        required: true
      }
    },
    computed: {
      isGameOver() {
        return this.guesses.length >= this.maxGuesses;
      }
    },
  };
  </script>
  


<style scoped>
.grid {
    display: grid;
    grid-auto-rows: 60px;
    /* Each row has a consistent height */
    grid-template-rows: repeat(var(--row-count, 6), 1fr);
    /* Dynamically set the row count */
    gap: 10px;
    /* Gap between rows */
    justify-items: center;
    /* Centers the grid columns */
    align-items: start;
    /* Align rows to the top */
    min-height: 360px;
    /* Set a minimum height so the grid doesn't shrink too much */
    max-height: 480px;
    /* Optionally, set a max height to prevent excessive expansion */
    height: auto;
    /* Let the height adjust based on content but with constraints */
}

.prev-guess-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    /* Gap between letter boxes */
    width: 100%;
    /* Ensures the row takes full width of its parent */
}

.prev-guess-row>div {
    aspect-ratio: 1;
    /* Ensures the boxes are squares */
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #333;
    /* Box border */
    font-size: 24px;
    /* Font size for letters */
    box-sizing: border-box;
    /* Ensures padding/border doesn't affect size */
}

.curr-guess-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
}

.letter-box {
    width: 50px;
    /* Fixed width */
    height: 50px;
    /* Fixed height */
    display: flex;
    border: 2px solid #333;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    box-sizing: border-box;
    /* Ensures padding/border doesn't affect size */
}

.correct {
    background-color: green;
}

.present {
    background-color: yellow;
}

.absent {
    background-color: gray;
}
</style>