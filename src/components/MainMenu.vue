<template>
  <div class="wrapper">
    <header>
      <nav>
        <div class="nav-container">
          <div class="nav-section">
            <!-- <div class="nav-section dropdown">
              <button class="dropbtn">Games</button>
              <div class="dropdown-content">
                <RouterLink to="/hangView">Hang Man</RouterLink>
                <RouterLink to="/AlphaArena">Alpha Arena</RouterLink>
                <RouterLink to="/Scramble">Terminology Twisters</RouterLink>
                <RouterLink to="/ShapeClicker">Click-a-Palooza</RouterLink>
                <RouterLink to="/Tiles">Tiles of Terror</RouterLink>
                <RouterLink to="/Repeater">Copy Cat</RouterLink>
              </div>
            </div> -->
            <!-- <RouterLink v-if="userId === -1" to="/CreateAccount">Create Account</RouterLink> -->
          </div>
          <div class="nav-section">
            <RouterLink to="/">Home</RouterLink>
            <RouterLink v-if="userId !== -1" to="/Profile">Profile</RouterLink>
            <RouterLink v-if="userId !== -1" to="/Achievements">Achievements</RouterLink>
            <RouterLink to="/Leaderboards">Leaderboards</RouterLink>
            <RouterLink to="/Store">Store</RouterLink>
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const userId = computed(() => store.state.user?.id || -1);

    const logout = () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      store.commit("setEquippedAvatar", null);
      store.commit('setUser', { id: null, username: '', email: '' });
      router.push('/Login');
    };

    return { userId, logout };
  }
};
</script>
<style scoped>
header {
  background-color: #2c3e50;
  padding: 1rem 0;
  border-radius: 5px;
}

nav {
  display: flex;
  justify-content: center; /* Center the nav items horizontally */
  align-items: center;
  width: 100%;
  padding: 0 15px;
}

.nav-container {
  display: flex;
  justify-content: space-evenly; /* Space between the sections */
  width: 100%;
  align-items: center;
}

.nav-section {
  display: flex;
  gap: 20px;
  justify-content: center; /* Centers the links inside the section */
  align-items: center;
  margin-right: 0px;
}

nav a,
.nav-section button,
.dropbtn {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Libre Baskerville', serif;
}

nav a:hover,
.nav-section button:hover,
.dropbtn:hover,
nav a.router-link-exact-active {
  background-color: #3498db;
  color: gold;
  transform: scale(1.1);
}

.dropdown {
  position: relative;
  top: -5px;
  right: 10px;
  display: inline-block;
  z-index: 20;
  font-family: 'Libre Baskerville', serif;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #2c3e50;
  min-width: 160px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: white;
  padding: 10px 10px;
  text-decoration: none;
  display: block;
  font-size: 1rem;
  font-weight: 600;
}

.dropdown-content a:hover {
  background-color: #3498db;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.logout-container {
  margin-left: auto; /* Push the logout button to the right */
}

.logout {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 8px 15px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Libre Baskerville', serif;
  display: flex;
  margin-left: auto; /* Aligns the logout button to the right */
  margin-right: 40px;
}

.logout:hover {
  background-color: red;
  color: gold;
  transform: scale(1.1);
}
</style>
