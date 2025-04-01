<template>
    <div class="hangman-container">
        <h1 class="game-title">HangMan</h1>
        <div class="gallows">
            <div class="top-bar"></div>
            <div class="vertical-post"></div>
            <div class="rope"></div>
        </div>
        <div class="stickfigure">
            <div v-if="wrongGuesses > 0" class="head"></div>
            <div v-if="wrongGuesses > 1" class="body"></div>
            <div v-if="wrongGuesses > 2" class="arm left"></div>
            <div v-if="wrongGuesses > 3" class="arm right"></div>
            <div v-if="wrongGuesses > 4" class="leg left"></div>
            <div v-if="wrongGuesses > 5" class="leg right"></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        wrongGuesses: Number,  //
    }
}
</script>

<style>
.hangman-container {
    position: relative;
    width: 200px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}
.game-title{
    color: #f7c948;
    text-shadow: 1px 1px 1px black, -1px 0 3px #002823;
    font-family: 'Libre Baskerville', serif;
    background-color: #8E44AD;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    width: 500px;
  }
.gallows {
    position: absolute;
    top: 75px;
    left: 50px;
}

.top-bar {
    position: absolute;
    width: 100px;
    height: 5px;
    background-color: black;
    left: 0;
}

.vertical-post {
    position: absolute;
    width: 5px;
    height: 200px;
    background-color: black;
    left: 0;
    top: 5px;
}

.rope {
    position: absolute;
    width: 2px;
    height: 30px;
    background-color: black;
    left: 50px;
    top: 5px;
}

.stickfigure {
    position: absolute;
    top: 110px;
    left: 50px;
}

.head {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 4px solid #e63946;
    background-color: transparent;
    position: absolute;
    left: 31.5px;
}

.body {
    width: 4px;
    height: 65px;
    background-color: #e63946;
    position: absolute;
    top: 35px;
    left: 48px;
}

.arm {
    width: 30px;
    height: 4px;
    background-color: #e63946;
    position: absolute;
    top: 50px;
}

.arm.left {
    left: 20px;
    transform: rotate(-30deg);
}

.arm.right {
    left: 50px;
    transform: rotate(30deg);
}

.leg {
    width: 30px;
    height: 4px;
    background-color: #e63946;
    position: absolute;
    top: 102px;
}

.leg.left {
    left: 20px;
    transform: rotate(-30deg);
}

.leg.right {
    left: 50px;
    transform: rotate(30deg);
}
</style>
