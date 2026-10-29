let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const moviesGrid = document.querySelector("#moviesGrid");
const searchInput = document.querySelector("#searchInput");
const filterBtn = document.querySelector("#filterBtn");
const filterMenu = document.querySelector("#filterMenu");
const filterReset = document.querySelector("#filterReset");
const moviesCount = document.querySelector("#moviesCount");
const noResults = document.querySelector("#noResults");

let currentGenre = "All";
let currentSort = null;
let currentSearch = "";
let visibleCount = 0;

const loadMoreWrap = document.querySelector("#loadMoreWrap");
const loadMoreBtn = document.querySelector("#loadMoreBtn");

function getPageSize() {
    return window.innerWidth <= 768 ? 20 : 30;
}

function resetVisibleCount() {
    visibleCount = getPageSize();
}

function createMovieCard(movie) {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    const isFav = favorites.includes(movie.id);

    movieCard.innerHTML = `
        <button class="favorite-btn" data-id="${movie.id}">
            ${isFav ? "❤️" : "🤍"}
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

        if (favorites.includes(movie.id)) {
            favorites = favorites.filter(function (id) { return id !== movie.id; });
            favoriteBtn.textContent = "🤍";
        } else {
            favorites.push(movie.id);
            favoriteBtn.textContent = "❤️";
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
    });

    movieCard.addEventListener("click", function () {
        window.location.href = "/Movie/Details?id=" + movie.id;
    });

    return movieCard;
}

function getFilteredMovies() {
    let list = movies.slice();

    if (currentSearch) {
        list = list.filter(function (movie) {
            return movie.title.toLowerCase().includes(currentSearch);
        });
    }

    if (currentGenre && currentGenre !== "All") {
        list = list.filter(function (movie) {
            return movie.genre === currentGenre;
        });
    }

    if (currentSort === "rating") {
        list.sort(function (a, b) { return b.rating - a.rating; });
    } else if (currentSort === "year") {
        list.sort(function (a, b) { return b.year - a.year; });
    } else if (currentSort === "title") {
        list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    }

    return list;
}

function updateFilterBtnState() {
    if (!filterBtn) return;
    const isActive = currentGenre !== "All" || currentSort !== null;
    filterBtn.classList.toggle("has-filters", isActive);
    filterBtn.classList.toggle("is-open", filterMenu && filterMenu.classList.contains("show"));
}

function renderMovies(append) {
    const list = getFilteredMovies();

    if (list.length === 0) {
        moviesGrid.innerHTML = "";
        noResults.style.display = "block";
        moviesCount.textContent = "0 movies";
        if (loadMoreWrap) loadMoreWrap.style.display = "none";
        return;
    }

    noResults.style.display = "none";
    moviesCount.textContent = list.length + " movie" + (list.length === 1 ? "" : "s");

    if (!append) {
        moviesGrid.innerHTML = "";
        if (visibleCount <= 0) resetVisibleCount();
        list.slice(0, visibleCount).forEach(function (movie) {
            moviesGrid.appendChild(createMovieCard(movie));
        });
    } else {
        const from = moviesGrid.children.length;
        list.slice(from, visibleCount).forEach(function (movie) {
            moviesGrid.appendChild(createMovieCard(movie));
        });
    }

    if (loadMoreWrap) {
        loadMoreWrap.style.display = visibleCount < list.length ? "flex" : "none";
    }
}

function positionFilterMenu() {
    if (!filterMenu || !filterBtn || !filterMenu.classList.contains("show")) return;

    const margin = 16;
    const btnRect = filterBtn.getBoundingClientRect();
    const menuHeight = filterMenu.offsetHeight;
    const menuWidth = filterMenu.offsetWidth || 300;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    let top = btnRect.bottom + 12;
    let left = btnRect.right - menuWidth;

    if (left < margin) left = margin;
    if (left + menuWidth > viewportW - margin) {
        left = Math.max(margin, viewportW - menuWidth - margin);
    }

    const spaceBelow = viewportH - btnRect.bottom - margin;
    const spaceAbove = btnRect.top - margin;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        top = btnRect.top - menuHeight - 12;
    }

    if (top < margin) top = margin;
    if (top + menuHeight > viewportH - margin) {
        top = Math.max(margin, viewportH - menuHeight - margin);
    }

    filterMenu.style.maxHeight = (viewportH - margin * 2) + "px";
    filterMenu.style.position = "fixed";
    filterMenu.style.top = top + "px";
    filterMenu.style.left = left + "px";
    filterMenu.style.right = "auto";
}

function openFilterMenu() {
    filterMenu.classList.add("show");
    filterMenu.style.position = "fixed";
    positionFilterMenu();
    updateFilterBtnState();
}

function closeFilterMenu() {
    filterMenu.classList.remove("show");
    filterMenu.style.position = "";
    filterMenu.style.top = "";
    filterMenu.style.left = "";
    filterMenu.style.right = "";
    filterMenu.style.maxHeight = "";
    updateFilterBtnState();
}

if (searchInput) {
    searchInput.addEventListener("input", function () {
        currentSearch = searchInput.value.toLowerCase().trim();
        resetVisibleCount();
        renderMovies();
    });
}

if (filterBtn && filterMenu) {
    filterBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (filterMenu.classList.contains("show")) {
            closeFilterMenu();
        } else {
            openFilterMenu();
        }
    });

    document.addEventListener("click", function (e) {
        if (!filterMenu.contains(e.target) && !filterBtn.contains(e.target)) {
            closeFilterMenu();
        }
    });

    window.addEventListener("scroll", function () {
        if (filterMenu.classList.contains("show")) positionFilterMenu();
    }, { passive: true });

    window.addEventListener("resize", function () {
        if (filterMenu.classList.contains("show")) positionFilterMenu();
    });
}

document.querySelectorAll(".genre-filter").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        document.querySelectorAll(".genre-filter").forEach(function (b) {
            b.classList.remove("active");
        });
        btn.classList.add("active");
        currentGenre = btn.dataset.genre;
        resetVisibleCount();
        updateFilterBtnState();
        renderMovies();
    });
});

document.querySelectorAll(".sort-filter").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const already = btn.classList.contains("active");
        document.querySelectorAll(".sort-filter").forEach(function (b) {
            b.classList.remove("active");
        });
        if (already) {
            currentSort = null;
        } else {
            btn.classList.add("active");
            currentSort = btn.dataset.sort;
        }
        resetVisibleCount();
        updateFilterBtnState();
        renderMovies();
    });
});

if (filterReset) {
    filterReset.addEventListener("click", function (e) {
        e.stopPropagation();
        currentGenre = "All";
        currentSort = null;
        document.querySelectorAll(".genre-filter").forEach(function (b) {
            b.classList.toggle("active", b.dataset.genre === "All");
        });
        document.querySelectorAll(".sort-filter").forEach(function (b) {
            b.classList.remove("active");
        });
        resetVisibleCount();
        updateFilterBtnState();
        renderMovies();
    });
}

resetVisibleCount();
renderMovies();
updateFilterBtnState();

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
        visibleCount += getPageSize();
        renderMovies(true);
    });
}
