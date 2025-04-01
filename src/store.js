// store.js or store/index.js
import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    user: null, // Initial state
    equippedAvatar: null,
    equippedBackground: null,
    equippedCard: "default-card",
    backgroundPosition: 50, // Default center
  },
  mutations: {
    // Define the setUser mutation
    setUser(state, user) {
      state.user = user;
    },
    setEquippedAvatar(state,avatar){
      console.log("Setting equipped avatar:", avatar)
      state.equippedAvatar = avatar;
    },
    setEquippedBackground(state, background){
      console.log("Setting equipped background:", background);
      state.equippedBackground = background
    },
    setEquippedCard(state, card){
      console.log("Setting equipped card:", card)
      state.equippedCard = card || "default-card";
    },
    setBackgroundPosition(state, position) {
      state.backgroundPosition = position;
    },
  },
  actions: {
    // If you're calling the mutation from an action
    updateUser({ commit }, user) {
      commit('setUser', user);
    },
    async fetchEquippedItems({commit, state}){
      //console.log(import.meta.env.VITE_API_URL); // Should log the backend URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (!state.user) return;
      try{
        const response = await axios.get(`${API_URL}/profile/equipped/${state.user.id}`);
        console.log(response.data)
        commit("setEquippedAvatar", response.data.avatar ?? null);
        commit("setEquippedBackground", response.data.background ?? null);
        commit("setEquippedCard", response.data.card ?? null); 
      } catch(error){
        console.error("Error fetching equipped avatar:", error);
      }
    }
  },
  getters: {
    // Optional: add getters to access the user in the store
    user: (state) => state.user,
    equippedAvatar: (state) => state.equippedAvatar,
    equippedBackground: (state) => state.equippedBackground,
    equippedCard: (state) => state.equippedCard,
  },
});
