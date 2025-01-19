import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import { Link } from "react-router-dom";

const NavigationBar = ({ logo, onLogout }) => {
  const [weather, setWeather] = useState(null); // Estado para almacenar datos climáticos
  const [error, setError] = useState(false);   // Estado para manejar errores
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Asuncion&appid=241d2cc25697857a8c7ec11fced9f54a&units=metric'
        );
        if (!response.ok) {
          throw new Error("Error al obtener los datos del clima");
        }
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError(true);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="nav-container">
      <nav className="navigation-bar">
        {/* Botón de Atrás */}
        <div className="nav-button-container left">
          <button className="nav-button back-button" onClick={() => navigate(-1)}>
            <img src=".\angulo-izquierdo.svg" alt="Atrás" className="button-icon" />
          </button>
        </div>

        {/* Logo centrado */}
        <div className="nav-logo">
          <Link to="/home">
            <img src={logo || "/logo-white.svg"} alt="Logo" />
          </Link>
        </div>

        {/* Información Climática */}
        <div className="weather nav-button-container right">
          {error ? (
            <p>No se pudo obtener el clima. Inténtalo más tarde.</p>
          ) : weather ? (
            <div className="weather-info">
              
              {/* Temperatura en Celsius */}
              <p className="temperature">{weather.main.temp}°C</p>

              {/* Ícono del clima */}
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="Icono del clima"
                className="weather-icon"
              />
            </div>
          ) : (
            <p>Cargando clima...</p>
          )}
        </div>


        
      </nav>
    </div>
  );
};

export default NavigationBar;
