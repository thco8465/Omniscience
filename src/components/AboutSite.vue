<template>
    <div class="about-section">
        <div class="content">
            <h1>About Cognitive Stimulation</h1>
            <p class="description">
                Engaging in memory and reflex-based games strengthens neural connections, while puzzle, logic, and problem-solving challenges enhance cognitive flexibility. Multiplayer and competitive elements foster social interaction, which helps protect against cognitive decline.
            </p>

            <button @click="isOpen = !isOpen" class="dropdown-button">
                {{ isOpen ? "Hide Color Impact" : "Show Color Impact" }}
            </button>

            <transition name="fade">
                <div v-if="isOpen" class="color-container">
                    <h2>Color Impact on Cognition</h2>
                    <ul>
                        <li class="blue">🔵 <strong>Blue</strong> – Enhances Focus & Productivity</li>
                        <li class="green">🟢 <strong>Green</strong> – Supports Balance & Learning</li>
                        <li class="yellow">🟡 <strong>Yellow</strong> – Stimulates Attention & Creativity</li>
                        <li class="red">🔴 <strong>Red</strong> – Boosts Alertness & Emotion-Driven Memory</li>
                        <li class="purple">🟣 <strong>Purple</strong> – Aids in Problem-Solving & Retention</li>
                    </ul>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
</script>

<style scoped>
.about-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    max-width: 600px;
    margin: auto;
    text-align: center;
    border: 2px solid #4a90e2;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    
}

.content h1 {
    color: #333;
    font-size: 1.8rem;
    margin-bottom: 10px;
}

.description {
    font-size: 1rem;
    color: #555;
    margin-bottom: 20px;
    line-height: 1.5;
}

.dropdown-button {
    background: #4a90e2;
    color: white;
    border: none;
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.3s ease;
}

.dropdown-button:hover {
    background: #357acb;
}

.color-container {
    margin-top: 15px;
    padding: 15px;
    border-radius: 8px;
    background: #f9f9f9;
    text-align: left;
}

.color-container h2 {
    color: #222;
    font-size: 1.3rem;
    margin-bottom: 10px;
}

.color-container ul {
    list-style-type: none;
    padding: 0;
}

.color-container li {
    font-size: 1rem;
    margin-bottom: 8px;
    padding: 5px 10px;
    border-radius: 5px;
}

.blue { background: rgba(74, 144, 226, 0.15); }
.green { background: rgba(34, 197, 94, 0.15); }
.yellow { background: rgba(250, 204, 21, 0.15); }
.red { background: rgba(239, 68, 68, 0.15); }
.purple { background: rgba(168, 85, 247, 0.15); }

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>
