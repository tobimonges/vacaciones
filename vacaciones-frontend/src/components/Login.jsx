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

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    //prueba
    const usuarioPrueba = "admin";
    const passwordPrueba = "1234";

    if (usuario === usuarioPrueba && password === passwordPrueba) {
      alert("Inicio de sesión exitoso con usuario de prueba");
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("id_usuario", "1"); // ID ficticio para el usuario de prueba
      navigate("/Home", { replace: true });
      return;
    }
    alert("Credenciales Incorrectas. Intente de nuevo.");
    setUsuario("");
    setPassword("");
    localStorage.setItem("isAuthenticated", "false");
    //prueba
    /* try {
      const respuesta = await axios.post("http://localhost:5173/login", {
        usuario,
        password,
      });

      if (respuesta.data.success) {
        alert("Inicio de sesión exitoso");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("id_usuario", respuesta.data.id_usuario);
        navigate("/NuevaSolicitud", { replace: true });
      } else {
        alert("Credenciales incorrectas.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
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
