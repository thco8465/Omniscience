<template>
  <div class="profile-page">
    <header class="profile-header">
      <h1>{{ user ? user.username + "'s" : 'User' }} Profile</h1>
      <div v-if="equippedAvatar" class="avatar-display">
        <img :src="equippedAvatar" alt="Avatar" class="avatar" />
      </div>
    </header>

    <section v-if="user" class="profile-info">
      <h2>Profile Information</h2>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
    </section>

    <section v-if="user" class="cosmetics-section">
      <div class="cosmetics-header">
        <h2>Equip Your Cosmetics</h2>
      </div>
      <div class="cosmetics-container">
        <div class="cosmetic-column">
          <h3>Backgrounds</h3>
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
              <h4>{{ card.name }}</h4>
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

export default {
  methods: {
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

    const equippedBackground = computed(() => store.state.equippedBackground);
    const equippedAvatar = computed(() => store.state.equippedAvatar);
    const equippedCard = computed(() => store.state.equippedCard);

    // Fetch cosmetics function inside setup()
    const fetchCosmetics = async (userId) => {
      try {
        const types = ["background", "avatar", "card"];
        const [fetchedBackgrounds, fetchedAvatars, fetchedCards] = await Promise.all(
          types.map(type => axios.get(`/profile/${type}/${userId}`).then(res => res.data))
        );

        backgrounds.value = fetchedBackgrounds;
        avatars.value = fetchedAvatars;
        cards.value = fetchedCards;

        // Fetch equipped items
        const equippedItems = await axios.get(`/profile/equipped/${userId}`);
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
      try {
        await axios.post("/profile/equip", {
          userId: user.value.id,
          itemId: item.id,
          type
        });

        if (type === "background") {
          console.log(item)
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
      //console.log("WatchEffect - Equipped Background:", equippedBackground.value);
      //console.log("WatchEffect - Equipped Avatar:", equippedAvatar.value);
      if (equippedBackground.value) {
        //console.log('Applying background:', equippedBackground.value);
        //console.log('Equipped background image URL:', equippedBackground.value);
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

        //console.log("Vuex Equipped Background:", store.state.equippedBackground);
        //console.log("Vuex Equipped Avatar:", store.state.equippedAvatar);

        fetchCosmetics(user.value.id);
      }
    });

    return { user, backgrounds, avatars, cards, equippedBackground, equippedAvatar, equippedCard, equipItem };
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #34495e;
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-header h1 {
  font-size: 32px;
  font-weight: 600;
}

.avatar-display {
  margin-left: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f39c12;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.profile-info {
  margin-top: 30px;
  background-color: #ecf0f1;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.profile-info h2 {
  font-size: 26px;
  font-weight: 600;
  color: #2c3e50;
}

.profile-info p {
  font-size: 18px;
  margin: 10px 0;
  color: #7f8c8d;
}

.cosmetics-section {
  margin-top: 40px;
}

.cosmetics-header h2 {
  background: white;
  border-radius: 5px;
  font-size: 28px;
  color: #8e44ad;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
}

.cosmetics-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 20px;
}

.cosmetic-column {
  background-color: #ecf0f1;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.cosmetic-column h3 {
  font-size: 24px;
  color: #2c3e50;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  /* Align items vertically, not centered */
  position: relative;
  padding: 20px;
  /* Add some padding around the content */
}

.cosmetic-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  margin-bottom: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.color-sample {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  margin: 10px 0;
  display: inline-block;
  background-color: #f0f0f0;
  /* Default background */
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
  /* Add space above the button */
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
}

button:focus {
  outline: none;
}
</style>
