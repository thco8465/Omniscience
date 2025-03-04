<template>
    <div class="login-form">
        <h2>Login</h2>
        <input type="text" v-model="username" placeholder="Username">
        <input type="password" v-model="password" placeholder="Password">
        <button @click="login">Login</button>
        <div v-if="showErrorMessage" class="error-message">
            Invalid credentials. Please try again.
        </div>
        <router-link to="/CreateAccount" class="create-account-link">
            Don't have an account? Create an Account
        </router-link>
    </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';  // Import useRouter from vue-router

export default {
    setup() {
        const store = useStore();
        const username = ref('');
        const password = ref('');
        const showErrorMessage = ref(false);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const router = useRouter();  // Use useRouter to get the router instance
        const login = async () => {
            try {
                const response = await axios.post(`${API_URL}/login`, {
                    username: username.value,
                    password: password.value,
                });

                if (response.data.success) {
                    // Login was successful, update the user in the store
                    store.commit('setUser', response.data.user);
                    router.push('/profile');
                } else {
                    // Login failed, show error message
                    showErrorMessage.value = true;
                }
            } catch (error) {
                console.error('Error during login:', error);
                showErrorMessage.value = true;
            }
        };

        // Additional setup logic if needed

        return { username, password, showErrorMessage, login };
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

.login-form {
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

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
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

.create-account-link {
    margin-top: 10px;
    font-size: 16px;
}

.create-account-link a {
    color: #007bff;
    text-decoration: none;
}

.create-account-link a:hover {
    text-decoration: underline;
}
</style>