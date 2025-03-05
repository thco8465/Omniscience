<template>
  <div class="create-account">
    <h2>Create Account</h2>
    <form @submit.prevent="createAccount">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="newAccount.username" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="newAccount.email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="newAccount.password" required>
      </div>
      <button type="submit" :disabled="loading">Create Account</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { createUser } from '../UserFactory';
export default {
  data() {
    return {
      newAccount: {
        username: '',
        email: '',
        password: '',
      },
      loading: false,
      error: '',
    };
  },
  methods: {
    async createAccount() {
      this.loading = true;
      this.error = '';
      const API_URL = import.meta.env.VITE_API_URL;
      console.log(API_URL)
      try {
        const user = createUser(this.newAccount.username, this.newAccount.email, this.newAccount.password);
        const response = await axios.post(`${API_URL}/createAccount`, user, {
          withCredentials: true, // If you need to send cookies or authentication tokens
        });
        if (response.data.success) {
          console.log('Account created');
        } else {
          console.error('Account creation failed');
          this.error = 'Account creation failed. Please try again.';
        }
      } catch (error) {
        console.error('Error creating account:', error);
        this.error = 'An unexpected error occurred. Please try again later.';
      } finally {
        this.loading = false;
      }

      // Reset the form
      this.newAccount = {
        username: '',
        email: '',
        password: '',
      };
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html {
  height: 100%;
  /* Ensure the body and html span the full height */
  display: flex;
  justify-content: center;
  /* Center horizontally */
  align-items: center;
  /* Center vertically */
}

.create-account {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  width: 100%;
  /* Ensure the container doesn't exceed 100% width */
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
  width: 100%;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  align-self: flex-start;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.error-message {
  color: #ff0000;
  font-size: 14px;
  margin-top: 10px;
}
</style>