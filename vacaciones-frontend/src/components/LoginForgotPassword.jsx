import React, { useState, useEffect } from "react";
import "./Login.css"; //para reutilizar algunos estilos
import "./LoginForgotPassword.css";
import { useNavigate } from "react-router-dom";
import Preloader from "./Preloader";
import Logo from "./Logo";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState("");
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

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setMensajeError("Por favor ingresa un correo válido");
      clearMessageAfterDelay();
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/vacaciones/usuarios/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email }),
      });

      if (response.ok) {
        setMensaje("Correo de recuperación enviado!");
      } else if (response.status === 404) {
        const data = await response.json();
        setMensajeError(data.message || "El correo no se encuentra registrado.");
      } else if (response.status === 429) {
        setMensajeError("Has excedido el límite de solicitudes. Intenta más tarde.");
      } else if (response.status === 400) {
        setMensajeError("Correo inválido. Por favor verifica.");
      } else {
        setMensajeError("Hubo un problema, intente nuevamente.");
      }
    } catch (error) {
      setMensajeError("Error de red. Intenta nuevamente.");
    }
    clearMessageAfterDelay(); //para borrar los mensajes
  };
  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMensaje("");
      setMensajeError("");
    }, 2000);
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
    <div className="container loginFPContainer">
      <Preloader duration={650} />
      {mensaje && (
        <div className="mensajeContainer">
          <p className="mensaje">{mensaje}</p>
        </div>
      )}
      {mensajeError && (
        <div className="SetMensajeError">
          <p>{mensajeError}</p>
        </div>
      )}
      <div
        className={`loginFPBox ${isAnimating ? "forgotPasswordBox" : ""} ${isExiting ? "forgotPasswordExiting" : ""
          }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="backButtonWrapper">
          <button className="backToLoginButton" onClick={handleBackToLogin}>
            <img src=".\angulo-pequeno-izquierdo.svg" alt="Volver" />
          </button>
        </div>
        <Logo />
        <h2 className="headerFP">Recuperar Contraseña</h2>
        <div className="boxTextWrapper">
          <p className="boxText">Ingrese su correo para continuar</p>
        </div>
        <form className="formClass" onSubmit={handleForgotPassword}>
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
            Enviar
          </button>
          <div className="forgotPassword">

          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
