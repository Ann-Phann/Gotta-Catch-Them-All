/* ######## CONTENT ########
    UI:
        CONTROL BLOCK
        FILTER SIDEBAR
        POKEMON DETAILS
        PURCHASE BLOCK
        CARD BLOCK
        PAGINATION BLOCK
    LOGIC:
        fetchPokemonPage,
        searchPokemon,
        fetchFavoritesPage,
        buyCard,
        confirmPurchase,
        filteredPokemonList
*/

const PokedexView = {
    template: `
        <section class="pokedex bgWhite">
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <span>Loading...</span>
            </div>

            <div v-else>
                <!-- CONTROL BLOCK -->
                <div class="controls">
                    <div class="search-container">
                        <input
                            type="text"
                            name="search"
                            class="searchInput"
                            placeholder="SEARCH"
                            v-model="searchTerm"
                            @keyup.enter="searchPokemon"
                        />
                        <button type="button" class="searchBtn" @click="searchPokemon">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div>
                         <button class="showCollectionBtn"  @click="toggleMyCollection" :class="{ active: showMyCollection }">
                            MY COLLECTION
                        </button>

                        <button @click="showFilter = !showFilter" class="showFilterBtn">
                            <i class="fas fa-filter"></i>FILTER & SORT
                        </button>
                    </div>

                </div>

                <!-- MY COLLECTION  -->



                <!-- FILTER SIDEBAR -->
                <div v-if="showFilter" class="filter-sidebar" @click.self="showFilter = false">
                    <div class="filter-sidebar-content">
                        <button class="close-sidebar-btn" @click="showFilter = false">&times;</button>

                        <!-- SORT -->
                        <div class="filter-group">
                            <button class="filter-toggle" @click="toggleDropdown('sort')">
                                SORT <i :class="dropdowns.sort ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                            </button>
                            <div class="filter-options" v-show="dropdowns.sort">
                                <label><input type="radio" name="sort" value="sortByIdAscending" v-model="selectedSort"> ID Ascending</label>
                                <label><input type="radio" name="sort" value="sortByIdDescending" v-model="selectedSort"> ID Descending</label>
                                <label><input type="radio" name="sort" value="sortByNameAtoZ" v-model="selectedSort"> Name A → Z</label>
                                <label><input type="radio" name="sort" value="sortByNameZtoA" v-model="selectedSort"> Name Z → A</label>
                                <label><input type="radio" name="sort" value="sortByLevelAscending" v-model="selectedSort"> Level Ascending</label>
                                <label><input type="radio" name="sort" value="sortByLevelDescending" v-model="selectedSort"> Level Descending</label>
                            </div>
                        </div>

                        <!-- FILTER GROUP -->
                        <div  v-if="userId" class="filter-group">
                            <button class="filter-toggle" @click="toggleDropdown('favorite')">
                                FAVORITE <i :class="dropdowns.favorite ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                            </button>
                            <div class="filter-options" v-show="dropdowns.favorite">
                                 <label><input type="checkbox" v-model="favoritesFilterSelected"> Show only favorites</label>
                            </div>
                        </div>
                        <div class="filter-group">
                            <button class="filter-toggle" @click="toggleDropdown('stage')">
                                STAGE <i :class="dropdowns.stage ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                            </button>
                            <div class="filter-options" v-show="dropdowns.stage">
                                <label><input type="checkbox" :value="1" v-model="filter.level"> Stage 1</label>
                                <label><input type="checkbox" :value="2" v-model="filter.level"> Stage 2</label>
                                <label><input type="checkbox" :value="3" v-model="filter.level"> Stage 3</label>

                            </div>
                        </div>

                        <div class="filter-group">
                            <button class="filter-toggle" @click="toggleDropdown('type')">
                                TYPE <i :class="dropdowns.type ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                            </button>
                            <div class="filter-options" v-show="dropdowns.type">
                                <label><input type="checkbox" value="Normal" v-model="filter.type"> Normal</label>
                                <label><input type="checkbox" value="Fire" v-model="filter.type"> Fire</label>
                                <label><input type="checkbox" value="Grass" v-model="filter.type"> Grass</label>
                                <label><input type="checkbox" value="Flying" v-model="filter.type"> Flying</label>
                                <label><input type="checkbox" value="Water" v-model="filter.type"> Water</label>
                                <label><input type="checkbox" value="Psychic" v-model="filter.type"> Psychic</label>
                                <label><input type="checkbox" value="Bug" v-model="filter.type"> Bug</label>
                                <label><input type="checkbox" value="Poison" v-model="filter.type"> Poison</label>
                                <label><input type="checkbox" value="Ground" v-model="filter.type"> Ground</label>
                                <label><input type="checkbox" value="Rock" v-model="filter.type"> Rock</label>


                            </div>
                        </div>

                        <div class="filter-group">
                            <button class="filter-toggle" @click="toggleDropdown('stats')">
                                STATS <i :class="dropdowns.stats ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                            </button>
                            <div class="filter-options" v-show="dropdowns.stats">
                                <label>Min HP: <input type="number" v-model.number="filter.hp.min" /></label>
                                <label>Max HP: <input type="number" v-model.number="filter.hp.max" /></label>
                                <label>Min ATK: <input type="number" v-model.number="filter.attack.min" /></label>
                                <label>Max ATK: <input type="number" v-model.number="filter.attack.max" /></label>
                            </div>
                        </div>

                        <button class="clear-filter-btn" @click="clearFilters">Clear Filters</button>

                        <div class="filter-footer">
                            <button class="apply-btn" @click="applyFilters">Apply</button>
                        </div>
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
                                <div class="price-block">
                                    <p><strong>Price:</strong> {{ selectedPokemon.level*100 }} Coins</p>
                                </div>
                                <i
                                    v-if="userId"
                                    class="fas fa-heart favorite-icon"
                                    :class="{ favorited: favorites.has(selectedPokemon.pokemon_id) }"
                                    @click.stop="toggleFavorite(selectedPokemon.pokemon_id)"
                                ></i>
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

                        <!-- Purchase Success Message -->
                        <div v-if="purchaseMessage" class="points-success">
                            <p>{{ purchaseMessage }}</p>
                        </div>
                     
                        <!-- Not Enough Points Message -->
                        <div v-if="notEnoughPointsMessage" class="points-warning">
                            <p>
                                {{ notEnoughPointsMessage }}
                                <a href="#" class="play-link" @click.prevent="goToGameView">Go to GameView to earn more points</a>
                            </p>
                        </div>

                        <!-- Bottom Center Buy Button -->
                        <div class="buy-button-wrapper">
                            <button
                                v-if="userId"
                                class="buy-button"
                                @click.stop="buyCard(selectedPokemon)"
                            >
                                Buy
                            </button>
                        </div>
                    </div>
                </div>

                <!-- PURCHASE BLOCK -->
               <div id="confirm-purchase-modal" v-if="showPurchaseModal">
                    <div class="confirm-modal-content">
                        <div class="confirm-title">
                        Do you want to buy
                        <strong>{{ capitalize(selectedPokemon.name) }}</strong>
                        for {{ selectedPokemon.level * 100 }} points?
                        </div>
                        <div class="confirm-buttons">
                        <button class="confirm-button cancel" @click="showPurchaseModal = false">Cancel</button>
                        <button class="confirm-button confirm" @click="confirmPurchase">Confirm</button>
                        </div>
                    </div>
                </div>


                <!-- CARD BLOCK -->
                <div class="card-flex">
                    <div
                        v-for="pokemon in filteredPokemonList"
                        :key="pokemon.pokemon_id"
                        class="pokemon-card"
                        :class="'stage-' + pokemon.level"
                        @click="showPokemonDetails(pokemon)"
                    >
                        <img :src="pokemon.image_url" :alt="pokemon.name" />
                        <h3>#{{ pokemon.pokemon_id }} {{ capitalize(pokemon.name) }}</h3>

                        <i
                            v-if="userId"
                            class="fas fa-heart favorite-icon"
                            :class="{ favorited: favorites.has(pokemon.pokemon_id) }"
                            @click.stop="toggleFavorite(pokemon.pokemon_id)"
                        ></i>
                    </div>
                </div>

                <!-- PAGINATION BLOCK -->
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
            showFilter: false,
            searchTerm: '',
            dropdowns: {
                sort: true,
                favorite : false,
                stage: false,
                type: false,
                stats: false,
            },
            filter: {
                type: [],
                level: [],
                attack: { min: 0, max: 200 },
                hp: { min: 0, max: 200 }
            },
            selectedSort: 'sortByIdAscending',
            favorites: new Set(),
            userId: null,
            showOnlyFavorites: false,
            favoritesFilterSelected: false,
            // Pokemon Details Popup
            selectedPokemon: null,
            purchaseMessage: '',
            notEnoughPointsMessage: '',
            showPurchaseModal: false,

        };
    },
    methods: {
        async fetchPokemonPage(page) {
            this.loading = true;

            const offset = (page - 1) * this.perPage;
            const sort = this.selectedSort || 'sortByIdAscending';
            const filterParams = new URLSearchParams();

            // Type filter
            if (Array.isArray(this.filter.type) && this.filter.type.length > 0) {
                this.filter.type.forEach((t) => filterParams.append('type', t));
            }

            // Level filter
            if (Array.isArray(this.filter.level) && this.filter.level.length > 0) {
                this.filter.level.forEach((l) => filterParams.append('level', l));
            }

            // HP filter
            const { min: minHp, max: maxHp } = this.filter.hp || {};
            if (minHp != null) filterParams.append('minHp', minHp);
            if (maxHp != null) filterParams.append('maxHp', maxHp);

            // Attack filter
            const { min: minAtk, max: maxAtk } = this.filter.attack || {};
            if (minAtk != null) filterParams.append('minAtk', minAtk);
            if (maxAtk != null) filterParams.append('maxAtk', maxAtk);

            // Optional: Debugging output
            console.log('Filter params:', filterParams.toString());

            try {
                const response = await fetch(
                    `http://localhost:8080/pokedex?limit=${this.perPage}&offset=${offset}&sort=${sort}&${filterParams.toString()}&_=${Date.now()}`
                );

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                this.pokemonList = data.results;

                // debug: showing the result
                console.log('The result output:', this.pokemonList);

                this.totalPages = Math.ceil(data.total / this.perPage);
            } catch (error) {
                console.error("Failed to fetch pokedex data:", error);
            } finally {
                this.loading = false;
            }
        },
        async searchPokemon(page = 1) {
            this.loading = true;
            const offset = (page - 1) * this.perPage;
            const sort = this.selectedSort;
            const filterParams = new URLSearchParams();
            if (this.filter.type.length) {
                this.filter.type.forEach((t) => filterParams.append('type', t));
            }
            if (this.filter.level.length) {
                this.filter.level.forEach((l) => filterParams.append('level', l));
            }
            if (this.filter.hp.min !== null) filterParams.append('minHp', this.filter.hp.min);
            if (this.filter.hp.max !== null) filterParams.append('maxHp', this.filter.hp.max);
            if (this.filter.attack.min !== null) filterParams.append('minAtk', this.filter.attack.min);
            if (this.filter.attack.max !== null) filterParams.append('maxAtk', this.filter.attack.max);
            try {
                const response = await fetch(
                    `http://localhost:8080/pokedex/search?name=${encodeURIComponent(this.searchTerm)}&limit=${this.perPage}&offset=${offset}&sort=${sort}&${filterParams.toString()}&_=${Date.now()}`
                );
                const data = await response.json();
                this.pokemonList = data.results;
                this.totalPages = Math.ceil(data.total / this.perPage);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchFavoritesPage(page = 1) {
            this.loading = true;
            const offset = (page - 1) * this.perPage;
            const sort = this.selectedSort;
            const filterParams = new URLSearchParams();
            if (this.filter.type.length) {
                this.filter.type.forEach((t) => filterParams.append('type', t));
            }
            if (this.filter.level.length) {
                this.filter.level.forEach((l) => filterParams.append('level', l));
            }
            if (this.filter.hp.min !== null) filterParams.append('minHp', this.filter.hp.min);
            if (this.filter.hp.max !== null) filterParams.append('maxHp', this.filter.hp.max);
            if (this.filter.attack.min !== null) filterParams.append('minAtk', this.filter.attack.min);
            if (this.filter.attack.max !== null) filterParams.append('maxAtk', this.filter.attack.max);
            try {
                const response = await fetch(`http://localhost:8080/favorites?userId=${this.userId}&limit=${this.perPage}&offset=${offset}&sort=${sort}&${filterParams.toString()}&_=${Date.now()}`);
                const data = await response.json();
                this.pokemonList = data.results;
                this.favorites = new Set(data.results.map(p => p.pokemon_id));
                this.totalPages = Math.ceil(data.total / this.perPage);
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            } finally {
                this.loading = false;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                if (this.searchTerm.trim()) {
                    this.searchPokemon(this.currentPage);
                } else if (this.showOnlyFavorites) {
                    this.fetchFavoritesPage(this.currentPage);
                } else {
                    this.fetchPokemonPage(this.currentPage);
                }
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                if (this.searchTerm.trim()) {
                    this.searchPokemon(this.currentPage);
                } else if (this.showOnlyFavorites) {
                    this.fetchFavoritesPage(this.currentPage);
                } else {
                    this.fetchPokemonPage(this.currentPage);
                }
            }
        },
        capitalize(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        toggleDropdown(section) {
            this.dropdowns[section] = !this.dropdowns[section];
        },
        async applyFilters() {
            this.currentPage = 1;
            this.showOnlyFavorites = this.favoritesFilterSelected;
            this.showFilter = false;

            if (this.showOnlyFavorites) {
                this.searchTerm = '';
                await this.fetchFavoritesPage(this.currentPage);
            } else if (this.searchTerm.trim()) {
                await this.searchPokemon(this.currentPage);
            } else {
                await this.fetchPokemonPage(this.currentPage);
            }
        },
        clearFilters() {
            this.filter = {
                type: [],
                level: [],
                attack: { min: 0, max: 200 },
                hp: { min: 0, max: 200 }
            };
            this.selectedSort = 'sortByIdAscending',
            this.favoritesFilterSelected = false,
            this.currentPage = 1;
            this.fetchPokemonData(); // or fetchSearchResults if in search mode
        },
        async toggleFavorite(pokemon_id) {
            const url = 'http://localhost:8080/favorites/toggle';
            try {
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: this.userId, pokemonId: pokemon_id })
                });
                if (this.favorites.has(pokemon_id)) {
                    this.favorites.delete(pokemon_id);
                } else {
                    this.favorites.add(pokemon_id);
                }
            } catch (error) {
                console.error('Favorite toggle failed:', error);
            }
        },
        isFavorited(pokemon_id) {
            return this.favorites.has(pokemon_id);
        },
        async buyCard(pokemon) {
            const cost = pokemon.level * 100;

            this.notEnoughPointsMessage = '';
            this.purchaseMessage = '';

            if (!store.user || store.user.current_points < cost) {
                this.notEnoughPointsMessage = `You need ${cost} points, but you only have ${store.user?.current_points || 0}.`;
                this.purchaseMessage = ''; // clear success message
                return;
            }


            this.notEnoughPointsMessage = '';
            this.purchaseMessage = '';

             // Save selected Pokémon and show modal
            this.selectedPokemon = pokemon;
            this.showPurchaseModal = true;
        },
        async confirmPurchase() {
            const pokemon = this.selectedPokemon;
            const cost = pokemon.level * 100;

            try {
                const response = await axios.post(
                'http://localhost:8080/pokedex/purchase',
                { pokemon_id: pokemon.pokemon_id, cost },
                { withCredentials: true }
                );

                // Update user points and UI
                if (store.user) {
                    store.user.current_points = response.data.newPoints;
                }

                this.purchaseMessage = response.data.message;

            } catch (err) {
                this.purchaseMessage = err.response?.data?.error || 'Purchase failed';
            } finally {
                this.showPurchaseModal = false;
            }
        },
        // Pokemon Card Details Popup
        showPokemonDetails(pokemon) {
        this.selectedPokemon = pokemon;
        },
        closeModal() {
            this.selectedPokemon = null;
            this.purchaseMessage = '';
            this.notEnoughPointsMessage = '';
        },
        goToGameView() {
            this.closeModal(); // Hide the modal
            this.$root.currentView = 'GameView'; // Switch to GameView
}
    },
    watch: {
        searchTerm(inputValue) {
            if (inputValue.trim() === '') {
                this.currentPage = 1;
                this.selectedSort = 'sortByIdAscending';
                this.fetchPokemonPage();
            }
        }
    },
    computed: {
        filteredPokemonList() {
            return this.pokemonList.filter((pokemon) =>
                !this.showOnlyFavorites || this.favorites.has(pokemon.pokemon_id)
            );
        }
    },
    async mounted() {
        const userRes = await fetch('http://localhost:8080/getUser', {
            credentials: 'include',
        });
        if (userRes.ok) {
            const userData = await userRes.json();
            this.userId = userData.user.user_id;
            const favRes = await fetch(`http://localhost:8080/favorites?userId=${this.userId}&limit=9999&offset=0`);
            const favData = await favRes.json();
            this.favorites = new Set(favData.results.map((p) => p.pokemon_id));
        }
        this.fetchPokemonPage();
    }

};
