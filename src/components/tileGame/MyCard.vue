<template>
  <div class="card" :class="[equippedCardStyle, { flipped: isFlipped, matched: isMatched }]" @click="flipCard">
    <div class="card-content" v-if="isFlipped">
      <div class="text-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  props: ["isFlipped", "isMatched"],
  setup() {
    const store = useStore();

    // Get the equipped card style from Vuex (or use a default)
    const equippedCardStyle = computed(() => store.state.equippedCard || "default-card");
    //console.log('equipped card style: ', equippedCardStyle)

    return { equippedCardStyle };
  },
  methods: {
    flipCard() {
      this.$emit("flip");
    },
  },
};
</script>

<style scoped>
.card {
  width: 100px;
  height: 150px;
  border-radius: 8px;
  cursor: pointer;
  perspective: 1000px;
  transition: transform 0.6s;
  position: relative;
}

/* Default card style */
.default-card {
  background-color: white;
  border: 2px solid #000;
  color: #000;
}

/* Dynamic card themes */
.red-card {
  background-color: #ff4d4d;
  border: 2px solid #b30000;
  color: black;
}

.blue-card {
  background-color: #4d79ff;
  border: 2px solid #0033cc;
  color: black;
}

.green-card {
  background-color: #4dff4d;
  border: 2px solid #008000;
  color: black;
}

.purple-card {
  background-color: #b366ff;
  border: 2px solid #6600cc;
  color: black;
}

.gold-card {
  background-color: gold;
  border: 2px solid goldenrod;
  color: black;
}

/* Platinum Card Style */
.platinum-card {
  background: linear-gradient(135deg, #e0e0e0, #b8b8b8);
  /* border-radius: 10px; */
  border: 2px solid #b0b0b0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.3);
  /* padding: 20px; */
  text-align: center;
  color: #333;
  /* font-size: 18px; */
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.platinum-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.4);
}

.platinum-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0.2));
  animation: shine 2s infinite;
  pointer-events: none;
}

/* Diamond Card Style */
.diamond-card {
  background: linear-gradient(135deg, #5a5cfa, #66c2ff);
  border-radius: 10px;
  border: 2px solid #3377cc;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.2);
  /* padding: 20px; */
  text-align: center;
  color: #fff;
  /* font-size: 18px; */
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.diamond-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), inset 0 0 25px rgba(255, 255, 255, 0.3);
}

/* Adjust shimmer effect */
.diamond-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0.2));
  animation: shimmer 6s infinite ease-in-out;
  animation-delay: 0s;
  pointer-events: none;
  transform: rotate(45deg);
}

/* Updated shimmer animation for a more diamond-like effect */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    opacity: 0.8;
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    opacity: 0.8;
  }
}
/* Rainbow Card Style */
.rainbow-card {
  background: linear-gradient(45deg, red, orange, yellow, green, blue, purple);
  background-size: 400% 400%;
  animation: rainbow 5s ease infinite;
  border-radius: 10px;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.3);
  /* padding: 20px; */
  text-align: center;
  color: #fff;
  /* font-size: 18px; */
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.rainbow-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), inset 0 0 25px rgba(255, 255, 255, 0.4);
}


@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Card flip effects */
.card-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  backface-visibility: hidden;
}

.text-content {
  transform: rotateY(180deg);
}

.flipped {
  transform: rotateY(180deg);
}

.matched {
  background-color: #8effa9;
  border: 1px solid #4caf50;
  cursor: default;
}
.diamond-card.matched {
  background: #8effa9;  /* Override the diamond card's background */
  border: 2px solid #4caf50;  /* Green border when matched */
}
</style>
