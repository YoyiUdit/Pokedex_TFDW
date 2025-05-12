$(document).ready(function () {
    const pokemonContainer = $('#pokemonContainer');
    const prevButton = $('#prev-button'); // Botón de anterior
    const nextButton = $('#next-button'); // Botón de siguiente
    let allPokemonList = [];
    let filteredList = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Rango de Pokémon por generación
    const generationRanges = {
        0: { start: 1, end: 1025},   // Todos
        1: { start: 1, end: 151 },   // Kanto
        2: { start: 152, end: 251 }, // Johto
        3: { start: 252, end: 386 }, // Hoenn
        4: { start: 387, end: 493 }, // Sinnoh
        5: { start: 494, end: 649 }, // Unova
        6: { start: 650, end: 721 }, // Kalos
        7: { start: 722, end: 809 }, // Alola
        8: { start: 810, end: 905 }, // Galar
        9: { start: 906, end: 1025 } // Paldea
    };

    // Colores por tipo (para el fondo de las tarjetas)
    const typeColors = {
        bug: "#A8B820", dark: "#705848", dragon: "#7038F8", electric: "#F8D030",
        fairy: "#EE99AC", fighting: "#C03028", fire: "#F08030", flying: "#A890F0",
        ghost: "#705898", grass: "#78C850", ground: "#E0C068", ice: "#98D8D8",
        normal: "#A8A878", poison: "#A040A0", psychic: "#F85888", rock: "#B8A038",
        steel: "#B8B8D0", water: "#6890F0"
    };

    // Traducción de tipos al español
    const typeTranslation = {
        bug: "Bicho", dark: "Siniestro", dragon: "Dragón", electric: "Eléctrico",
        fairy: "Hada", fighting: "Lucha", fire: "Fuego", flying: "Volador",
        ghost: "Fantasma", grass: "Planta", ground: "Tierra", ice: "Hielo",
        normal: "Normal", poison: "Veneno", psychic: "Psíquico", rock: "Roca",
        steel: "Acero", water: "Agua"
    };

    // Calcular el color del texto según el fondo (para asegurarse de que sea legible)
    function getTextColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? '#000000' : '#FFFFFF';
    }

    // Cargar datos de un Pokémon
    function loadPokemonData(url) {
        return $.get(url).then(data => {
            return {
                id: data.id,
                name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
                types: data.types.map(t => t.type.name),
                image: data.sprites.front_default || "placeholder.png",
                isAltForm: data.forms && data.forms.length > 1 // Verificar si tiene formas alternativas
            };
        }).catch(() => null); // Por si algún dato falla
    }

    // Filtrar Pokémon con todos los filtros aplicados
    function applyFilters() {
        filteredList = allPokemonList;

        // Filtro por tipo
        const selectedType = $('#filter-type').val();
        if (selectedType) {
            filteredList = filteredList.filter(p => p.types.includes(selectedType));
        }

        // Filtro por generación
        const selectedGeneration = $('#filter-generation').val();
        if (selectedGeneration !== '0') {
            const { start, end } = generationRanges[selectedGeneration];
            filteredList = filteredList.filter(p => p.id >= start && p.id <= end);
        }

        // Filtro por formas alternativas
        const selectedForma = $('#filter-forma').val();
        if (selectedForma === "alternativa") {
            filteredList = filteredList.filter(p => p.isAltForm);
        }

        // Filtro por búsqueda de nombre
        const query = $('#search-input').val().toLowerCase();
        if (query) {
            filteredList = filteredList.filter(p => p.name.toLowerCase().includes(query));
        }

        // Ordenar por el valor seleccionado en el filtro de orden
        const sortOption = $('#sort-options').val();
        if (sortOption === "name") {
            filteredList.sort((a, b) => a.name.localeCompare(b.name)); // Orden alfabético
        } else if (sortOption === "number") {
            filteredList.sort((a, b) => a.id - b.id); // Orden por número
        }

        renderCards(filteredList); // Mostrar las cartas filtradas
    }

    // Renderizar las cartas de Pokémon con paginación
    function renderCards(pokemonList) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedList = pokemonList.slice(startIndex, endIndex);

        pokemonContainer.empty(); // Limpiar el contenedor de tarjetas

        paginatedList.forEach(pokemon => {
            const type = pokemon.types[0];
            const bgColor = typeColors[type] || '#FFFFFF';
            const textColor = getTextColor(bgColor);
            const translatedTypes = pokemon.types.map(t => typeTranslation[t] || t);

            const infoLabel = pokemon.isAltForm
                ? `<span class="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">Forma alternativa</span>`
                : `<span class="position-absolute top-0 start-0 m-2 badge bg-light text-dark">#${pokemon.id}</span>`;

            const typeBadges = translatedTypes.map((typeName, index) => {
                const typeKey = pokemon.types[index];
                const badgeColor = typeColors[typeKey] || '#AAA';
                const badgeTextColor = getTextColor(badgeColor);
                return `<span class="badge me-1" style="background-color: ${badgeColor}; color: ${badgeTextColor}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.75rem;">${typeName}</span>`;
            }).join('');

            const card = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-2 mb-4 d-flex align-items-stretch">
                <div class="card shadow-sm w-100 position-relative d-flex flex-column justify-content-between text-center"
                    style="background-color: ${bgColor}; color: ${textColor}; height: 320px; padding: 12px;">
                    ${infoLabel}
                    <div class="d-flex justify-content-center align-items-center flex-grow-1" style="height: 140px;">
                        <img src="${pokemon.image}" alt="${pokemon.name}" style="max-height: 120px; width: auto;">
                    </div>
                    <div>
                        <h5 class="card-title mt-2">${pokemon.name}</h5>
                        <div class="mt-2">${typeBadges}</div>
                    </div>
                </div>
            </div>
            `;

            pokemonContainer.append(card);
        });

        // Actualizar la visibilidad de las flechas
        prevButton.prop('disabled', currentPage === 1);
        nextButton.prop('disabled', currentPage * itemsPerPage >= pokemonList.length);
    }

    // Función para cargar Pokémon de una generación
    function loadGeneration(genNumber) {
        const { start, end } = generationRanges[genNumber];

        $.get('https://pokeapi.co/api/v2/pokemon?limit=100000').then(response => {
            const urls = response.results.map(p => p.url);

            const promises = urls.map(url => loadPokemonData(url));

            Promise.all(promises).then(pokemonData => {
                // Si estás en "Todos", incluyes todo
                allPokemonList = pokemonData;
                applyFilters(); // Aplica los filtros después de cargar los Pokémon
            });
        });
    }

    // Inicializar filtros y cargar Pokémon
    $('#filter-type').change(applyFilters);
    $('#filter-generation').change(applyFilters);
    $('#filter-forma').change(applyFilters);
    $('#search-input').on('input', applyFilters);

    // Ordenar por nombre o número
    $('#sort-options').change(applyFilters);

    // Navegar a la página anterior
    prevButton.click(function () {
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
        }
    });

    // Navegar a la página siguiente
    nextButton.click(function () {
        if (currentPage * itemsPerPage < filteredList.length) {
            currentPage++;
            applyFilters();
        }
    });

    // Cargar todos los Pokémon al principio (esto puedes cambiarlo según la generación)
    loadGeneration(0);  // Aquí se carga la "generación 0" que incluye todos los Pokémon
});
