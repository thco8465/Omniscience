<template>
  </template>
  
  <script>
  import { computed, ref, watchEffect } from "vue";
  import { useStore } from "vuex";
  import { useRouter } from "vue-router";
  
  export default {
    setup() {
      const store = useStore();
      const router = useRouter();
      
      // Get equipped background from Vuex store
      const equippedBackground = computed(() => store.state.equippedBackground);
      const backgroundPosition = ref(store.state.backgroundPosition || 50); // Default to 50%
  
      // Update background position in Vuex
      const updatePosition = () => {
        store.commit("setBackgroundPosition", backgroundPosition.value);
      };
  
      // Computed style for preview
      const previewStyle = computed(() => ({
        backgroundImage: `url('${equippedBackground.value}')`,
        backgroundSize: "cover",
        backgroundPosition: `center ${backgroundPosition.value}%`,
        width: "100%",
        height: "300px",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
      }));
  
      // Watch for changes and update the actual background
      watchEffect(() => {
        document.body.style.backgroundPosition = `center ${backgroundPosition.value}%`;
      });
  
      const goBack = () => {
        updatePosition(); // Ensure the value is saved
        router.push("/profile");
      };
  
      return { equippedBackground, backgroundPosition, updatePosition, previewStyle, goBack };
    },
  };
  </script>
  
  <style scoped>
  .scenic-view {
    text-align: center;
    padding: 20px;
  }
  
  .preview {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .background-preview {
    width: 80%;
    height: 300px;
    border: 2px solid #ccc;
    background-color: #f0f0f0;
  }
  
  input[type="range"] {
    width: 80%;
    margin: 10px 0;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  