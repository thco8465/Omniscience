<template>
    <div class="store-page">
        <header class="store-header">
            <h1>Cosmetics Store</h1>
        </header>
        <div class="currency">
            <h2>Currency</h2>
            <div class="currency-details">
                <p><strong>Gold:</strong> {{ gold }} 🥇</p>
                <p><strong>Silver:</strong> {{ silver }} 🥈</p>
                <p><strong>Bronze:</strong> {{ bronze }} 🥉</p>
            </div>
            <button @click="redirectToConverter">Convert Currency</button>
        </div>
        <div v-if="message" class="msg">
            {{ message }}
        </div>
        <div class="items-container">
            <div class="background-column">
                <h3>Backgrounds</h3>
                <div v-for="item in backgrounds" :key="item.id" class="item">
                    <h4>{{ item.name }}</h4>
                    <img :src="item.image_url" alt="Background" class="cosmetic-image" />
                    <p class="price">
                        Price:
                        <span class="currency-price">Gold: {{ item.price_gold }}</span>,
                        <span class="currency-price">Silver: {{ item.price_silver }}</span>,
                        <span class="currency-price">Bronze: {{ item.price_bronze }}</span>
                    </p>
                    <button
                        :class="{ 'buy-button': true, 'disabled': !(gold > item.price_gold || silver > item.price_silver || bronze > item.price_bronze) }"
                        @click="buyItem(item.id, item.name)"
                        :disabled="!(gold > item.price_gold || silver > item.price_silver || bronze > item.price_bronze)">
                        Buy
                    </button>
                </div>
            </div>

            <div class="avatar-column">
                <h3>Avatars</h3>
                <div v-for="item in avatars" :key="item.id" class="item">
                    <h4>{{ item.name }}</h4>
                    <img :src="item.image_url" alt="Avatar" class="cosmetic-image" />
                    <p class="price">
                        Price:
                        <span class="currency-price">Gold {{ item.price_gold }}</span>,
                        <span class="currency-price">Silver {{ item.price_silver }}</span>,
                        <span class="currency-price">Bronze {{ item.price_bronze }}</span>
                    </p>
                    <button
                        :class="{ 'buy-button': true, 'disabled': !(gold > item.price_gold || silver > item.price_silver || bronze > item.price_bronze) }"
                        @click="buyItem(item.id, item.name)"
                        :disabled="!(gold > item.price_gold || silver > item.price_silver || bronze > item.price_bronze)">
                        Buy
                    </button>
                </div>
            </div>

            <div class="cards-column">
                <h3>Cards</h3>
                <div v-for="item in cards" :key="item.id" class="item">
                    <h4>{{ item.name }}</h4>
                    <div v-if="item.style_class" :style="{ background: getColorFromClass(item.style_class) }"
                        class="color-sample"></div>
                    <p class="price">
                        Price:
                        <span class="currency-price">Gold {{ item.price_gold }}</span>,
                        <span class="currency-price">Silver {{ item.price_silver }}</span>,
                        <span class="currency-price">Bronze {{ item.price_bronze }}</span>
                    </p>
                    <button
                        :class="{ 'buy-button': true, 'disabled': !(gold > item.price_gold || silver > item.price_silver || bronze > item.price_bronze) }"
                        @click="buyItem(item.id, item.name)"
                        :disabled="!(gold > item.price_gold || silver > item.price_silver || bronze > item.price_bronze)">
                        Buy
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import store from '@/store';
import axios from 'axios'

