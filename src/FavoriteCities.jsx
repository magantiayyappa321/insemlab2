
import { useState } from "react";

function FavoriteCities({ onSelectCity }) {
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const removeFavorite = (city) => {
    const updated = favorites.filter((item) => item !== city);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="weather-card">
      <h2>⭐ My Favorite Cities</h2>

      {favorites.length === 0 ? (
        <p>No favorite cities added yet.</p>
      ) : (
        favorites.map((city) => (
          <div key={city} className="favorite-item">
            <button onClick={() => onSelectCity(city)}>
              📍 {city}
            </button>

            <button onClick={() => removeFavorite(city)}>
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default FavoriteCities;
