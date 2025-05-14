<template>
  <div class="sidebar">
    <header>
      <nav>
        <div class="nav-container">
          <div class="nav-links">
            <div class="title">
              OMNISCIENCE
              <!-- <div v-if="equippedAvatar" class="avatar-container">
                <img :src="`${equippedAvatar}`" alt="Avatar" class="avatar" />
              </div> -->
            </div>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink v-if="userId !== -1" to="/Profile">Profile</RouterLink>
            <RouterLink v-if="userId !== -1" to="/Achievements">Medals</RouterLink>
            <RouterLink v-if="userId !== -1" to="/MyStats">Performance</RouterLink>
            <RouterLink v-if="userId !== -1" to="/MyJournal">Journal</RouterLink>
            <RouterLink to="/Leaderboards">Leaderboards</RouterLink>
            <RouterLink to="/Store">Store</RouterLink>
            <RouterLink to="/AboutSite">About</RouterLink>
            <RouterLink v-if="userId === -1" to="/Login">Login</RouterLink>
          </div>
          <div class="logout-container">
            <button class="logout" v-if="userId !== -1" @click="logout">Log out</button>
          </div>
        </div>
      </nav>
    </header>
  </div>
</template>

<script>
import { computed,onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const userId = computed(() => store.state.user?.id || -1);
    // const equippedAvatar = computed(() => store.state.equippedAvatar)

    const logout = () => {
      console.log("Logging out...");

      // Clear user-related Vuex state
      store.commit("setEquippedAvatar", null);
      store.commit("setEquippedBackground", "images/oceanSunset.jpg"); // Set default background
      store.commit("setUser", null); // Clear user session

      // Immediately update the DOM background
      document.body.style.backgroundImage = `url('/images/cloudyCastle.jpg')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";

      // Redirect to login page
      router.push('/Login');
    };

    // onMounted(() => {
    //   store.dispatch("fetchEquippedItems");
    // });
    return { userId, logout };
  }
};
</script>

<style scoped>
/* Sidebar (left menu) */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  /* Collapsed width */
  height: 100%;
  background: linear-gradient(135deg, rgba(142, 68, 173, 0.85) 30%, rgba(94, 51, 112, 0.85) 70%);
  padding-top: 10px;
  border-radius: 0px 12px 12px 0px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  transition: width 0.3s ease;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  z-index: 9999;
}

.avatar-container {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 10px;
  border: 1px solid #f7c948;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  display: flex;
  /* justify-content: center; */
  margin-left: 0px;
  align-items: center;
  justify-content: center;
  color: #f7c948;
  font-size: 32px;
  letter-spacing: -1.5px;
  text-shadow: 2px 2px 2px #002823, -1px 0 3px #002823;
  font-family: 'Libre Baskerville', serif;
}

/* Sidebar Expansion on Hover */
.sidebar:hover {
  width: 250px;
  /* Expanded width */
  z-index: 9999;
}

header {
  background: none;
  /* Remove background inside header */
  padding: 1rem 0;
}

/* Navigation Container */
.nav-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Navigation Links */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

nav a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 12px 18px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

nav a:hover,
nav a.router-link-exact-active {
  background: #4a90e2;
  color: #f7c948;
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
}

/* Logout Button */
.logout-container {
  margin-top: auto;
  /* Push logout to the bottom */
  padding: 10px;
}

.logout {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.logout:hover {
  background: red;
  color: gold;
  transform: scale(1.1);
}

/* Optional - Shine Effect */
.sidebar::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 250%;
  height: 100%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%);
  transform: skewX(-20deg);
  animation: subtleShine 8s infinite linear;
  animation-delay: 4s;
  pointer-events: none;
}

@keyframes subtleShine {
  0% {
    left: -150%;
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    left: 150%;
    opacity: 0;
  }
}
</style>
