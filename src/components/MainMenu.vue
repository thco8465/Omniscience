<template>
  <header>
      <div class="wrapper">
          <nav>
              <RouterLink to="/">Home</RouterLink>
              <RouterLink to="CreateAccount">Create Account</RouterLink>
              <RouterLink to="Login">Login</RouterLink>
              <RouterLink to="/hangView">Hang Man</RouterLink>
              <RouterLink to="/AlphaArena">Alpha Arena</RouterLink>
              <RouterLink to="/Scramble">Terminology Twisters</RouterLink>
              <RouterLink to="/ShapeClicker">Click-a-Palooza</RouterLink>
              <RouterLink to="/Tiles">Tiles of Terror</RouterLink>
              <RouterLink to="/Repeater">Copy Cat</RouterLink>
              <RouterLink to="/Achievements">Achievements</RouterLink>
              <RouterLink to="/Profile">Profile</RouterLink>
          </nav>
      </div>
  </header>
</template>

<style scoped>
header {
background-color: #2c3e50;
padding: 1rem 0;
border-radius: 5px;
}

.wrapper {
max-width: 1200px;
margin: 0 auto;
padding: 0 20px;
}

nav {
display: flex;
justify-content: center;
gap: 20px;
flex-wrap: wrap;
}

nav a {
color: #ecf0f1;
text-decoration: none;
font-size: 1rem;
font-weight: 600;
padding: 10px 15px;
border-radius: 5px;
transition: background-color 0.3s ease, color 0.3s ease;
}

nav a:hover, 
nav a.router-link-exact-active {
background-color: #3498db;
color: white;
}

@media (max-width: 768px) {
nav {
  flex-direction: row;
  align-items: center;
}
}
</style>
