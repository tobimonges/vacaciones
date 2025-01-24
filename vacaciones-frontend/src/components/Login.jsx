import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import Logo from "./Logo";
import Logogiratorio from "./logogiratorio";

function Login() {
  const navigate = useNavigate();

  // Estados principales
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginBoxVisible, setIsLoginBoxVisible] = useState(false);

  // Estados para el toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "success" o "error"

  // Referencia para cancelar/renovar el timeout de los toasts
  const toastTimerRef = useRef(null);

  // Referencia a la caja de login
  const loginBoxRef = useRef(null);

  // Efecto para mostrar la caja de login tras 0.9s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoginBoxVisible(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Función auxiliar para mostrar toast 2s (con cancelación de timeouts previos)
  const showToast = (message, type = "error", callback) => {
    // Cancelamos el timeout previo, si lo hubiera
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    // Mostramos el nuevo toast
    setToastMessage(message);
    setToastType(type);

    // Iniciamos un nuevo temporizador
    toastTimerRef.current = setTimeout(() => {
      // Ocultamos el toast
      setToastMessage("");
      setToastType("");
      toastTimerRef.current = null;

      // Si hay callback (ej. para navegar), lo ejecutamos aquí
      if (callback) callback();
    }, 2000);
  };

  // Manejo de submit (login)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post("http://localhost:8080/api/auth/login", {
        usuario,
        password,
      });
      const token = respuesta.data;
      localStorage.setItem("token", token);

      // Éxito: mostramos toast success, navegamos después de 2s
      showToast("¡Login exitoso!", "success", () => {
        navigate("/Home");
      });

    } catch (err) {
      // Caso especial: "Redirigir a cambio de contraseña"
      if (err.response?.data?.message === "Redirigir a cambio de contraseña") {
        const redirectUrl = err.response.data.redirect;
        showToast("Debes cambiar tu contraseña.", "error", () => {
          navigate(redirectUrl);
        });
        return;
      }

      // Errores comunes
      if (err.response) {
        if (err.response.status === 401) {
          showToast("Credenciales inválidas. Verifica tu usuario y contraseña.", "error");
        } else if (err.response.status === 500) {
          showToast("Error del servidor. Inténtalo más tarde.", "error");
        } else {
          showToast("Error inesperado. Intenta de nuevo.", "error");
        }
      } else {
        showToast("Error de red. Verifica tu conexión.", "error");
      }
    }
  };

  // Manejo de "¿Olvidaste tu contraseña?"
  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgotPassword");
  };

  return (
      <div className="container containerLogin">
        {/* Componente animado, si lo deseas */}
        <Logogiratorio duration={650} />

        {/* TOAST (popup) */}
        {toastMessage && (
            <div className={`toast ${toastType === "success" ? "toast-success" : "toast-error"}`}>
              {toastMessage}
            </div>
        )}

        {/* Caja de login */}
        {isLoginBoxVisible && (
            <div ref={loginBoxRef} className="loginBox cajaLogin">
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
                    <a href="#" className="linkLogin" onClick={handleForgotPassword}>
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
      </div>
  );
}

export default Login;