/* eslint-disable */
const axios = require('axios');

// Get the elvolution chain
const getEvolutionChain = async (pokemonUrl) => {
    try{
        // go to the pokemon url (official)
        const pokemonData = await axios.get(pokemonUrl);

        // go to the species url that are in pokemon url - species part
        const speciesUrl = pokemonData.data.species.url;

        // go to the species url to get evolution chain
        const speciesResponse = await axios.get(speciesUrl);

        // get evolution chain
        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;

        // get response from evolution url
        const evolutionChainResponse = await axios.get(evolutionChainUrl);

        return evolutionChainResponse.data.chain;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        return null;
    }
};

// decide which stage the pokemon is at
const assignEvolutionLevel = (evolutionChain, targetName) => {
    let stage = 0;
    // copy so no adjust in evolution chain
    let currentChain = evolutionChain;
    while (currentChain) {
        stage += 1;
        // found the pokemon
        if (currentChain.species.name === targetName) {
            break;
        }
        if (currentChain.evolves_to.length > 0) {
            [currentChain] = currentChain.evolves_to; // move to the next evolutionary step
        } else {
            break; // no furthur evolution
        }
    }
    return stage;
};

module.exports = { getEvolutionChain, assignEvolutionLevel };