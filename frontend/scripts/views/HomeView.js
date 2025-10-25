const HomeView = {
  template: `
  <div class="home-container">
    <h1> Welcome to Pokémon App!</h1>
    <p> Explore all the features we offer: </p>

    <div class="slider-container">
      <button @click ="prevSlide" class="slider-arrow left-arrow"> &lt; </button>

      <div class="slider-content">
        <img
            :src="services[currentIndex].image"
            :alt="services[currentIndex].altText"
            class="slider-image"
          />

          <p class="image-text"> {{services[currentIndex].altText}} </p>
      </div>
      <button @click = "nextSlide" class = "slider-arrow right-arrow"> &gt; </button>
    </div>

    <div class="slider-indicators">
        <span
          v-for="(service, index) in services"
          :key="service.id"
          @click="goToSlide(index)"
          :class="{ active: index === currentIndex }"
          class="indicator-dot"
        ></span>
      </div>
  </div>
  `,
  data() {
    return {
      // array to hold information about each slide
      services: [
        {
          id: 1,
          image: 'images/HomeViewSlider/full-pokedex.webp',
          altText: 'Pokédex - Explore all available Pokémon'
        },
        {
          id: 2,
          image: 'images/HomeViewSlider/my-collection.webp',
          altText: 'My Pokémon Collection - View and manage your owned Pokémon!'
        },
        {
          id: 3,
          image: 'images/HomeViewSlider/game-slider.png',
          altText: 'Pokémon Quiz Game - Test your knowledge and earn points to collect your Pokémon '
        },
        {
          id: 4,
          image:'images/HomeViewSlider/account-management-slider.png',
          altText: 'Self Management - update your profile and settings'
        }
      ],
      // track which slide is currently visible
      currentIndex: 0
    };
  },
  methods: {
    // navigate next slide
    nextSlide() {
      // use modulo to ensure wraping the context
      this.currentIndex = (this.currentIndex + 1) % this.services.length;
      console.log('next slide, current index: ', this.currentIndex); // debug
    },

    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.services.length) % this.services.length;
      console.log('previous slide, current index: ', this.currentIndex); // debug
    },

    // main idea to go straight to the specific slide
    // FIX 4: Corrected method name from 'gotoSide' to 'goToSlide'
    goToSlide(index) {
      if (index >= 0 && index < this.services.length) {
        this.currentIndex = index;
      } else {
        console.warn('Attempted to go to an invalid slide index:', index); // Warn if invalid index
      }
    }
  }
};
