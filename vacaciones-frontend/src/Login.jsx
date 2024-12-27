import { useState } from "react";
import { useNavigate } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import "./Login.css";
import NuevaSolicitud from "./components/NuevaSolicitud";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function Login() {
  let navigate = useNavigate();
  const [usuario, setUsusario] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (usuario === "admin" && password === "1234") {
      alert("Inicio de sesión exitoso");
      navigate("/NuevaSolicitud");
      // navigate("/NuevaSolicitud"); // Redirige al usuario a la página NuevaSolicitud
    } else {
      alert("Credenciales incorrectas.");
    }
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
                onChange={(e) => setUsusario(e.target.value)}
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
        <div className="content">
          <Routes>
            <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
            {/* Puedes agregar más rutas aquí */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Login;