<template>
    <div class="card" :class="{ flipped: isFlipped, matched: isMatched }" @click="flipCard">
      <div class="card-content" v-if="isFlipped">
        <div class="text-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['isFlipped', 'isMatched'],
    methods: {
      flipCard() {
        this.$emit('flip');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles for the card */
  .card {
    width: 100px;
    height: 150px;
    border: 1px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    perspective: 1000px;
    transition: transform 0.6s;
    position: relative;
    background-color: #8e44ad;
    color: #DFFF00;
  }
  
  .card-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    backface-visibility: hidden; /* Ensure the back face is hidden during the flip */
  }
  
  .text-content {
    transform: rotateY(180deg); /* Adjust as needed */
  }
  
  .flipped {
    transform: rotateY(180deg);
  }
  
  .matched {
    background-color: #8effa9;
    border: 1px solid #4caf50;
    cursor: default;
  }
  </style>