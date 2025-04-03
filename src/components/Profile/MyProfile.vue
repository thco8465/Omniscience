<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="avatar-and-name">
        <h1>{{ user ? user.username + "'s" : 'User' }} Profile</h1>
        <div v-if="equippedAvatar" class="avatar-display">
          <img :src="equippedAvatar" alt="Avatar" class="avatar" />
        </div>
      </div>
      <div class="info-scores">
        <section v-if="user" class="profile-info">
          <h2>Profile Information</h2>
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
        </section>
        <section class="high-scores">
          <h2>High Scores</h2>
          <div class="score-item">
            <span class="game-name">Hangman:</span>
            <span class="score">{{ HangmanHigh }}</span>
          </div>
          <div class="score-item">
            <span class="game-name">Alpha Arena:</span>
            <span class="score">{{ AlphaArenaHigh }}</span>
          </div>
          <div class="score-item">
            <span class="game-name">Terminology Twisters:</span>
            <span class="score">{{ TerminologyTwistersHigh }}</span>
          </div>
          <div class="score-item">
            <span class="game-name">Click-a-Palooza:</span>
            <span class="score">{{ ClickaPaloozaHigh }}</span>
          </div>
          <div class="score-item">
            <span class="game-name">Tiles of Terror:</span>
            <span class="score">{{ TilesofTerrorHigh }}</span>
          </div>
          <div class="score-item">
            <span class="game-name">Copy Cat:</span>
            <span class="score">{{ CopyCatHigh }}</span>
          </div>
        </section>
      </div>
    </header>
    <section v-if="user" class="cosmetics-section">
      <div class="cosmetics-header">
        <h2>Equip Your Cosmetics</h2>
      </div>
      <div class="cosmetics-container">
        <div class="cosmetic-column">
          <h3>Backgrounds</h3>
          <button @click="background">View Full Equipped Background</button>
          <ul>
            <li v-for="bg in backgrounds" :key="bg.id">
              <img :src="bg.image_url" alt="Background" class="cosmetic-image" />
              <button @click="equipItem(bg, 'background')" :disabled="equippedBackground === bg.image_url">
                Equip
              </button>
            </li>
          </ul>
        </div>

        <div class="cosmetic-column">
          <h3>Avatars</h3>
          <ul>
            <li v-for="avatar in avatars" :key="avatar.id">
              <img :src="avatar.image_url" alt="Avatar" class="cosmetic-image" />
              <button @click="equipItem(avatar, 'avatar')" :disabled="equippedAvatar === avatar.image_url">
                Equip
              </button>
            </li>
          </ul>
        </div>

        <div class="cosmetic-column">
          <h3>Cards</h3>
          <ul>
            <li v-for="card in cards" :key="card.id">
              <div v-if="card.style_class" :style="{ background: getColorFromClass(card.style_class) }"
                class="color-sample"></div>
              <button @click="equipItem(card, 'card')" :disabled="equippedCard === card.style_class">
                Equip
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <section v-else>
      <h1>Login or create an account to see your profile</h1>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import router from '@/router';

