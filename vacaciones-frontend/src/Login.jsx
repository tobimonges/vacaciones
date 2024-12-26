import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./Login.css";

function Login() {
  const handleLogin = (e) => {
    e.preventDefault();
    alert("Inicio de sesión exitoso");
    //aca tengo que redirigir al menu principal o ver a donde
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
                required
              />
            </div>
          </div>
          <button type="submit" className="button">
            Iniciar sesión
            <Link to="/NuevaSolicitud">Nueva solicitud</Link>
          </button>
          <div className="forgotPassword">
            <a href="#" className="link">
              Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
      <div className="content">
        <Routes>
          <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
          {/* Puedes agregar más rutas aquí */}
        </Routes>
      </div>
    </div>
  );
}
export default Login;
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./Login.css";

function Login() {
  const handleLogin = (e) => {
    e.preventDefault();
    alert("Inicio de sesión exitoso");
    //aca tengo que redirigir al menu principal o ver a donde
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
      </div>
    </div>
  );
}

export default Login;
