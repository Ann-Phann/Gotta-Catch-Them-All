/* eslint-disable no-multi-spaces */


const app = Vue.createApp({
  data() {
    return {
      currentView: 'HomeView',
      previousView: null  // Default view
    };
  },
  components: {
    Header,           // Register the Header component
    Footer,           // Register the Footer component
    HomeView,         // Register the HomeView
    LoginView,        // Register the LoginView
    PokedexView,      // Register the PokedexView
    CollectionView,   // Register the CollectionView
    GameView,         // Register the GameView
    AboutView,         // Register the AboutView
    ProfileView,       // Register the ProfileView
    AdminView
  },
  methods: {
    goBack() {
      this.currentView = this.previousView;
      this.previousView = null;
    }
  },
  template: `
    <div class="container">
      <Header  v-if="currentView !== 'LoginView'"/> <!-- Include the Header component -->
      <main class="bgWhite"  v-if="currentView !== 'LoginView'">
        <component :is="currentView"></component> <!-- Dynamically load the current view -->
      </main>
      <LoginView v-else class="login-modal"/>
      <Footer v-if="currentView !== 'LoginView'"/>
    </div>
  `
});


axios.get('http://localhost:8080/checkLogin', { withCredentials: true })
  .then((res) => {
    if (res.data.loggedIn) {
      store.isAuthenticated = true;
    } else {
      store.isAuthenticated = false;
    }

    // Now mount the app
    app.mount('#app');
  })
  .catch(err => {
    console.error('Error checking login status:', err);
    app.mount('#app'); // Mount even if check fails
  });
