let allStories = [];
let activeCategories = new Set();

// ============================
// INIT
// ============================
async function loadStories() {
    try {
        const res = await fetch('/data/stories.json');
        allStories = await res.json();

        generateCategoryFilters(allStories);
        filterAndRender(); // initial render
    } catch (err) {
        console.error('Error loading stories:', err);
    }
}

// ============================
// CATEGORY FILTERS
// ============================
function generateCategoryFilters(stories) {
    const container = document.getElementById('categoryFilters');

    // Get unique categories
    const categories = new Set();
    stories.forEach(story => {
        story.categories.forEach(cat => categories.add(cat));
    });

    container.innerHTML = '';

    categories.forEach(cat => {
        const label = document.createElement('label');
        label.className = "me-3";

        label.innerHTML = `
            <input type="checkbox" value="${cat}">
            ${formatCategory(cat)}
        `;

        const checkbox = label.querySelector('input');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                activeCategories.add(cat);
            } else {
                activeCategories.delete(cat);
            }

            filterAndRender();
        });

        container.appendChild(label);
    });
}

// ============================
// FILTER + SORT PIPELINE
// ============================
function filterAndRender() {
    let filtered = [...allStories];

    // SEARCH
    const search = document.getElementById('searchInput').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(story =>
            story.title.toLowerCase().includes(search) ||
            story.summary.toLowerCase().includes(search)
        );
    }

    // CATEGORY FILTER
    if (activeCategories.size > 0) {
        filtered = filtered.filter(story =>
            story.categories.some(cat => activeCategories.has(cat))
        );
    }

    // SORTING
    const sort = document.getElementById('sortSelect').value;

    if (sort === 'newest') {
        filtered.sort((a, b) => b.sort_year - a.sort_year);
    } else if (sort === 'oldest') {
        filtered.sort((a, b) => a.sort_year - b.sort_year);
    } else if (sort === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderStories(filtered);
}

// ============================
// RENDER STORIES
// ============================
function renderStories(stories) {
    const container = document.getElementById('storiesList');
    container.innerHTML = '';

    stories.forEach(story => {
        const div = document.createElement('div');
        div.className = 'stories-item row';

        div.innerHTML = `
            <div class="col-md-4 stories-thumbnail-div">
                <a href="${story.url}">
                    <img class="stories-thumbnail" src="${story.image}" alt="${story.title}">
                </a>
            </div>
            <div class="col-md-8">
                <h2 class="stories-heading">${story.title}</h2>
                <p class="stories-summary">${story.summary}...</p>
                <div class="stories-meta">${story.date}</div>
                <div class="stories-tags">
                    ${story.categories.map(c => `<span>${formatCategory(c)}</span>`).join('')}
                </div>
                <div class="stories-button">
                    <a class="btn btn-dark on-dark" href="${story.url}">
                        Read Story
                    </a>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    updateResultsCount(stories.length);
}

// ============================
// HELPERS
// ============================
function formatCategory(cat) {
    return cat
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function updateResultsCount(count) {
    const el = document.getElementById('resultsCount');
    el.innerText = `${count} stor${count === 1 ? 'y' : 'ies'} found`;
}

// ============================
// EVENT LISTENERS
// ============================

// Debounced search (smoother UX)
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterAndRender, 200);
});

// Sorting
document.getElementById('sortSelect')
    .addEventListener('change', filterAndRender);

// ============================
// START
// ============================
loadStories();