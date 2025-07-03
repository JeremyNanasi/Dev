

function getElementByIdPokedex(i, results, globalCounter) {
    const typesString = results[i].types.join(", ");
    return `
        <div onclick="infoPokedexByName(event, '${results[i].name}')" class="pokedex_div">
            <div class="global_counter">${globalCounter}</div>    
            <div class="pokedex_div_item">
                <div class="pokedex_div_item_img ${typesString}">
                    <img class="image_hover" src="${results[i].url}" alt="${results[i].name}">
                </div>
                <div class="pokedex_div_item_info">
                    <h3>${results[i].name}</h3>
                    <p>Type: ${typesString}</p>
                    <p>Height: ${results[i].height / 10} m</p>
                    <p>Weight: ${results[i].weight / 10} kg</p>
                </div>
            </div>
        </div>
    `;
}


function getElementByIdInfo(pokemon) {
    return `
        <div class="overlay">
            <div class="info_nummber_and_close">
                <div class="info_counter">${pokemon.index + 1}</div>
                <button onclick="closeInfo()" id="info_pokedex_close">X</button>
            </div>
            <h3 class="info_pokedex_name">${pokemon.name}</h3>
            <div class="info_img_div">
            <img src="${pokemon.imageUrl}" alt="${pokemon.name}">
            </div>
            <div class="main_info_div"> 
                <p class="p_margin">Type: ${pokemon.types}</p>
                <p class="p_margin">Height: ${pokemon.height} m</p>
                <p class="p_margin">Weight: ${pokemon.weight} kg</p>
                <p class="p_margin">Base Experience: ${pokemon.baseExperience}</p>
                <p class="p_margin">Abilities: ${pokemon.abilities}</p>
            </div>
            <div class="info_link_button">
                <button onclick="infoPokedex(${pokemon.index})">main</button>
                <button onclick="statsPokedex('${pokemon.name}')">stats</button>
                <button onclick="evoPokemon('${pokemon.name}', ${pokemon.index})">evo chain</button>
            </div>
            <div class="info_nav_buttons">
                <button onclick="navigateInfo(${pokemon.index - 1})">&laquo; Vorheriges</button>
                <button onclick="navigateInfo(${pokemon.index + 1})">Nächstes &raquo;</button>
            </div>
        </div>
    `;
}

function getElementByIdStats(stats) {
    return `
        <div id="stats-container">
            <p><strong>HP:</strong> ${stats.hp}</p>
            <p><strong>Attack:</strong> ${stats.attack}</p>
            <p><strong>Defense:</strong> ${stats.defense}</p>
            <p><strong>Special Attack:</strong> ${stats["special-attack"]}</p>
            <p><strong>Special Defense:</strong> ${stats["special-defense"]}</p>
            <p><strong>Speed:</strong> ${stats.speed}</p>
        </div>
    `;
}

function getElementByIdButton(pokemon) {
    return `
        <div class="info_link_button">
            <button onclick="infoPokedex(${pokemon.index})">main</button>
            <button onclick="statsPokedex('${pokemon.name}')">stats</button>
            <button onclick="evoPokemon('${pokemon.name}', ${pokemon.index})">evo chain</button>
        </div>
    `;
}


function getElementByIdEvoClose() {
    return `
        <div class="info_close">
            <button onclick="closeInfo()" id="info_pokedex_close">X</button>
            </div>
            <div id="evo_images"></div>
    `;
}

function getElementByIdEvo(src, evoName) {
    return `
        <div class="evo_div">
            <img class="evo_image" src="${src}" alt="${evoName}">
        </div>
    `;
}