import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const handleLogin = (e) => {
    e.preventDefault();
    alert("Inicio de sesión exitoso");
    //aca tengo que redirigir al menu principal o ver a donde
  };

  return (
    <div className="container">
      <div className="loginBox">
        <h2 className="header">Sistema de Vacaciones</h2>
        <form onSubmit={handleLogin}>
          <div className="inputGroup">
            <img src="/avatar.svg" alt="Usuario" className="icon" />
            <input
              type="text"
              placeholder="Usuario"
              className="input"
              required
            />
          </div>
          <div className="inputGroup">
            <img
              src="/cerrar-con-llave.svg"
              alt="Contraseña"
              className="icon"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="input"
              required
            />
          </div>
          <button type="submit" className="button">
            Iniciar sesión
          </button>
          <div className="forgotPassword">
            <a href="#" className="link">
              Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
