<script setup>
import { RouterView } from 'vue-router'
import MainMenu from './components/MainMenu.vue'
import { computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const equippedAvatar = computed(() => store.state.equippedAvatar);
const equippedBackground = computed(() => store.state.equippedBackground)

// Check if the user is logged in
const userLoggedIn = computed(() => store.state.user !== null);

// Set default background if not logged in
onMounted(() => {
  console.log("App Mounted. User:", store.state.user);

  // If the user is not logged in, set the default background immediately
  if (!userLoggedIn.value) {
    console.log("User not logged in, using default background.");
    if (!store.state.equippedBackground) {
      // Set default background for logged-out users
      store.commit("setEquippedBackground", "/images/cloudyCastle.jpg");
    }
  } else {
    // For logged-in users, fetch equipped items from the backend
    store.dispatch("fetchEquippedItems");
  }
});

// Apply background when it's set or changed
watch(equippedBackground, (newBackground) => {
  console.log("Updated background:", newBackground);
  if (newBackground) {
    document.body.style.backgroundImage = `url('${newBackground}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }
});
</script>

<template>
  <div class="container">
    <div class="title">
      OMNISCIENCE
      <div v-if="equippedAvatar" class="avatar-container">
        <img :src="`${equippedAvatar}`" alt="Avatar" class="avatar" />
      </div>
    </div>
    <div class="main-menu">
      <MainMenu />
    </div>
    <div class="route">
      <RouterView />
    </div>
  </div>
</template>
<style scoped>
.container {
  border-radius: 5px;
  width: 100%;
  font-family: 'Libre Baskerville', serif;
}

.avatar-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 10px;
  border: 3px solid #f7c948;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  display: flex;
  /* justify-content: center; */
  margin-left: 25px;
  align-items: center;
  justify-content: center;
  color: #f7c948;
  font-size: 32px;
  letter-spacing: -1.5px;
  text-shadow: 2px 2px 2px #002823, -1px 0 3px #002823;
  font-family: 'Libre Baskerville', serif;
}

.main-menu {
  padding: 0px;
}

.route {
  margin-top: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
