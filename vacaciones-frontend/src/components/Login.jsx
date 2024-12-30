import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Home from "./Home";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: usuario, // El backend espera "email"
          password: password, // El backend espera "password"
        }
      );
      console.log("Respuesta de la API:", respuesta); // Agregar esto para depurar

      // Si el login es exitoso, almacenar el token
      const token = respuesta.data; // El token viene en la respuesta
      localStorage.setItem("token", token); // Guardar el token en localStorage
      alert("Inicio de sesión exitoso");
      navigate("/Home"); // Redirigir al usuario
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      setUsuario("");
      setPassword("");
    }

    /*   const handleLogout = () => {
      localStorage.removeItem("isAuthenticated"); // Eliminar la sesión
      alert("Has cerrado sesión");
      navigate("/", { replace: true }); // Redirige al login
    }; */
  };
  return (
    <div className="container">
      <div className="loginBox">
        <h2 className="header">Sistema de Vacaciones</h2>
        <form onSubmit={handleLogin} action="login" method="post">
          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/avatar.svg" alt="Usuario" className="icon" />
              <input
                type="text"
                placeholder="Usuario"
                className="input"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/cerrar-con-llave.svg"
                alt="Contraseña"
                className="icon"
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="input"
                value={password} // Vincula el valor con el estado
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
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
        <div className="content"></div>
      </div>
    </div>
  );
}

export default Login;
