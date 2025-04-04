<script>
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { useStore } from 'vuex'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

export default defineComponent({
  components: {
    Line
  },
  setup() {
    const games = ['Hangman', 'Alpha Arena', 'Terminology Twisters', 'Click-a-Palooza', 'Tiles of Terror', 'Copy Cat', 'Key Clash', 'Key Clash (Online)'];
    const gameData = ref({});
    const averageData = ref({});
    const store = useStore()
    const userId = store.state.user.id;
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Score'
          },
          beginAtZero: true
        }
      }
    };
    watch([gameData, averageData], ([newGameData, newAverageData]) => {
      console.log('Updated gameData:', newGameData);
      console.log('Updated averageData:', newAverageData);
    });
    const fetchGameStats = async (gameName) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      try {
        const response = await fetch(`${API_URL}/leaderboard/stats/${userId}/${gameName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        const userScores = data.userScores || [];
        const averageScores = data.averageScores || [];

        console.log(`Raw User Scores for ${gameName}:`, userScores);
        console.log(`Raw Average Scores for ${gameName}:`, averageScores);

        // Format userScores
        const formattedUserScores = userScores.map(entry => ({
          score: entry.score,
          create_at: new Date(entry.create_at)
        }));

        // Format averageScores
        const formattedAverageScores = averageScores.map(entry => ({
          date: new Date(entry.date),
          avg_score: parseFloat(entry.avg_score)
        }));

        console.log(`Formatted User Scores for ${gameName}:`, formattedUserScores);
        console.log(`Formatted Average Scores for ${gameName}:`, formattedAverageScores);

        // Store formatted data in Vue's reactive state
        gameData.value[gameName] = formattedUserScores.length > 0 ? formattedUserScores : [];
        averageData.value[gameName] = formattedAverageScores;

        console.log(`Updated gameData for ${gameName}:`, gameData.value[gameName]);
        console.log(`Updated averageData for ${gameName}:`, averageData.value[gameName]);

      } catch (err) {
        console.error(`Error fetching data for ${gameName}:`, err);
      }
    };
    onMounted(() => {
      games.forEach(fetchGameStats);
    });

    // Computed property to format chart data
    const chartData = computed(() => {
      const data = {};

      games.forEach((gameName) => {
        const userScores = gameData.value[gameName] || [];
        const averageScores = averageData.value[gameName] || [];

        // Prefer userScores dates, but use averageScores dates if userScores is empty
        let labels = userScores.length
          ? userScores.map(entry => entry.create_at ? entry.create_at.toLocaleDateString() : 'No Data')
          : averageScores.map(entry => entry.date ? entry.date.toLocaleDateString() : 'No Data');

        // Generate datasets
        const userScoresData = userScores.map(entry => entry.score ?? 0); // Default to 0 if null
        const avgScoresData = averageScores.map(entry => entry.avg_score ?? 0);

        // Ensure labels are not empty (use averageScores dates if userScores is empty)
        if (labels.length === 0 && averageScores.length > 0) {
          labels.push(...averageScores.map(entry => entry.date.toLocaleDateString()));
        }

        // Store chart data
        data[gameName] = {
          labels,
          datasets: [
            {
              label: 'User Scores',
              data: userScoresData,
              fill: false,
              borderColor: 'blue',
              tension: 0.1
            },
            {
              label: 'Average Scores',
              data: avgScoresData,
              fill: false,
              borderColor: 'green',
              tension: 0.1
            }
          ]
        };
      });

      return data;
    });


    return {
      gameData,
      averageData,
      games,
      chartData,
      chartOptions
    };
  }
});
</script>


<template>
  <div class="performance-chart-container">
    <h2 class="page-title">Performance Trends</h2>
    <div class="charts-grid">
      <div v-for="(gameName, index) in games" :key="gameName" class="game-chart">
        <h3 class="game-title">{{ gameName }}</h3>
        <div v-if="chartData[gameName] && chartData[gameName].labels?.length" class="chart-container">
          <Line :data="chartData[gameName]" :options="chartOptions" />
        </div>
        <p v-else class="loading-text">Loading performance data...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-chart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: rgba(142, 68, 173, 0.8);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

}

.page-title {
  font-size: 2rem;
  text-align: center;
  color: white;
  margin-bottom: 30px;
  font-weight: bold;

}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 4 equal columns */
  grid-gap: 20px;
}

.game-chart {
  padding: 20px;
  background-color: rgba(247, 201, 72, 0.8);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.game-title {
  font-size: 1.5rem;
  color: #34495e;
  margin-bottom: 15px;
  font-weight: 600;
}

.chart-container {
  background-color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.loading-text {
  font-size: 1rem;
  color: #bdc3c7;
  text-align: center;
}

h3.game-title {
  background-color: rgba(80, 200, 120, 0.8);
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 18px;
}

.performance-chart-container .game-chart:last-child {
  margin-bottom: 0;
}

.chart-container canvas {
  width: 100% !important;
  height: 400px;
  border-radius: 8px;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    /* 2 columns on smaller screens */
  }
}

@media (max-width: 768px) {
  .performance-chart-container {
    padding: 15px;
  }

  .game-title {
    font-size: 1.3rem;
  }

  .page-title {
    font-size: 1.7rem;
  }

  .chart-container {
    padding: 15px;
  }
}
</style>
