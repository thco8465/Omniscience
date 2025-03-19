<template>
    <div class="container">
        <h1>Convert Currency</h1>
        <div>
            <div>
                <h1>Gold: {{ currG }} 🥇</h1>
                <h1>Silver: {{ currS }} 🥈</h1>
                <h1>Bronze: {{ currB }} 🥉</h1>
            </div>
            <div class="GtoS">
                <h2>
                    Gold : Silver -> 1 : 2
                </h2>
                <h2>{{ GtoS }} : {{ GtoS * 2 }}</h2>
                <div class="btns">
                    <button @click="decreaseGtoS" :disabled="this.GtoS <= 0">-</button>
                    <button @click="increaseGtoS" :disabled="this.GtoS >= this.currG">+</button>
                    <button @click="convertGtoS" :disabled="this.GtoS <= 0">Convert</button>
                </div>
            </div>
            <div class="GtoB">
                <h2>
                    Gold : Bronze -> 1 : 3
                </h2>
                <h2>{{ GtoB }} : {{ GtoB * 3 }}</h2>
                <div class="btns">
                    <button @click="decreaseGtoB" :disabled="this.GtoB <= 0">-</button>
                    <button @click="increaseGtoB" :disabled="this.GtoB >= this.currG">+</button>
                    <button @click="convertGtoB" :disabled="this.GtoB <= 0">Convert</button>
                </div>
            </div>
            <div class="StoB">
                <h2>
                    Silver : Bronze -> 1 : 2
                </h2>
                <h2>{{ StoB }} : {{ StoB * 2 }}</h2>
                <div class="btns">
                    <button @click="decreaseStoB" :disabled="this.StoB <= 0">-</button>
                    <button @click="increaseStoB" :disabled="this.StoB >= this.currS">+</button>
                    <button @click="convertStoB" :disabled="this.StoB <= 0">Convert</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
//Track: current bronze, silver, gold
//Amount you want to convert
export default {
    data() {
        return {
            userId: this.$store.state.user?.id ?? -1,
            GtoS: 0,
            GtoB: 0,
            StoB: 0,
            currB: 0,
            currS: 0,
            currG: 0,
            API_URL: import.meta.env.VITE_API_URL || 'http://localhost3000'

        }
    },
    methods: {
        async getCurr() {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (this.userId != -1) {
                try {
                    const response = await axios.get(`${API_URL}/achievements/${this.userId}`)
                    if (response.data) {
                        this.currB = response.data.bronze
                        this.currS = response.data.silver
                        this.currG = response.data.gold
                    }
                } catch (error) {
                    console.log('Error getting achievements: ', error)
                }
            }
        },
        increaseGtoB() {
            this.GtoB += 1;
        },
        increaseGtoS() {
            this.GtoS += 1
        },
        increaseStoB() {
            this.StoB += 1
        },
        decreaseGtoB() {
            this.GtoB -= 1
        },
        decreaseGtoS() {
            this.GtoS -= 1
        },
        decreaseStoB() {
            this.StoB -= 1
        },
        convertGtoB() {
            const newGold = this.currG - this.GtoB
            const newBronze = this.currB + this.GtoB * 3
            try {
                axios.post(`${this.API_URL}/achievements/${this.userId}`, {
                    gold: newGold,
                    bronze: newBronze,
                })
                this.currG = newGold
                this.currB = newBronze
            } catch (error) {
                console.log('Failure to convert Gold to Bronze: ', error)
            }
        },
        convertGtoS() {
            const newGold = this.currG - this.GtoS
            const newSilver = this.currS + this.GtoS * 2
            try {
                axios.post(`${this.API_URL}/achievements/${this.userId}`, {
                    gold: newGold,
                    silver: newSilver
                })
                this.currG = newGold
                this.currS = newSilver
            } catch (error) {
                console.log('Failure to convert Gold to Silver: ', error)
            }
        },
        convertStoB() {
            const newSilver = this.currS - this.StoB
            const newBronze = this.currB + this.StoB * 2
            try {
                axios.post(`${this.API_URL}/achievements/${this.userId}`, {
                    silver: newSilver,
                    bronze: newBronze,
                })
                this.currB = newBronze
                this.currS = newSilver
            } catch (error) {
                console.log('Failure to convert Silver to Bronze: ', error)
            }
        }
    },
    mounted() {
        this.getCurr()
    },
}
</script>
<style>
.container {
    background-color: #2c3e50;
    color: white;
    border-radius: 5px;
}

.GtoS {
    background: linear-gradient(145deg, #d9d9d9, #bfbfbf, #f5f5f5);
    border-radius: 5px;
    padding: 5px 5px;
    margin: 5px;
    box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.6),
        inset -2px -2px 5px rgba(0, 0, 0, 0.3);
    border: 1px solid #b0b0b0;
}

.GtoB,
.StoB {
    background: linear-gradient(145deg, #c38736, #a56924, #e0a15a);
    border-radius: 5px;
    padding: 5px 5px;
    margin: 5px;
    box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.4),
        inset -2px -2px 5px rgba(0, 0, 0, 0.3);
    border: 1px solid #8c5a22;
}

.btns {
    padding: 5px 5px;
    margin: 5px;
}

button {
    padding: 10px 20px;
    margin: 5px;
    background-color: #4CAF50;
    transition: background-color 1.0s
}

button:hover:not(:disabled) {
    background-color: gold;
}

button:disabled {
    background-color: #831c1c;
    cursor: not-allowed;
}
</style>