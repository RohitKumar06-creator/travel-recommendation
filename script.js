
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetBtn");
const results = document.getElementById("results");
const searchStatus = document.getElementById("searchStatus");

let travelData = null;

async function loadTravelData() {
  try {
    const response = await fetch("./travel_recommendation_api.json");

    if (!response.ok) {
      throw new Error("Failed to load travel data.");
    }

    travelData = await response.json();
    displayFeaturedDestinations();
  } catch (error) {
    console.error("Error loading data:", error);
    searchStatus.textContent = "Unable to load destinations.";
    results.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load travel data</h3>
        <p>Run this project using Live Server or GitHub Pages.</p>
      </div>
    `;
  }
}

function createDestinationCard(destination) {
  const card = document.createElement("article");
  card.className = "destination-card";

  const image = document.createElement("img");
  image.src = destination.imageUrl;
  image.alt = destination.name;
  image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = destination.category;

  const title = document.createElement("h3");
  title.textContent = destination.name;

  const description = document.createElement("p");
  description.textContent = destination.description;

  body.append(category, title, description);
  card.append(image, body);

  return card;
}

function displayDestinations(destinations) {
  results.replaceChildren();

  if (destinations.length === 0) {
    results.innerHTML = `
      <div class="empty-state">
        <h3>No destinations found</h3>
        <p>Try searching for beach, temple, Japan,
        Australia, or Brazil.</p>
      </div>
    `;
    return;
  }

  destinations.forEach(destination => {
    results.appendChild(createDestinationCard(destination));
  });
}

function getAllDestinations() {
  if (!travelData) return [];

  const destinations = [];

  travelData.beaches.forEach(item => {
    destinations.push({
      ...item,
      category: "Beach"
    });
  });

  travelData.temples.forEach(item => {
    destinations.push({
      ...item,
      category: "Temple"
    });
  });

  travelData.countries.forEach(country => {
    country.cities.forEach(city => {
      destinations.push({
        ...city,
        country: country.name,
        category: country.name
      });
    });
  });

  return destinations;
}

function displayFeaturedDestinations() {
  const destinations = getAllDestinations();

  searchStatus.textContent =
    "Explore our featured destinations below.";

  displayDestinations(destinations);
}

function searchDestinations(keyword) {
  if (!travelData) {
    searchStatus.textContent = "Travel data is still loading.";
    return;
  }

  const query = keyword.trim().toLowerCase();

  if (!query) {
    displayFeaturedDestinations();
    return;
  }

  // Recognize both singular and plural category keywords.
  const beachKeywords = ["beach", "beaches"];
  const templeKeywords = ["temple", "temples"];

  let matches = [];

  if (beachKeywords.includes(query)) {
    matches = getAllDestinations().filter(
      destination => destination.category === "Beach"
    );
  } else if (templeKeywords.includes(query)) {
    matches = getAllDestinations().filter(
      destination => destination.category === "Temple"
    );
  } else {
    matches = getAllDestinations().filter(destination => {
      const searchableText = [
        destination.name,
        destination.category,
        destination.country || "",
        destination.description
      ].join(" ").toLowerCase();

      return searchableText.includes(query);
    });
  }

  searchStatus.textContent =
    `${matches.length} recommendation(s) found for "${keyword}".`;

  displayDestinations(matches);

  document.getElementById("recommendations")
    .scrollIntoView({ behavior: "smooth" });
}

if (searchForm) {
  searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchDestinations(searchInput.value);
  });

  resetBtn.addEventListener("click", function() {
    searchInput.value = "";
    displayFeaturedDestinations();
  });

  document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", function() {
      const keyword = button.dataset.search;
      searchInput.value = keyword;
      searchDestinations(keyword);
    });
  });

  loadTravelData();
}
