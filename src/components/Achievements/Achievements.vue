<template>
  <div class="achievements-page">
    <header>
      <h1 class="title">{{ user ? user.username + "'s" : 'User' }} Achievements</h1>
    </header>
    <div class="score">
      <h2>Score: {{ totalScore }}</h2>
    </div>
    <section>
      <h2>Medals</h2>
      <h3>Bronze: {{ bronze }}</h3>
      <h3>Silver: {{ silver }} </h3>
      <h3>Gold: {{ gold }} </h3>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);

    const totalScore = ref(0);
    const bronze = ref(0)
    const silver=ref(0)
    const gold=ref(0);
    const fetchAchievements = async () => {
      if (!user.value) {
        console.log('Not user value')
        return;
      }
      try {
        const response = await axios.get(`/achievements/${user.value.id}`);
        console.log(response.data)
        const { score, bronze: bronzeMedal, silver: silverMedal, gold: goldMedal } = response.data;
        totalScore.value = score
        bronze.value = bronzeMedal
        silver.value = silverMedal
        gold.value = goldMedal
      } catch (error) {
        console.error("Error fetching achievements:", error)
      }
    }

    onMounted(fetchAchievements);

    return { user, totalScore, bronze, silver, gold};
  },
};
</script>


<style scoped>
.achievements-page {
  max-width: 600px;
  margin: 0 auto;
}

header {
  background-color: #2c3e50;
  color: #8e44ad;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
}

h1 {
  margin: 0;
}

section {
  padding: 20px;
  background-color: #2c3e50;
  border-radius: 10px;
  margin-top: 20px;
}

h2 {
  color: #8e44ad;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  font-size: 16px;
  margin: 10px 0;
}

.achieved {
  color: #8e44ad;
  /* Green color for achieved achievements */
  font-weight: bold;
}
</style>