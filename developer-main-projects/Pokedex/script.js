let offset = 20;
let limit = 20;
let globalCounter = 1;
let results = [];

async function getPokemonData(limit = 20, offset = 0) {
    showLoader();
    const BASE_URL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) {
            throw new Error("Fehler beim Abrufen der Daten");
        }
        const data = await response.json();
        const basicResults = data.results;
        await returnData(basicResults);
    } catch (error) {
        console.error('Fehler:', error);
    }
    hideLoader();
}

async function returnData(basicResults) {
    const newResults = await Promise.all(basicResults.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        const details = await res.json();
        return {
            name: pokemon.name,
            url: details.sprites.front_default,
            weight: details.weight,
            height: details.height,
            types: details.types.map(t => t.type.name),
        };
    }));
    results = results.concat(newResults);
    getPokemonInHtml(newResults);
}

function getPokemonInHtml(results) {
    let pokedexDiv = document.getElementById("pokedex");
    for(let i = 0; i < results.length; i++) {
        results[i];
        pokedexDiv.innerHTML += getElementByIdPokedex(i, results, globalCounter);
        globalCounter++;
    }
    filterPokedex();
}

async function addPokedex() {
    showLoader();
    await getPokemonData(limit, offset);
    hideLoader();
    if(offset == 0) {
        offset = 20;
    }
    offset += limit;
}

function showLoader() {
    const loader = document.getElementById("custom-loader");
    loader.style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("custom-loader");
    loader.style.display = "none";
}

function infoPokedexByName(event, name) {
    event.stopPropagation();
    const index = results.findIndex(p => p.name === name);
    if (index === -1) {
        console.error("Pokémon nicht gefunden:", name);
        return;
    }

    const overlay = document.getElementById("block_click_overlay");
    overlay.style.zIndex = "999";
    overlay.style.pointerEvents = "auto";
    infoPokedex(index);
}

async function infoPokedex(indexInfo) {
    document.body.classList.add('no-scroll');
    const { name } = results[indexInfo];
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!res.ok) throw new Error("Pokémon-Details nicht gefunden");
        const data = await res.json();
        buildPokemonInfo(indexInfo, data);
    } catch (err) {
        console.error("Fehler bei der Info:", err);
    }
}

function buildPokemonInfo(index, data) {
    const formattedData = formatPokemonData(index, data);
    renderPokemonInfoBox(formattedData);
}

function formatPokemonData(index, data) {
    return {
        index,
        name: data.name,
        imageUrl: data.sprites.front_default,
        types: data.types.map(t => t.type.name).join(", "),
        height: data.height / 10,
        weight: data.weight / 10,
        baseExperience: data.base_experience,
        abilities: data.abilities.map(a => a.ability.name).join(", ")
    };
}

function renderPokemonInfoBox(pokemon) {
    const info = document.getElementById("info_pokedex");
    info.style.display = "block";
    info.innerHTML = getElementByIdInfo(pokemon);

    const overlay = document.getElementById("block_click_overlay");
    overlay.style.zIndex = "0";
    overlay.style.pointerEvents = "auto";
}

function closeInfo() {
    document.body.classList.remove('no-scroll');
    let info = document.getElementById("info_pokedex");
    info.style.display = "none";

    const overlay = document.getElementById("block_click_overlay");
    overlay.style.zIndex = "-1";
    overlay.style.pointerEvents = "none";
}

async function statsPokedex(pokemonName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) throw new Error("Fehler beim Abrufen der Pokémon-Stats");
        const data = await response.json();

        const stats = extractStats(data);
        const index = results.findIndex(p => p.name === pokemonName);

        renderStats(stats, pokemonName, index);
    } catch (error) {
        console.error("Fehler beim Anzeigen der Stats:", error);
    }
}

function extractStats(data) {
    const stats = {};
    data.stats.forEach(stat => stats[stat.stat.name] = stat.base_stat);
    return stats;
}

