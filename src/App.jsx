
import { useState } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const [city, setCity] = useState("Hyderabad");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const [alerts, setAlerts] = useState(
    JSON.parse(localStorage.getItem("weatherAlerts") || "[]")
  );
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const getWeather = async (cityName) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
      );
      const geoData = await geo.json();

      if (!geoData.results?.length) {
        throw new Error("City not found!");
      }

      const place = geoData.results[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );

      const data = await response.json();

      setWeather({
        city: place.name,
        country: place.country,
        temp: data.current.temperature_2m,
        feels: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        code: data.current.weather_code
      });

      setForecast(data.daily.time.map((date, i) => ({
        date,
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        code: data.daily.weather_code[i]
      })));

      setCity(place.name);
    } catch (err) {
      setError(err.message || "Weather loading failed.");
    }

    setLoading(false);
  };

  const condition = (code) => {
    if (code === 0) return "☀️ Clear Sky";
    if (code <= 3) return "🌤 Partly Cloudy";
    if (code <= 48) return "☁️ Foggy";
    if (code <= 67) return "🌧 Rainy";
    if (code <= 77) return "❄️ Snowy";
    if (code <= 82) return "🌦 Rain Showers";
    if (code <= 99) return "⛈ Thunderstorm";
    return "Weather";
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (signup) {
      if (users.some((u) => u.email === email)) {
        setError("Email already registered!");
        return;
      }

      const newUser = { name, email, password, role };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      setSignup(false);
      setError("Account created! Please login.");
      return;
    }

    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      setError("Invalid email or password!");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(found));
    setUser(found);

    if (found.role === "user") getWeather("Hyderabad");
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setWeather(null);
    setError("");
  };

  const saveAlert = (e) => {
    e.preventDefault();

    const updated = [
      ...alerts,
      {
        id: Date.now(),
        title: alertTitle,
        message: alertMessage,
        date: new Date().toLocaleDateString()
      }
    ];

    setAlerts(updated);
    localStorage.setItem("weatherAlerts", JSON.stringify(updated));
    setAlertTitle("");
    setAlertMessage("");
  };

  const deleteAlert = (id) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    localStorage.setItem("weatherAlerts", JSON.stringify(updated));
  };

  const addFavorite = () => {
    if (!weather || favorites.includes(weather.city)) return;

    const updated = [...favorites, weather.city];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const removeFavorite = (place) => {
    const updated = favorites.filter((c) => c !== place);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>☁ SkySense</h1>
          <p>BEYOND THE FORECAST</p>
          <h2>{signup ? "Create Account" : "Welcome Back"}</h2>

          <form onSubmit={handleAuth}>
            {signup && (
              <div className="input-group">
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {signup && (
              <div className="input-group">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin (Demo)</option>
                </select>
              </div>
            )}

            {error && <p className="form-message">{error}</p>}

            <button className="submit-btn" type="submit">
              {signup ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="switch-auth">
            {signup ? "Already registered?" : "New to SkySense?"}
            <button onClick={() => {
              setSignup(!signup);
              setError("");
            }}>
              {signup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>☁ SkySense</h2>
        <div>
          <span>{user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {user.role === "admin" ? (
          <>
            <h1>Admin Control Center</h1>
            <p>Manage users and weather safety notifications.</p>

            <div className="weather-grid">
              <div className="weather-card">
                <h3>👥 Registered Users</h3>
                <h1>{JSON.parse(localStorage.getItem("users") || "[]").length}</h1>
              </div>
              <div className="weather-card">
                <h3>🚨 Published Alerts</h3>
                <h1>{alerts.length}</h1>
              </div>
            </div>

            <div className="weather-card">
              <h2>🚨 Create Weather Alert</h2>
              <form className="alert-form" onSubmit={saveAlert}>
                <input
                  placeholder="Alert Title"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Enter alert details..."
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  required
                />
                <button type="submit">Publish Alert</button>
              </form>

              <h3>Published Alerts</h3>
              {alerts.map((a) => (
                <div className="alert-card" key={a.id}>
                  <h3>{a.title}</h3>
                  <p>{a.message}</p>
                  <small>{a.date}</small>
                  <button onClick={() => deleteAlert(a.id)}>Delete</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1>Weather Dashboard</h1>
            <p>Your personal live weather assistant.</p>

            <form className="city-search" onSubmit={(e) => {
              e.preventDefault();
              getWeather(city);
            }}>
              <input
                placeholder="Search any city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button disabled={loading}>
                {loading ? "Loading..." : "Search"}
              </button>
            </form>

            {error && <p className="weather-error">{error}</p>}

            {weather && (
              <>
                <div className="weather-card main-weather">
                  <h2>📍 {weather.city}, {weather.country}</h2>
                  <h1>{weather.temp}°C</h1>
                  <h3>{condition(weather.code)}</h3>
                  <p>Feels like {weather.feels}°C</p>
                  <button onClick={addFavorite}>⭐ Add to Favorites</button>
                </div>

                <div className="weather-grid">
                  <div className="weather-card">
                    <h3>💧 Humidity</h3>
                    <h2>{weather.humidity}%</h2>
                  </div>
                  <div className="weather-card">
                    <h3>🌬 Wind Speed</h3>
                    <h2>{weather.wind} km/h</h2>
                  </div>
                  <div className="weather-card">
                    <h3>🌡 Temperature</h3>
                    <h2>{weather.temp}°C</h2>
                  </div>
                </div>

                <div className="weather-card">
                  <h2>⭐ My Favorite Cities</h2>
                  {favorites.length === 0 ? (
                    <p>No favorites yet. Add a city above.</p>
                  ) : favorites.map((place) => (
                    <div className="favorite-item" key={place}>
                      <button onClick={() => getWeather(place)}>
                        📍 {place}
                      </button>
                      <button onClick={() => removeFavorite(place)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <h2 className="forecast-title">📅 5-Day Forecast</h2>
                <div className="weather-grid">
                  {forecast.map((day) => (
                    <div className="weather-card" key={day.date}>
                      <h3>{new Date(day.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric"
                      })}</h3>
                      <h2>{condition(day.code)}</h2>
                      <p>High: {day.max}°C</p>
                      <p>Low: {day.min}°C</p>
                    </div>
                  ))}
                </div>

                <div className="weather-card">
                  <h2>🚨 Weather Alerts</h2>
                  {alerts.length === 0 ? (
                    <p>No active alerts.</p>
                  ) : alerts.map((a) => (
                    <div className="alert-card" key={a.id}>
                      <h3>{a.title}</h3>
                      <p>{a.message}</p>
                      <small>{a.date}</small>
                    </div>
                  ))}
                </div>

                <div className="weather-card">
                  <h2>🌤 Smart Weather Tip</h2>
                  <p>
                    Check local weather conditions before outdoor activities.
                    Stay hydrated during hot weather and carry an umbrella
                    when rain is expected.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
