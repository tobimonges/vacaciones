import React, { useState, useEffect } from "react";
import "./Login.css"; //para reutilizar algunos estilos
import "./LoginForgotPassword.css";
import { useNavigate } from "react-router-dom";

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Activa la animación cuando se monta el componente
    setIsAnimating(true);
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
    navigate("/"); // Redirige al Login
  };

  return (
    <div className="loginFPContainer">
      <div className={`loginFPBox ${isAnimating ? "forgotPasswordBox" : ""}`}>
        <h2 className="headerFP">Recuperar Contraseña</h2>
        <form onSubmit={handleForgotPassword}>
          <div className="segundoFPContainer">
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
            <button type="submit" className="button">
              Correo de recuperación
            </button>
            <div className="forgotPassword">
              <a href="#" className="link" onClick={handleBackToLogin}>
                <img src="/avatar.svg" alt="Usuario" className="iconFP" />
              </a>
            </div>
          </div>
        </form>
        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;
