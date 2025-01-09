import React, { useState, useEffect } from "react";
import "./Login.css"; //para reutilizar algunos estilos
import "./LoginForgotPassword.css";
import { useNavigate } from "react-router-dom";
import Preloader from "./Preloader";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  

  useEffect(() => {
    // Activa la animación cuando se monta el componente
    const timeout = setTimeout(() => {
      setIsAnimating(true);
    }, 655); // 600 milisegundos = 0.6 segundos
  
    // Limpia el timeout si el componente se desmonta antes de que se ejecute
    return () => clearTimeout(timeout);
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      //llamada a API para correo de recuperacion
      // await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
      setMensaje("Correo de Recuperación enviado!");
    } catch (error) {
      console.error("Error al enviar correo de recuperación", error);
      setMensaje("Hubo un problema, intente nuevamente");
    }
  };
  const handleBackToLogin = () => {
    setIsExiting(true);
  };
  const handleAnimationEnd = () => {
    if (isExiting) {
      navigate("/"); // Redirigir al login una vez que la animación termine
    }
  };

  return (
    <div className="loginFPContainer">
      <Preloader duration={650} />
      {mensaje && (
        <div className="mensajeContainer">
          <p className="mensaje">{mensaje}</p>
        </div>
      )}
      <div
        className={`loginFPBox ${isAnimating ? "forgotPasswordBox" : ""} ${
          isExiting ? "forgotPasswordExiting" : ""
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <h2 className="headerFP">Recuperar Contraseña</h2>
        <form onSubmit={handleForgotPassword}>
          <div className="inputFPGroup">
            <div className="iconFPWrap">
              <input
                type="email"
                placeholder="Correo electrónico"
                className="inputFP"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="buttonFPC">
            Correo de recuperación
          </button>
          <div className="forgotPassword">
            <div className="iconFPWrapini" onClick={handleBackToLogin}>
              <img src="/avatar.svg" alt="Usuario" className="iconFP" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
