<template>
    <div class="keyboard">
        <div class="row" v-for="(row, index) in keys" :key="index">
            <button 
                v-for="key in row" 
                :key="key" 
                :class="keyStates[key.toLowerCase()] || ''"
                @click="pressKey(key)"
            >
                {{ key }}
            </button>
        </div>
        <div class="action-buttons">
            <button @click="$emit('delete')">Delete</button>
            <button @click="$emit('submit')">Enter</button>
        </div>
    </div>
</template>

<script>
export default {
    props: ["keyStates"],
    data() {
        return {
            keys: [
                ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
                ["Z", "X", "C", "V", "B", "N", "M"],
            ],
        };
    },
    mounted() {
        window.addEventListener("keydown", this.handleKeyPress);
    },
    beforeUnmount() {
        window.removeEventListener("keydown", this.handleKeyPress);
    },
    methods: {
        pressKey(key) {
            this.$emit("letter", key);
        },
        handleKeyPress(event) {
            const key = event.key.toUpperCase();
            if (this.isLetterKey(key)) {
                this.$emit("letter", key);
            } else if (key === "BACKSPACE") {
                this.$emit("delete");
            } else if (key === "ENTER") {
                this.$emit("submit");
            }
        },
        isLetterKey(key) {
            return /^[A-Z]$/.test(key);
        },
    },
};
</script>

<style scoped>
.keyboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #4e54c8, #8f94fb); /* Modern gradient */
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* Subtle shadow */
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
}

.row {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 10px;
    width: 100%;
}

button {
    margin: 5px;
    display: flex;
    justify-content: center;
    padding: 15px 20px;
    font-size: 18px;
    cursor: pointer;
    border-radius: 5px;
    background-color: #444;
    color: white;
    border: none;
    transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out;
    flex: 1;
    min-width: 40px;
    max-width: 70px; /* Ensures button doesn't get too large */
    box-sizing: border-box;
}
button.correct {
  background-color: green;
  color: white;
}

button.present {
  background-color: yellow;
  color: black;
}

button.absent {
  background-color: red;
  color: white;
}
button:hover {
    background-color: #8f94fb; /* Lighten on hover */
    transform: scale(1.05);
}

button:active {
    background-color: #4e54c8; /* Darker shade on active */
}

button:focus {
    outline: none;
}

button:disabled {
    background-color: #888;
    cursor: not-allowed;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    width: 100%;
    margin-top: 20px;
}
.key-row{
    display: flex;
    gap: 5px;
    justify-content: center;
}

</style>