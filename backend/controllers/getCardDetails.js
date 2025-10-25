/* eslint-disable */
const {getEvolutionChain, assignEvolutionLevel} = require("./getEvolutionStage");


const axios = require('axios');

const getCardDetails = async (url) => {
    try{
        // const response = await axios.get(url);
        // const data = response.data;

        // Destructure the data directly from the response object
        const { data } = await axios.get(url);

        // get the level stage of a pokemon
        const evolutionChain = await getEvolutionChain(url);
        const level = assignEvolutionLevel(evolutionChain, data.name);

        const types = data.types.map(t => t.type.name);

        return {
            pokemon_id: data.id,
            name: data.name,
            type1: types[0] || null,
            type2: types[1] || null,
            hp: data.stats[0]?.base_stat || 0,
            attack: data.stats[1]?.base_stat || 0,
            image_url: data.sprites.other.dream_world.front_default,
            level: level
        };

    } catch (error){
        console.error('Error getting pokemon details:', error);
        return null;
    }
};

module.exports = { getCardDetails };
