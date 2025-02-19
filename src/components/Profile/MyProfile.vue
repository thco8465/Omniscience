<template>
    <div class="profile-page">
      <header>
        <h1>{{ user ? user.username + "'s" : 'User'}} Profile</h1>
      </header>
      <section v-if="user">
        <h2>Profile Information</h2>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
      </section>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watchEffect } from 'vue';
  import { useStore } from 'vuex';
  
  export default {
    setup() {
      const store = useStore();
      const user = ref(null);
  
      onMounted(() => {
        // Fetch user data from the store
        user.value = store.state.user;
      });
  
      // Watch for changes to the user data
      watchEffect(() => {
        user.value = store.state.user;
      });
  
      return { user };
    },
  };
  </script>
  
  <style scoped>
  .profile-page {
    max-width: 600px;
    margin: 0 auto;
  }
  
  header {
    background-color: #2c3e50;
    color: #8e44ad;
    padding: 20px;
    text-align: center;
    border-radius: 5px;
  }
  
  h1 {
    margin: 0;
  }
  
  section {
    padding: 20px;
    background-color: #DFFF00;
    border-radius: 5px;
    margin-top: 20px;
  }
  
  h2 {
    color: #8e44ad;
  }
  
  p {
    font-size: 16px;
    margin: 10px 0;
  }
  </style>