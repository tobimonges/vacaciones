import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Home from "./Home";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import Logo from "./Logo";
import Preloader from "./Preloader";
import Logogiratorio from "./logogiratorio";

function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showLoginBox, setShowLoginBox] = useState(false);
  const [isLoginBoxVisible, setIsLoginBoxVisible] = useState(false); // Nuevo estado para controlar la visibilidad

  
  useEffect(() => {
    // Esto activa la animación inicial cuando se carga la página
    const timeout = setTimeout(() => {
      setIsLoginBoxVisible(true);
    }, 900); // 900 milisegundos = 0.9 segundos

    // Limpiar el timeout si el componente se desmonta antes de que se ejecute
    return () => clearTimeout(timeout);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(false); // Ocultar el mensaje de error
    setShowError(false); // Ocultar el popup de error 


    try {
      const respuesta = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          usuario: usuario,
          password: password,
        }
      );
      const token = respuesta.data;
      localStorage.setItem("token", token);
      // alert("Inicio de sesión exitoso");
      setIsAnimating(true);
      setTimeout(() => {
        navigate("/Home");
      }, 200);

    } catch (error) {
      console.log(error.response);
      if(error.response.data.message === "Redirigir a cambio de contraseña") {
        setErrorMessage("Debes cambiar tu contraseña antes de continuar.");
        setIsAnimating(true); //agregado de animacion para ir a reset-password
        setTimeout(() => {
          navigate(error.response.data.redirect);
        }, 2500);
        return;
      }
      console.error("Error al iniciar sesión", error);
      setPassword("");
      setError(true);
      setShowError(true);
      //  setTimeout(() => setError(false), 2100);
    
      setTimeout(() => setShowError(false), 2000);

      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage(
            "Credenciales inválidas. Verifica tu email y contraseña."
          );
        } else if (error.response.status === 500) {
          setErrorMessage("Error del servidor. Inténtalo más tarde.");
        } else {
          setErrorMessage("Error inesperado. Por favor, intenta de nuevo.");
        }
      } else {
        setErrorMessage("Error de red. Por favor, verifica tu conexión.");
      }
    }

    /*   const handleLogout = () => {
      localStorage.removeItem("isAuthenticated"); // Eliminar la sesión
      alert("Has cerrado sesión");
      navigate("/", { replace: true }); // Redirige al login
    }; */
  };
  const handleForgotPassword = () => {
    const loginBox = document.querySelector(".loginBox");
    loginBox.classList.add("LoginAnim");
    setTimeout(() => {
      navigate("/forgotPassword"); //Cambia a la pantalla de recuperacion de contraseña
    }, 220);
  };
  if (showForgotPassword) {
    return (
      <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
    );
  }
  return (
    <div className="container containerLogin">
    <Logogiratorio duration={650} />
    {isLoginBoxVisible && (
      <div
      className={`loginBox cajaLogin ${
        error ? "datosIncorrectos" : "" // Aplicar la clase datosIncorrectos solo cuando error sea true
      }`}>
        <Logo />
        <h2 className="header">Sistema de Vacaciones</h2>
        <form onSubmit={handleLogin} className="loginForm">
          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/avatar.svg" alt="Usuario" className="icon" />
              <input
                type="text"
                placeholder="Usuario"
                className="inpuutLogin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/cerrar-con-llave.svg" alt="Contraseña" className="icon" />
              <input
                type="password"
                placeholder="Contraseña"
                className="inpuutLogin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="forgotPassword">
              <a
                href="#"
                className="linkLogin"
                onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          <button type="submit" className="buttonLogin">
            <span>Iniciar sesión</span>
          </button>
        </form>
      </div>
    )}
    {showError && (
      <div className={`errorPopup ${error ? "error" : ""}`}>
        {errorMessage}
      </div>
    )}
  </div>
);
}

export default Login;
