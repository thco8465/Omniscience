// store.js or store/index.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    user: null, // Initial state
  },
  mutations: {
    // Define the setUser mutation
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    // If you're calling the mutation from an action
    updateUser({ commit }, user) {
      commit('setUser', user);
    },
  },
  getters: {
    // Optional: add getters to access the user in the store
    user: (state) => state.user,
  },
});
