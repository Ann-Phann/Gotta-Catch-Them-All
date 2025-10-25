/*eslint-disable*/

const Header = {
    template: `
        <header>
            <div class="header__logo">
                <img src="./images/pokemonLogo.png" alt="Pokemon Logo" class="header__logo--img">
            </div>

            <nav>
                <button :class="{ active: $root.currentView === 'HomeView' }" @click="$root.currentView = 'HomeView'">Home</button>

                <button v-if="!user || user.role !== 'admin'" :class="{ active: $root.currentView === 'PokedexView' }" @click="$root.currentView = 'PokedexView'">Pokedex</button>

                <button v-if="isAuthenticated && user && user.role === 'user'" :class="{ active: $root.currentView === 'CollectionView' }" @click="$root.currentView = 'CollectionView'">Collection</button>
                <button v-if="isAuthenticated && user && user.role === 'user'" :class="{ active: $root.currentView === 'GameView' }" @click="$root.currentView = 'GameView'">Game</button>

                <button v-if="!user || user.role !== 'admin'" :class="{ active: $root.currentView === 'AboutView' }" @click="$root.currentView = 'AboutView'">About</button>

                <button v-if="isAuthenticated && user && user.role === 'admin'" :class="{ active: $root.currentView === 'AdminView' }" @click="$root.currentView = 'AdminView'">Admin</button>
            </nav>

            <div class="auth">
                <template v-if="!isAuthenticated">
                    <button @click="goToLogin">Login</button>
                    <button @click="goToRegister">Register</button>
                </template>

                <template v-else>
                    <div class="user-avatar-container" @click="toggleAvatarOptions">
                        <img v-if="user && user.avatar" :src="user.avatar" alt="User Avatar" class="user-avatar-img">
                        <div v-else class="user-avatar-placeholder"></div> <span class="username">{{ user ? user.user_name : 'UserName' }}</span>

                        <div v-if="showAvatarOptions" class="avatar-options-dropdown">
                            <button @click="goToProfile">Profile</button>
                            <button @click="logout">Logout</button>
                        </div>
                    </div>
                </template>
            </div>
        </header>
    `,
    data() {
        return {
            store,
            showAvatarOptions: false,
        };
    },
    computed: {
        isAuthenticated() {
            return store.isAuthenticated;
        },
        user() {
            // Ensure store.user is observed correctly
            console.log('Header - user:', store.user);
            return store.user;
        }
    },
    mounted() {
        // Fetch user data on mount to ensure user.user_role is available
        axios.get('http://localhost:8080/user/account', { withCredentials: true })
            .then((response) => {
                store.user = response.data.user; // Update store.user
                store.isAuthenticated = true; // Assume authenticated if account data is retrieved
                console.log("Header - User data fetched:", store.user);
            })
            .catch(() => {
                store.user = null; // Clear user data
                store.isAuthenticated = false; // Set to not authenticated
                console.log("Header - No user data or authentication failed.");
            });
    },
    methods: {
        goToLogin() {
            store.isLoginMode = true;
            this.$root.previousView = this.$root.currentView;
            this.$root.currentView = 'LoginView';
        },
        goToRegister() {
            store.isLoginMode = false;
            this.$root.previousView = this.$root.currentView;
            this.$root.currentView = 'LoginView';
        },
        toggleAvatarOptions() {
            this.showAvatarOptions = !this.showAvatarOptions;
        },
        goToProfile() {
            this.$root.currentView = 'ProfileView';
            this.showAvatarOptions = false; // Close dropdown after selection
        },
        logout() {
            axios.post('http://localhost:8080/logout', {}, { withCredentials: true })
                .then(() => {
                    store.isAuthenticated = false;
                    store.user = null; // Clear user data on logout
                    this.$root.currentView = 'HomeView';
                    this.showAvatarOptions = false; // Close dropdown after logout
                })
                .catch((err) => {
                    console.error('Logout failed:', err);
                    // Optionally, provide user feedback about logout failure
                });
        }
    }
};

