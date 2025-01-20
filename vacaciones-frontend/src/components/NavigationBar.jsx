import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import axios from "axios";
import { getUsuarioId, isTokenValid } from "./authUtils";

const Navbar = () => {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const usuarioId = getUsuarioId();
      try {
        const token = localStorage.getItem("token");

        const [userDataResponse] = await Promise.all([
          axios.get(`http://localhost:8080/vacaciones/buscarid/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/vacaciones/usuario/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const { nombre } = userDataResponse.data;
        setUserName(nombre);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError(true);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return userName;
};

const NavigationBar = ({ logo, onLogout }) => {
  const [userName, setUserName] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const usuarioId = getUsuarioId();
      try {
        const token = localStorage.getItem("token");

        const [userDataResponse] = await Promise.all([
          axios.get(`http://localhost:8080/vacaciones/buscarid/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/vacaciones/usuario/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const { nombre } = userDataResponse.data;
        setUserName(nombre);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError(true);
      }
    };

    fetchData();
  }, [navigate]);

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
        <div className="nav-button-container left">
          <button className="nav-button back-button" onClick={() => navigate(-1)}>
            <img src=".\angulo-izquierdo.svg" alt="Atrás" className="button-icon" />
          </button>
        </div>

        <div className="nav-logo">
          <h1 className="saludo">Hola, {userName || "Usuario"}!</h1>
        </div>

        <div className="weather nav-button-container right">
          {error ? (
            <p>No se pudo obtener el clima. Inténtalo más tarde.</p>
          ) : weather ? (
            <div className="weather-info">
              <p className="temperature">{weather.main.temp}°C</p>
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