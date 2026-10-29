let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const trendingContainer = document.querySelector("#trendingMovies");
const searchInput = document.querySelector("#searchInput");
const filterBtn = document.querySelector("#filterBtn");
const filterMenu = document.querySelector("#filterMenu");
const filterReset = document.querySelector("#filterReset");
const recommendedSlider = document.querySelector("#recommendedSlider");
const prevSlide = document.querySelector("#prevSlide");
const nextSlide = document.querySelector("#nextSlide");

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

    favoriteBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (favorites.includes(movie.id)) {
            favorites = favorites.filter(id => id !== movie.id);
            favoriteBtn.textContent = "🤍";
        } else {
            favorites.push(movie.id);
            favoriteBtn.textContent = "❤️";
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
    });

    movieCard.addEventListener("click", () => {
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
    if (!trendingContainer) return;
    const list = getFilteredMovies();

    if (!append) {
        trendingContainer.innerHTML = "";
        if (visibleCount <= 0) resetVisibleCount();
    }

    const slice = list.slice(0, visibleCount);

    if (!append) {
        slice.forEach(function (movie) {
            trendingContainer.appendChild(createMovieCard(movie));
        });
    } else {
        const from = trendingContainer.children.length;
        list.slice(from, visibleCount).forEach(function (movie) {
            trendingContainer.appendChild(createMovieCard(movie));
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

    // Default: below the button, aligned right
    let top = btnRect.bottom + 12;
    let left = btnRect.right - menuWidth;

    // Keep within horizontal bounds
    if (left < margin) left = margin;
    if (left + menuWidth > viewportW - margin) {
        left = Math.max(margin, viewportW - menuWidth - margin);
    }

    // If not enough space below — open upward
    const spaceBelow = viewportH - btnRect.bottom - margin;
    const spaceAbove = btnRect.top - margin;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        top = btnRect.top - menuHeight - 12;
    }

    // Clamp vertical so menu stays inside viewport
    if (top < margin) top = margin;
    if (top + menuHeight > viewportH - margin) {
        top = Math.max(margin, viewportH - menuHeight - margin);
    }

    // Max height so content scrolls inside menu if needed
    const maxH = viewportH - margin * 2;
    filterMenu.style.maxHeight = maxH + "px";

    // Fixed to viewport so it never leaves the screen; still "follows" via reposition on scroll
    filterMenu.style.position = "fixed";
    filterMenu.style.top = top + "px";
    filterMenu.style.left = left + "px";
    filterMenu.style.right = "auto";
}

function openFilterMenu() {
    filterMenu.classList.add("show");
    // reset absolute styles before measuring
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

// Search
if (searchInput) {
    searchInput.addEventListener("input", function () {
        currentSearch = searchInput.value.toLowerCase().trim();
        resetVisibleCount();
        renderMovies();
    });
}

// Filter menu toggle
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
        if (filterMenu.classList.contains("show")) {
            positionFilterMenu();
        }
    }, { passive: true });

    window.addEventListener("resize", function () {
        if (filterMenu.classList.contains("show")) {
            positionFilterMenu();
        }
    });
}

// Genre filters
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

// Sort filters
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

// Reset
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

// Recommended
const recommendedMovies = movies.filter(function (movie) {
    return movie.rating > 6.5;
});

function renderRecommended() {
    if (!recommendedSlider) return;
    recommendedSlider.innerHTML = "";

    recommendedMovies.forEach(function (movie) {
        const card = document.createElement("div");
        card.classList.add("recommended-card");

        card.innerHTML = `
            <img src="${movie.poster}" onerror="this.onerror=null;this.src='/images/featured/poster-unavailable.svg'" alt="${movie.title}">
            <div class="recommended-overlay">
                <h3>${movie.title}</h3>
                <span>⭐ ${movie.rating}</span>
            </div>
        `;

        card.addEventListener("click", function () {
            window.location.href = "/Movie/Details?id=" + movie.id;
        });

        recommendedSlider.appendChild(card);
    });
}

let slidePosition = 0;

if (nextSlide && prevSlide && recommendedSlider) {
    nextSlide.addEventListener("click", function () {
        const width = 245;
        slidePosition -= width;
        const maxScroll = -(recommendedSlider.scrollWidth - recommendedSlider.parentElement.offsetWidth);
        if (slidePosition < maxScroll) slidePosition = maxScroll;
        recommendedSlider.style.transform = "translateX(" + slidePosition + "px)";
    });

    prevSlide.addEventListener("click", function () {
        const width = 245;
        slidePosition += width;
        if (slidePosition > 0) slidePosition = 0;
        recommendedSlider.style.transform = "translateX(" + slidePosition + "px)";
    });
}

resetVisibleCount();
renderMovies();
renderRecommended();
updateFilterBtnState();

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
        visibleCount += getPageSize();
        renderMovies(true);
    });
}

window.addEventListener("resize", function () {
    // keep at least current page size rule on resize after filter reset only
});
