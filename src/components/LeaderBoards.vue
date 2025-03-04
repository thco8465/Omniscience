<template>
    <div class="leaderboard">
        <h1 class="leader-header">Leaderboards</h1>
        <div class="leaderboard-container">
            <div v-for="game in games" :key="game.name" class="game-leaderboard">
                <h1>{{ game.displayName }}</h1>
                <ul>
                    <li v-if="game.list.length === 0">
                        <span>No leaders for this game yet</span>
                    </li>
                    <li v-for="(entry, index) in game.list" :key="entry.user_id" class="leaderboard-item">
                        <div class="leaderboard-item-content">
                            <!-- <img :src="entry.avatar" alt="User Avatar" class="avatar-image" /> -->
                            <div class="user-info">
                                <span class="rank">{{ index + 1 }}.</span>
                                <img :src="entry.avatar" alt="User Avatar" class="avatar-image" />
                                <span class="username">{{ entry.username }}</span>
                                <span class="score">{{ entry.score }}</span>
                            </div>
                        </div>
                        <span v-if="entry.user_id === currentUserId" class="you">(you)</span>
                        <div class="date">{{ formatDate(entry.create_at) }}</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
import store from '@/store';
import axios from 'axios';

export default {
    data() {
        return {
            games: [
                { name: "hangman", displayName: "Hangman", list: [] },
                { name: "alphaArena", displayName: "Alpha Arena", list: [] },
                { name: "terminologyTwisters", displayName: "Terminology Twisters", list: [] },
                { name: "clickPalooza", displayName: "Click-a-Palooza", list: [] },
                { name: "tilesOfTerror", displayName: "Tiles of Terror", list: [] },
                { name: "copyCat", displayName: "Copy Cat", list: [] }
            ],
            currentUserId: this.$store.state.user ? this.$store.state.user.id : -1,
        };
    },
    mounted() {
        this.fetchLeaderboard();
    },
    methods: {
        formatDate(date) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
            return new Date(date).toLocaleString(undefined, options);
        },
        async fetchLeaderboard() {
            const games = [
                'Hangman',
                'Alpha Arena',
                'Terminology Twisters',
                'Click-a-Palooza',
                'Tiles of Terror',
                'Copy Cat'
            ];
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            try {
                // Loop through each game and fetch the leaderboard data
                for (const game of games) {
                    const response = await axios.get(`${API_URL}/leaderboard/${game}`);
                    console.log(response.data)
                    this.setLeaderboardData(game, response.data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        },

        setLeaderboardData(game, data) {
            // Find the corresponding game object in the games array and set its list property
            const gameObj = this.games.find(g => g.displayName === game);
            if (gameObj) {
                gameObj.list = data;
                console.log(`${game} leaderboard updated`, gameObj.list);
            }
        }
    }
};
</script>

<style scoped>
.leaderboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 20px;
    background-color: #34495e;
    border-radius: 12px;
    max-width: 1200px;
    margin: 20px auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.leaderboard>div {
    background-color: #2c3e50;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.leaderboard-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* Creates 3 columns */
    gap: 1rem;
}
.game-leaderboard{
    background-color: #34495e;
    border-radius: 5px;
    padding: 5px 10px;
}
.leaderboard h1 {
    font-size: 1.8rem;
    color: gold;
    margin-bottom: 1rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

ul li {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    /* Align the items to the left */
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    transition: background-color 0.3s ease;
}

ul li:hover {
    background-color: #455e76;
}

ul li .avatar-image {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 15px;
    /* Space between avatar and text */
}

ul li .leaderboard-item-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    /* Keeps the content aligned horizontally */
}

ul li .user-info {
    display: flex;
    flex-direction: row;
    /* Ensures the username, score, and date are displayed horizontally */
    align-items: center;
}

ul li .rank {
    font-weight: bold;
    margin-right: 10px;
    color: white;
}

ul li .username {
    font-size: 16px;
    font-weight: bold;
    margin-right: 15px;
    color: white;
}

ul li .score {
    font-size: 14px;
    color: gold;
    margin-right: 15px;
}

ul li .date {
    font-size: 12px;
    color: white;
}

ul li .you {
    font-size: 1rem;
    color: #28a745;
    font-weight: bold;
    margin-left: 10px;
}

ul li .no-leaders {
    font-size: 1rem;
    color: #999;
    text-align: center;
    padding: 10px 0;
}

.avatar-image {
    width: 50px;
    /* Increased size for better visibility */
    height: 50px;
    /* Ensure it is proportional */
    border-radius: 50%;
    object-fit: cover;
    margin-right: 15px;
    /* Space between avatar and text */
}

.leaderboard-item-content {
    display: flex;
    align-items: center;
}

.user-info {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
}

.rank {
    font-weight: bold;
    margin-right: 10px;
}

.username {
    font-size: 16px;
    font-weight: bold;
}

.score {
    font-size: 14px;
    color: #555;
}

.date {
    font-size: 12px;
    color: #888;
    margin-left: 15px;
}

</style>