export default {
  methods: {
    background() {
      this.$router.push('/ScenicView')
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
  },
  setup() {
    const store = useStore();
    const user = ref(null);
    const backgrounds = ref([]);
    const avatars = ref([]);
    const cards = ref([]);

    const HangmanHigh = ref(0);
    const AlphaArenaHigh = ref(0);
    const TerminologyTwistersHigh = ref(0);
    const ClickaPaloozaHigh = ref(0);
    const TilesofTerrorHigh = ref(0);
    const CopyCatHigh = ref(0);

    const equippedBackground = computed(() => store.state.equippedBackground);
    const equippedAvatar = computed(() => store.state.equippedAvatar);
    const equippedCard = computed(() => store.state.equippedCard);

    // Fetch high scores function inside setup()
    const fetchHighScores = async (userId) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const games = ['Hangman', 'Alpha Arena', 'Terminology Twisters', 'Click-a-Palooza', 'Tiles of Terror', 'Copy Cat'];

      // Mapping for high scores
      const highScores = {
        "Hangman": HangmanHigh,
        "Alpha Arena": AlphaArenaHigh,
        "Terminology Twisters": TerminologyTwistersHigh,
        "Click-a-Palooza": ClickaPaloozaHigh,
        "Tiles of Terror": TilesofTerrorHigh,
        "Copy Cat": CopyCatHigh
      };

      // Loop through each game and fetch its high score
      for (const game of games) {
        try {
          const response = await axios.get(`${API_URL}/leaderboard/${userId}/${game}`);

          if (response.status === 404 || !response.data?.[0]?.score) {
            // If there's no score or a 404, set default score to 0
            highScores[game].value = 0;
          } else {
            highScores[game].value = response.data[0]?.score ?? 0;
          }
        } catch (error) {
          console.error(`Error fetching high score for ${game}:`, error);
          // If there's any error (including network issues), set default score to 0
          highScores[game].value = 0;
        }
      }
    }

    // Fetch cosmetics function
    const fetchCosmetics = async (userId) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const types = ["background", "avatar", "card"];
        const [fetchedBackgrounds, fetchedAvatars, fetchedCards] = await Promise.all(
          types.map(type => axios.get(`${API_URL}/profile/${type}/${userId}`).then(res => res.data))
        );

        backgrounds.value = fetchedBackgrounds;
        avatars.value = fetchedAvatars;
        cards.value = fetchedCards;

        // Fetch equipped items
        const equippedItems = await axios.get(`${API_URL}/profile/equipped/${userId}`);
        console.log('Equipped items: ', equippedItems.data);

        store.commit("setEquippedBackground", equippedItems.data.background || null);
        store.commit("setEquippedAvatar", equippedItems.data.avatar || null);
        store.commit("setEquippedCard", equippedItems.data.card || null);
      } catch (error) {
        console.error("Error fetching cosmetics:", error);
      }
    };

    // Equip an item (background, avatar, or card)
    const equipItem = async (item, type) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        await axios.post(`${API_URL}/profile/equip`, {
          userId: user.value.id,
          itemId: item.id,
          type
        });

        if (type === "background") {
          store.commit("setEquippedBackground", item.image_url);
        }
        if (type === "avatar") {
          store.commit("setEquippedAvatar", item.image_url);
        }
        if (type === "card") {
          store.commit("setEquippedCard", item.style_class);
        }
      } catch (error) {
        console.error("Error equipping item:", error);
      }
    };

    // Watch for changes in the equipped background and apply it immediately
    watchEffect(() => {
      if (equippedBackground.value) {
        document.body.style.backgroundImage = `url('${equippedBackground.value}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      }
    });

    onMounted(async () => {
      user.value = store.state.user;
      if (user.value) {
        console.log("User detected in onMounted:", user.value);

        await store.dispatch("fetchEquippedItems");

        fetchCosmetics(user.value.id);
        fetchHighScores(user.value.id);
      }
    });

    return {
      user, backgrounds, avatars, cards, equippedBackground, equippedAvatar, equippedCard, equipItem,
      HangmanHigh, AlphaArenaHigh, TerminologyTwistersHigh, ClickaPaloozaHigh, TilesofTerrorHigh, CopyCatHigh
    };
  }
};
</script>


<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Libre Baskerville', serif;

}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(74, 144, 226, 0.8);
  /* Translucent */
  color: #f7c948;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid #f7c948;
  margin-bottom: 40px;
  
}

.profile-header h1 {
  font-size: 32px;
  font-weight: 600;
  text-shadow: 2px 2px 2px #002823, -1px 0 3px #002823;
}

.avatar-and-name {
  display: flex;
  align-items: center;
  text-align: center;
}

.avatar-display {
  margin-top: 0px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f7c948;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.info-scores{
  display: flex;
}
.profile-info {
  background-color: rgba(74, 144, 226, 0.8);
  /* Translucent */
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #f7c948;
  margin: 30px;
}

.profile-info h2 {
  font-size: 26px;
  font-weight: 600;
  color: gold;
}

.profile-info p {
  font-size: 18px;
  margin: 10px 0;
  color: white;
}

.high-scores {
  background-color: rgba(248, 248, 248, 0.8);
  /* Translucent */
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 2px solid #f7c948;
}

.high-scores h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: normal;
}

.game-name {
  color: #555;
  font-size: 16px;
  font-weight: bold;
}

.score {
  color: #4CAF50;
  font-size: 18px;
  font-weight: bold;
}

.avatar-display {
  margin-left: 20px;
}

.profile-info {
  margin-top: 30px;
  background-color: rgba(74, 144, 226, 0.8);
  /* Translucent */
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #f7c948;
}

.cosmetics-section {
  margin-top: 40px;
}

.cosmetics-header h2 {
  background: rgba(74, 144, 226, 0.8);
  /* Translucent */
  border-radius: 5px;
  font-size: 28px;
  color: gold;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
  padding: 10px 10px;
  border: 2px solid #f7c948;
}

.cosmetics-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 20px;
  grid-auto-rows: auto;
  align-items: flex-start;
}

.cosmetic-column {
  background-color: rgba(74, 144, 226, 0.8);
  /* Translucent */
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid #f7c948;
  display: flex;
  flex-direction: column;
}

.cosmetic-column h3 {
  font-size: 24px;
  color: gold;
  margin-bottom: 15px;
  text-align: center;
}

.cosmetic-column ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cosmetic-column li {
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  /* Translucent */
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cosmetic-column li:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.cosmetic-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  margin-bottom: 15px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f39c12;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.color-sample {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  margin: 10px 0;
  display: inline-block;
  background-color: rgba(240, 240, 240, 0.8);
  /* Translucent */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button {
  padding: 10px 20px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: green;
  transform: translateY(-2px);
}

button:focus {
  outline: none;
}
</style>
