import express from "express";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const weatherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

app.get("/api/weather", weatherLimiter, async (req, res) => {
  const city = String(req.query.city || "").trim();

  if (!city) {
    return res.status(400).json({
      error: "Please enter a city name."
    });
  }

  if (city.length > 100) {
    return res.status(400).json({
      error: "City name is too long."
    });
  }

  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(500).json({
      error: "API key is missing. Check your .env file."
    });
  }

  try {
    const url = new URL(
      "https://api.openweathermap.org/data/2.5/weather"
    );

    url.searchParams.set("q", city);
    url.searchParams.set(
      "appid",
      process.env.OPENWEATHER_API_KEY
    );
    url.searchParams.set("units", "metric");

    const response = await fetch(url);

    if (response.status === 404) {
      return res.status(404).json({
        error: "City not found. Check the spelling and try again."
      });
    }

    if (response.status === 401) {
      return res.status(502).json({
        error: "Weather API key is invalid or not active."
      });
    }

    if (response.status === 429) {
      return res.status(503).json({
        error: "Weather service limit reached. Try again later."
      });
    }

    if (!response.ok) {
      return res.status(502).json({
        error: "Weather service is temporarily unavailable."
      });
    }

    const data = await response.json();

    res.json({
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    });
  } catch (error) {
    console.error("Weather request failed:", error.message);

    res.status(502).json({
      error: "Unable to connect to the weather service."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Cognifyz API Dashboard running at http://localhost:${PORT}`);
});