export default {
    data() {
        return {
            user_id: this.$store.state.user ? this.$store.state.user.id : null,
            gold: 0,
            silver: 0,
            bronze: 0,
            backgrounds: [],
            avatars: [],
            cards: [],
            message: '',
        }
    },
    methods: {
        redirectToConverter() {
            this.$router.push({ name: 'ConvertCurr' })
        },
        async fetchAchievements() {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (!this.user_id) {
                console.log('No user value')
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/achievements/${this.user_id}`);
                const { gold, silver, bronze } = response.data;

                // Set currency values from the response
                this.gold = gold;
                this.silver = silver;
                this.bronze = bronze;
            } catch (error) {
                console.error("Error fetching currency:", error);
            }
        },
        getColorFromClass(styleClass) {
            // Map style class to color
            const colors = {
                'red-card': '#ff4d4d',
                'blue-card': '#4d79ff',
                'green-card': '#4dff4d',
                'purple-card': '#b366ff',
                'gold-card': 'gold',
                'platinum-card': 'linear-gradient(135deg, #e0e0e0, #b8b8b8)', // Platinum gradient
                'diamond-card': 'linear-gradient(135deg, #5a5cfa, #66c2ff)',  // Diamond gradient
                'rainbow-card': 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)', // Rainbow gradient
                // Add more mappings if necessary
            };

            return colors[styleClass] || '#ffffff'; // Default to white if no match
        },
        async buyItem(item_id, item_name) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                await axios.post(`${API_URL}/store/${this.user_id}`, { item_id });
                this.message = `You have successfully purchased ${item_name}. Equip in Profile`
                setTimeout(() => {
                    this.message = '';  // Clear the message after 5 seconds
                }, 5000);  // 5000 milliseconds = 5 seconds
                this.fetchAchievements();
                this.fetchStoreItems();
            } catch (error) {
                console.error("Error purchasing item:", error);
                this.message = "There was an issue with your purchase"
            }
        },
        async equipCard(cardStyle) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                await axios.post(`${API_URL}/equip-card/${store.state.user.id}`, { cardStyle });
                store.commit("setEquippedCard", cardStyle);
            } catch (error) {
                console.error("Error equipping card: ", error)
            }
        },
        async fetchStoreItems() {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                const response = await axios.get(`${API_URL}/store/${this.user_id}`);
                const items = response.data;

                // Categorize items based on their type
                this.backgrounds = items.filter(item => item.type === 'background');
                this.avatars = items.filter(item => item.type === 'avatar');
                this.cards = items.filter(item => item.type === 'card');
            } catch (error) {
                console.error("Error fetching store items:", error);
            }
        },
        async fetchAllItems() {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                const response = await axios.get(`${API_URL}/allstore`);
                const items = response.data;

                // Categorize items based on their type
                this.backgrounds = items.filter(item => item.type === 'background');
                this.avatars = items.filter(item => item.type === 'avatar');
                this.cards = items.filter(item => item.type === 'card');
            } catch (error) {
                console.error("Error fetching store items:", error);
            }
        }

    },
    mounted() {
        // Fetch initial currency values 
        this.fetchAchievements();
        if (this.user_id) {
            this.fetchStoreItems();
        } else {
            this.fetchAllItems();
        }
    }
}
</script>

<style scoped>
.store-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
}

.store-header {
    text-align: center;
    margin-bottom: 40px;
}

.color-sample {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    margin: 10px 0;
    display: inline-block;
    background-color: #ecf0f1;
    /* Light Grayish Blue */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.store-header h1 {
    font-size: 36px;
    color: #f7c948;
    /* Gold */
    font-weight: bold;
    background-color: rgba(74, 144, 226, 0.8);
    /* Dark Blue-Gray */
    border-radius: 5px;
    border: 2px solid #f7c948;
}

.currency {
    background-color: rgba(74, 144, 226, 0.8);
    /* Dark Blue-Gray */
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 40px;
    border: 2px solid #f7c948;

}

.msg {
  border: 1px solid #ddd;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;

  /* Ensure the message is fixed on screen */
  position: fixed;
  top: 20px;  /* You can adjust this value to position it vertically where you want */
  left: 50%;
  transform: translateX(-50%);  /* Center the message horizontally */
  z-index: 9999;  /* Ensure it's in front of other content */
}


.currency h2 {
    font-size: 28px;
    color: #f7c948;
    /* Light Grayish Blue */
    margin-bottom: 10px;
}

.currency-details p {
    font-size: 18px;
    color: #ecf0f1;
    /* Light Grayish Blue */
    margin: 5px 0;
}

.items-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* 3 equal-width columns */
    gap: 30px;
    margin-top: 40px;
    grid-auto-rows: auto;
    /* Ensure that row heights adjust automatically */
    align-items: flex-start;
    /* Align items at the top of each column */
}

.background-column,
.avatar-column,
.cards-column {
    padding: 20px;
    background-color: rgba(74, 144, 226, 0.8);
    /* Dark Blue-Gray */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    color: #f7c948;
    /* Gold */
    justify-content: center;
    align-items: center;
    border: 2px solid
}

.item-column h3 {
    font-size: 24px;
    text-align: center;
    color: #f7c948;
    /* Gold */
    margin-bottom: 20px;
}

.item {
    border: 1px solid #ddd;
    padding: 15px;
    background-color: #fff;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

}

.item:hover {
    transform: translateY(-10px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.item h4 {
    font-size: 20px;
    color: #34495e;
    /* Steel Blue */
    margin-bottom: 10px;
}

.cosmetic-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    margin-bottom: 15px;
    border-radius: 8px;
}

.price {
    font-size: 16px;
    color: #34495e;
    /* Steel Blue */
    margin-bottom: 20px;
}

.currency-price {
    font-weight: bold;
    color: #e67e22;
    /* Warm Orange */
}

button {
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background-color: #50c878;
    /* Teal */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
}

button:hover {
    background-color: #1ca454;
    /* Lighter Teal */
}

button:disabled {
    background-color: #bdc3c7;
    /* Silver Gray */
    cursor: not-allowed;
}

.buy-button {
    background-color: #50c878;
    /* Emerald Green */
    color: white;
    border: none;
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
}

.buy-button:hover {
    background-color: #3ca769;
    /* Darker green on hover */
}

.buy-button:active {
    background-color: #2e8b57;
    /* Even darker when clicked */
}

.buy-button.disabled {
    background-color: gray;
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
