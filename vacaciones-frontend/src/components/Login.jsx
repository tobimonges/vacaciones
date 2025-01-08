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
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    // Esto activa la animación inicial cuando se carga la página
    const loginBox = document.querySelector(".loginBox");
    loginBox.classList.add("cajaLogin");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(false); // Resetear el estado de error para que si se pone varias veces mal siga animando
    try {
      const respuesta = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: usuario, // El backend espera "email"
          password: password, // El backend espera "password"
        }
      );

      if (respuesta.data.success) {
        //seteo token y guardo token
        const token = respuesta.data;
        localStorage.setItem("token", token);

        //Activo animación de entrada
        /*  setIsAnimating(true);
      setTimeout(() => {
        navigate("/Home");
      }, 200); 
      */
      }
      // console.log("Respuesta de la API:", respuesta); // Agregar esto para depurar

     
      // alert("Inicio de sesión exitoso");
      setIsAnimating(true);
      setTimeout(() => {
        navigate("/Home");
      }, 200);
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      setUsuario("");
      setPassword("");
      setError(true); // Mostrar el mensaje de error
      setShowError(true); // Mostrar el mensaje de error
      setTimeout(() => setShowError(false), 2000);

      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Credenciales inválidas. Verifica tu email y contraseña.");
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
    loginBox.classList.add("LoginSlide");
    setTimeout(() => {
      navigate("/forgotPassword"); //Cambia a la pantalla de recuperacion de contraseña
    }, 550);
  };
  if (showForgotPassword) {
    return (
      <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
    );
  }
  return (
    <div className="containerLogin">
      <div
        className={`loginBox ${isAnimating ? "LoginAnim" : ""} ${
          error ? "datosIncorrectos" : ""
        }`}
      >
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
            <a
              href="#"
              className="link"
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
            >
              Olvidaste tu contraseña?
            </a>
          </div>
        </form>
        <div className="content"></div>
      </div>
      {/* Error Message Popup */}
    {showError && (
      <div className={`errorPopup ${error ? 'error' : ''}`}>
        {errorMessage}
      </div>
    )}
    </div>
  );
}

export default Login;
