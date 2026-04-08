const searchInput = document.getElementById("searchInput");
const categoryCheckboxes = document.querySelectorAll("#categoryFilters input");
const sortSelect = document.getElementById("sortSelect");
const stories = Array.from(document.querySelectorAll(".stories-item"));

function updateStories() {

  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  let filtered = stories.filter(item => {
    const title = item.dataset.title.toLowerCase();
    const categories = item.dataset.category.split(" ");
    const search = searchInput.value.toLowerCase();

    const matchesSearch = title.includes(search);

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(cat => categories.includes(cat));

    return matchesSearch && matchesCategory;
  });

  // Sorting
  const sortValue = sortSelect.value;

  filtered.sort((a, b) => {
    if (sortValue === "title") {
      return a.dataset.title.localeCompare(b.dataset.title);
    }
    if (sortValue === "newest") {
      return b.dataset.date - a.dataset.date;
    }
    if (sortValue === "oldest") {
      return a.dataset.date - b.dataset.date;
    }
  });

  const container = document.getElementById("storiesList");
  container.innerHTML = "";

  filtered.forEach(item => container.appendChild(item));

  document.getElementById("resultsCount").innerText =
    `${filtered.length} stories found`;
}

searchInput.addEventListener("input", updateStories);
categoryCheckboxes.forEach(cb =>
  cb.addEventListener("change", updateStories)
);
sortSelect.addEventListener("change", updateStories);

// Initial load
updateStories();