import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RestablecerContraseña.css";
import Logo from "./Logo";

import Preloader from "./Preloader";

function RestablecerContraseña() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);

  const handleRestablecer = async (e) => {
    e.preventDefault();
  };

  if (newPassword !== confirmPassword) {
    setError(true);
    setTimeout(() => setError(false), 3000);
    return;
  }

  try {
    //llamada a API para restablecer contraseña
    //const response = await axios.post("http://localhost:8080/vacaciones/usuarios/reset-password", { newPassword });

    //simulacion de respuesta exitosa
    console.log("Contraseña restablecida con exito!");

    //Redirigir al Login
    navigate("/");
  } catch (error) {
    console.error("Error al restablecer la contraseña", error);
    setError(true);
    setTimeout(() => setError(false), 3000);
  }

  return (
    <div className="containerRestablecerContraseña">
      <Preloader duration={650} />
      <div className={`restablecerBox ${error ? "error" : ""}`}>
        <Logo />
        <h2 className="headerRC">Restablecer Contraseña</h2>
        <form onSubmit={handleRestablecer} method="post">
            <div className="inputRCGroup">
              <div className="iconRCWrap">
                <img
                  src="/cerrar-con-llave.svg"
                  alt="Contraseña"
                  className="iconRC"
                />
                <input
                  type="password"
                  placeholder="Nueva Contraseña"
                  className="inputRC"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="inputRCGroup1">
              <div className="iconRCWrap1">
                <img
                  src="/cerrar-con-llave.svg"
                  alt="Confirmar Contraseña"
                  className="iconRC1"
                />
                <input
                  type="password"
                  placeholder="Confirmar Contraseña"
                  className="inputRC"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="error-message">Las Contraseñas no coinciden</p>
            )}

            <button type="submit" className="buttonRC">
              Restablecer
            </button>
        </form>

        <div className="backToLogin">
          <div href="/" className="linkRC"></div>
        </div>
      </div>
    </div>
  );
}
export default RestablecerContraseña;
