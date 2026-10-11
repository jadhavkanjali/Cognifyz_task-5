const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const searchButton = document.getElementById("search-button");
const message = document.getElementById("message");
const result = document.getElementById("weather-result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showMessage("Please enter a city name.", true);
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Loading...";
  result.hidden = true;
  showMessage("Fetching live weather data...");

  try {
    const response = await fetch(
      `/api/weather?city=${encodeURIComponent(city)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to fetch weather.");
    }

    document.getElementById("location").textContent =
      `${data.city}, ${data.country}`;

    document.getElementById("description").textContent =
      data.description;

    document.getElementById("temperature").textContent =
      data.temperature;

    document.getElementById("feels-like").textContent =
      data.feelsLike;

    document.getElementById("humidity").textContent =
      `${data.humidity}%`;

    document.getElementById("wind").textContent =
      `${data.windSpeed} m/s`;

    const icon = document.getElementById("weather-icon");
    icon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    icon.alt = data.description;

    result.hidden = false;
    showMessage("Weather data loaded successfully.");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}
