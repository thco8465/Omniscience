<template>
    <div>
        <h1>About Section</h1>
        <div class="color-container">
            <button @click="isOpen = !isOpen" class="dropdown-button">
                {{ isOpen ? "Hide Color Impact" : "Show Color Impact" }}
            </button>

            <div v-if="isOpen" class="color">
                <h1>Color Impact on Cognition</h1>
                <h2 class="blu">🔵 Blue - Enhances Focus & Productivity</h2>
                <h2 class="gree">🟢 Green - Supports Balance & Learning</h2>
                <h2 class="yello">🟡 Yellow - Stimulates Attention & Creativity</h2>
                <h2 class="re">🔴 Red - Boosts Alertness & Emotion-Driven Memory</h2>
                <h2 class="purpl">🟣 Purple - Aids in Problem-Solving & Retention</h2>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from "vue";

const isOpen = ref(false);

</script>
<style scoped>
.color {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>