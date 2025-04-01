<template>
    <div class="input-bar">
      <span 
        v-for="(char, index) in secretWord.split('')" 
        :key="index" 
        :class="{ space: char === ' ', letter: char !== ' ' }"
      >
        {{ char === ' ' ? ' ' : (guessedLetters.includes(char.toLowerCase()) ? char : '') }}
      </span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      secretWord: String, // The word to guess
      guessedLetters: Array, // List of correctly guessed letters
    },
    computed: {
      displayedWord() {
        return this.secretWord
          .split("")
          .map((letter) => (this.guessedLetters.includes(letter.toLowerCase()) ? letter : "_"));
      },
    },
  };
  </script>
  
  <style scoped>
  .input-bar {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 5px;
  }
  
  .letter {
    text-transform: uppercase;
    border-bottom: 2px solid black;
    width: 25px;
    text-align: center;
  }
  .space{
    min-width: 20px;
    background: #8e44ad;
  }
  </style>
  