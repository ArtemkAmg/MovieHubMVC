let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const favoritesGrid = document.querySelector("#favoritesGrid");
const emptyFavorites = document.querySelector("#emptyFavorites");
const favoritesCount = document.querySelector("#favoritesCount");

function createMovieCard(movie) {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.innerHTML = `
        <button class="favorite-btn" data-id="${movie.id}">
            ❤️
        </button>
        <img src="${movie.poster}" onerror="this.onerror=null;this.src='/images/featured/poster-unavailable.svg'" alt="${movie.title}">
        <div class="movie-overlay">
            <div class="movie-title">
                <h3>${movie.title}</h3>
                <span>⭐ ${movie.rating}</span>
            </div>
            <div class="movie-bottom">
                <p>${movie.genre}</p>
                <span>${movie.year}</span>
            </div>
        </div>
    `;

    const favoriteBtn = movieCard.querySelector(".favorite-btn");

    favoriteBtn.addEventListener("click", function (e) {
        e.stopPropagation();

        favorites = favorites.filter(function (id) { return id !== movie.id; });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
    });

    movieCard.addEventListener("click", function () {
        window.location.href = "/Movie/Details?id=" + movie.id;
    });

    return movieCard;
}

function renderFavorites() {
    const favoriteMovies = movies.filter(function (movie) {
        return favorites.includes(movie.id);
    });

    favoritesGrid.innerHTML = "";

    if (favoriteMovies.length === 0) {
        emptyFavorites.style.display = "block";
        favoritesCount.textContent = "";
        return;
    }

    emptyFavorites.style.display = "none";
    favoritesCount.textContent = favoriteMovies.length + " movie" + (favoriteMovies.length === 1 ? "" : "s");

    favoriteMovies.forEach(function (movie) {
        favoritesGrid.appendChild(createMovieCard(movie));
    });
}

renderFavorites();