function renderStats(stats, name, index) {
    const maxStat = 150;
    const container = document.getElementById("info_pokedex");
    container.innerHTML = getElementByIdEvoClose();
    const inner = document.getElementById("evo_images");
    inner.innerHTML = "";
    for (const [label, value] of Object.entries(stats)) {
        const div = document.createElement("div");
        div.className = "stat";
        div.innerHTML = `
            <div class="stat-name">${label.toUpperCase()}: ${value}</div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${(value / maxStat) * 100}%"></div></div>`;
        inner.appendChild(div);
    }
    inner.innerHTML += getElementByIdButton({ name, index });
}

async function evoPokemon(pokemonName) {
    try {
        const evoChainData = await fetchEvoPokemon(pokemonName);
        const evoChain = extractEvoNames(evoChainData.chain);
        await evoPokemonoutput(evoChain);  
    } catch (error) {
        console.error("Fehler beim Laden der Evolutionskette:", error);
    }
}

async function fetchEvoPokemon(pokemonName) {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName.toLowerCase()}`);
    if (!speciesRes.ok) throw new Error("Pokémon-Spezies nicht gefunden");
    const speciesData = await speciesRes.json();

    const evoChainRes = await fetch(speciesData.evolution_chain.url);
    if (!evoChainRes.ok) throw new Error("Evolutionskette nicht gefunden");
    
    const evoChainData = await evoChainRes.json();
    return evoChainData;
}

function extractEvoNames(chain, evoChain = []) {
    evoChain.push(chain.species.name);
    chain.evolves_to.forEach(subEvo => extractEvoNames(subEvo, evoChain));
    return evoChain;
}

async function evoPokemonoutput(evoChain) {
    const evoContainer = document.getElementById("info_pokedex");
    evoContainer.innerHTML = getElementByIdEvoClose();
    const imageContainer = document.getElementById("evo_images");
    let lastEvoName = null;
        for (const evoName of evoChain) {
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`);
            if (!pokemonRes.ok) throw new Error(`Pokémon ${evoName} nicht gefunden`);
            const pokemonData = await pokemonRes.json();
            const src = pokemonData.sprites.front_default;
            imageContainer.innerHTML += getElementByIdEvo(src, evoName);
            lastEvoName = evoName;
        }
    const indexInResults = results.findIndex(p => p.name === lastEvoName);
    imageContainer.innerHTML += getElementByIdButton({ name: lastEvoName, index: indexInResults });
}

function filterPokedex() {
    const searchInput = document.getElementById('searchPokedex');
    let loadMoreButton = document.getElementById('pokedex_button');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredPokemon = results.filter(pokemon =>
            pokemon.name.toLowerCase().startsWith(searchTerm)
        );

        filteredPokedexlength(filteredPokemon, searchTerm, loadMoreButton);
});
}

function filteredPokedexlength(filteredPokemon, searchTerm, loadMoreButton) {
    if(searchTerm.length > 0) {
        loadMoreButton.style.display = "none";
    } else {
        loadMoreButton.style.display = "block";
        onbodyclick();
    }
        let pokedexDiv = document.getElementById("pokedex");
        pokedexDiv.innerHTML = "";
        let localCounter = 1;

        for (let i = 0; i < filteredPokemon.length; i++) {
            pokedexDiv.innerHTML += getElementByIdPokedex(i, filteredPokemon, localCounter);
            localCounter++;
        }
}

function navigateInfo(index) {
    if (index < 0 || index >= results.length) return;
    infoPokedex(index);
}

function onbodyclick() {
    let bodyZindex = document.getElementById('body_onclick');
    bodyZindex.style.zIndex = '-2';
}

document.addEventListener("click", function(event) {
    const infoBox = document.getElementById("info_pokedex");

    const isInfoVisible = infoBox.style.display === "block";
    const clickedInsideInfo = infoBox.contains(event.target);

    if (isInfoVisible && !clickedInsideInfo) {
        closeInfo();
    }
});
