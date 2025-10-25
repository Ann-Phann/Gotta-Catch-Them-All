/*eslint-disable*/

const CollectionView = {
    template: `
        <section class="pokedex bgWhite">
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <span>Loading...</span>
            </div>

            <h1>My Collection</h1>

            <div v-else>
                <!-- Cards Block -->
                <div class="card-flex">
                    <div
                        v-for="pokemon in pokemonList"
                        :key="pokemon.pokemon_id"
                        class="pokemon-card"
                        :class="'stage-' + pokemon.level"
                        @click="showPokemonDetails(pokemon)"
                    >
                        <img :src="pokemon.image_url" :alt="pokemon.name" />
                        <h3>#{{ pokemon.pokemon_id }} {{ capitalize(pokemon.name) }}</h3>
                    </div>
                </div>

                <!-- POKEMON DETAILS -->
                <div v-if="selectedPokemon"id="pokemon-details-modal" class="pokemon-modal" @click.self="closeModal">
                    <div class="modal-content">
                        <span class="close-button" @click="closeModal">&times;</span>

                        <!-- Grid Section -->
                        <div class="modal-grid">

                            <!-- Left: Image + Price -->
                            <div class="image-column" :class="'stage-' + selectedPokemon.level">
                                <img :src="selectedPokemon.image_url" :alt="selectedPokemon.name" />
                            </div>

                            <!-- Right: Details -->
                            <div class="details-column">
                                <h2>#{{ selectedPokemon.pokemon_id }} {{ capitalize(selectedPokemon.name) }}</h2>

                                <div class="details-list">
                                    <p><strong>Type:</strong> <span>{{ selectedPokemon.type1 }}{{ selectedPokemon.type2 ? ', ' + selectedPokemon.type2 : '' }}</span></p>
                                    <p><strong>HP:</strong> <span>{{ selectedPokemon.hp }}</span></p>
                                    <p><strong>Attack:</strong> <span>{{ selectedPokemon.attack }}</span></p>
                                    <p><strong>Stage:</strong> <span>{{ selectedPokemon.level }}</span></p>
                                </div>
                            </div>

                        </div>

                        <!-- Close Button -->
                        <div class="buy-button-wrapper">
                            <button
                                v-if="userId"
                                class="buy-button"
                                @click="closeModal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                <!-- PAGINATION -->
                <div class="pagination">
                    <button :style="{ visibility: currentPage === 1 ? 'hidden' : 'visible' }" @click="prevPage">Prev</button>
                    <div class="pagination-center">
                        <span>Page {{ currentPage }} of {{ totalPages }}</span>
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{ width: ((currentPage / totalPages) * 100) + '%' }"
                            ></div>
                        </div>
                    </div>
                    <button :style="{ visibility: currentPage === totalPages ? 'hidden' : 'visible' }" @click="nextPage">Next</button>
                </div>
            </div>
        </section>
    `,

    data() {
        return {
            pokemonList: [],
            currentPage: 1,
            perPage: 24,
            totalPages: 1,
            loading: false,
            userId: null,
            // Pokemon Details Popup
            selectedPokemon: null,
        };
    },

    methods: {
        async fetchPokemonPage(page) {
            console.log("fetch pokemon page has been called");
            this.loading = true;
            const offset = (page - 1) * this.perPage;

            try {
                const response = await fetch(
                    `http://localhost:8080/collection/${this.userId}?limit=${this.perPage}&offset=${offset}`
                );

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                this.pokemonList = data.results;

                // debug: showing the result
                console.log('The result output:', this.pokemonList);

                this.totalPages = Math.ceil(data.total / this.perPage);
            }

            catch (error) {
                console.error("Failed to fetch pokedex data:", error);
            }

            finally {
                this.loading = false;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.fetchPokemonPage(this.currentPage);
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchPokemonPage(this.currentPage);
            }
        },
        capitalize(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        // Pokemon Card Details Popup
        showPokemonDetails(pokemon) {
        this.selectedPokemon = pokemon;
        },
        closeModal() {
            this.selectedPokemon = null;
        },
    },

    async mounted() {
        const userRes = await fetch('http://localhost:8080/getUser', {
            credentials: 'include'
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            this.userId = userData.user.user_id;
            this.fetchPokemonPage(this.currentPage);
        }
    }
};