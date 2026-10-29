const params = new URLSearchParams(window.location.search);
const movieId = Number(params.get("id"));

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const movie = movies.find(movie => movie.id === movieId);

const movieContainer = document.querySelector("#movieContainer");

if (!movie) {

    movieContainer.innerHTML = `
        <div class="movie-not-found">

            <h2>Movie not found 😢</h2>

            <a href="/" class="hero-btn">
                Back Home
            </a>

        </div>
    `;

} else {

    const isFavorite = favorites.includes(movie.id);

    const hero = document.querySelector(".movie-hero");

    const bgUrl = movie.backdrop || movie.poster;
    hero.style.backgroundImage = "none";

    let bgLayer = hero.querySelector(".movie-hero-bg");
    if (!bgLayer) {
        bgLayer = document.createElement("div");
        bgLayer.className = "movie-hero-bg";
        hero.insertBefore(bgLayer, hero.firstChild);
    }
    bgLayer.style.backgroundImage = "url(" + bgUrl + ")";

    const testImg = new Image();
    testImg.onerror = function () {
        bgLayer.style.backgroundImage = "url(" + movie.poster + ")";
    };
    testImg.src = bgUrl;

    movieContainer.innerHTML = `

        <div class="movie-content">

            <div class="movie-left">

                <img
                    src="${movie.poster}" onerror="this.onerror=null;this.src='/images/featured/poster-unavailable.svg'"
                    alt="${movie.title}"
                    class="movie-poster"
                >

                <button
                    id="favBtn"
                    class="favorite-button ${isFavorite ? "active" : ""}"
                >

                    ${isFavorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}

                </button>

            </div>

            <div class="movie-right">

                <span class="movie-category">
                    ${movie.genre}
                </span>

                <h1>${movie.title}</h1>

                <div class="movie-meta">

                    <span>⭐ ${movie.rating}</span>

                    <span>📅 ${movie.year}</span>

                    <span>⏱ ${movie.duration}</span>

                </div>

                <p class="movie-description">

                    ${movie.description}

                </p>

                <div class="movie-section">

                    <h3>Director</h3>

                    <p>${movie.director}</p>

                </div>

                <div class="movie-section">

                    <h3>Cast</h3>

                    <div class="cast-list">

                        ${movie.cast.map(actor => `
                            <span class="actor-tag">
                                ${actor}
                            </span>
                        `).join("")}

                    </div>

                </div>

                <div class="movie-buttons">

    <a
        href="${movie.trailerUrl}"
        target="_blank"
        class="hero-btn"
    >

        <i class="fa-solid fa-play"></i>

        Watch Trailer

    </a>

    <a
        href="/"
        class="secondary-btn"
    >

        <i class="fa-solid fa-arrow-left"></i>

        Back

    </a>

</div>

            </div>

        </div>

    `;

    const favBtn = document.querySelector("#favBtn");

    favBtn.addEventListener("click", () => {

        if (favorites.includes(movie.id)) {

            favorites = favorites.filter(id => id !== movie.id);

            favBtn.innerHTML = "🤍 Add to Favorites";

            favBtn.classList.remove("active");

        } else {

            favorites.push(movie.id);

            favBtn.innerHTML = "❤️ Remove from Favorites";

            favBtn.classList.add("active");

        }

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

    });

}