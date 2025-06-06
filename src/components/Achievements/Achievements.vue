<template>
  <div class="achievements-page">
    <header>
      <h1 class="title">{{ user ? user.username + "'s" : "User" }} Progression</h1>
    </header>

    <section class="stats">
      <div class="score-card">
        <h2>Lifetime Score</h2>
        <p class="score">{{ totalScore }}</p>
      </div>

      <div class="medals-container">
        <div class="medal-card bronze">
          🥉 <p>Bronze</p>
          <span>{{ bronze }}</span>
        </div>
        <div class="medal-card silver">
          🥈 <p>Silver</p>
          <span>{{ silver }}</span>
        </div>
        <div class="medal-card gold">
          🥇 <p>Gold</p>
          <span>{{ gold }}</span>
        </div>
      </div>
    </section>
  </div>
</template>


<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";

export default {
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);

    const totalScore = ref(0);
    const bronze = ref(0);
    const silver = ref(0);
    const gold = ref(0);

    const fetchAchievements = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (!user.value) return;
      try {
        const { data } = await axios.get(`${API_URL}/achievements/${user.value.id}`);
        totalScore.value = data.score;
        bronze.value = data.bronze;
        silver.value = data.silver;
        gold.value = data.gold;
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };

    onMounted(fetchAchievements);

    return { user, totalScore, bronze, silver, gold };
  },
};
</script>
<style scoped>
.achievements-page {
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
  font-family: "Arial", sans-serif;
}

header {
  background: #4a90e2; /* Dark Blue-Gray */
  color: white;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #f7c948;

}

h1 {
  margin: 0;
  font-size: 26px;
  color: #f7c948; /* Gold */
}
h2{
  color: #f7c948;
}
.stats {
  background: #4a90e2; /* Light Dark Blue-Gray */
  padding: 25px;
  border-radius: 10px;
  margin-top: 20px;
  color: white;
  border: 2px solid #f7c948;
}

.score-card {
  background: #0f73e5; /* Dark Blue-Gray */
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.score {
  font-size: 30px;
  font-weight: bold;
  color: #f1c40f; /* Gold */
}

.medals-container {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.medal-card {
  width: 100px;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bronze {
  background: #cd7f32; /* Bronze */
  color: white;
}

.silver {
  background: #c0c0c0; /* Silver */
  color: black;
}

.gold {
  background: #ffd700; /* Gold */
  color: black;
}

.medal-card p {
  margin: 5px 0;
  font-size: 16px;
}

.medal-card span {
  font-size: 24px;
  font-weight: bold;
}
</style>
