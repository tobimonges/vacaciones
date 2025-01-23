import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RestablecerContraseña.css";
import Logo from "./Logo";
import { useLocation } from "react-router-dom";
import "./Login.css"
import Preloader from "./Preloader";
import Logogiratorio from "./logogiratorio";

function RestablecerContraseña() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState(""); // Mensaje a mostrar
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showRestablecerBox, setShowRestablecerBox] = useState(false);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() =>{
    const timeout = setTimeout(() =>{
      setIsAnimating(false);
      setTimeout(()=> {
        setShowRestablecerBox(true);
      }, 200);
    }, 650);

    return () => clearTimeout(timeout);
  }, []);
  
  const handleRestablecer = async (e) => {
    e.preventDefault();

    if(newPassword !== confirmPassword){
      setError(true);
      setMensaje("Las contraseñas no coinciden");
      setTimeout(() => {
        setMensaje("");
        setError(false);
      }, 1900); 
      return;
    }

    try{
      const response = await
      fetch("http://localhost:8080/vacaciones/usuarios/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`, //token en el encabezado
        },
        body: new URLSearchParams({ newPassword }), //enviamos la nueva contraseña en el cuerpo (solo la nueva)
      });
      const data = await response.json();

      if(response.ok){
        setMensaje("Contraseña actualizada con éxito");
        setError(false);
        setTimeout(() => {
          setMensaje("");
          navigate("/");
        }, 2000); //cambiar el tiempo a menos que 3000 mas adelante
      } else {
        const errorMsg =
          data.message ||
          {
            400: "Formato de contraseña inválido.",
            401: "Token inválido o expirado.",
            404: "Usuario no encontrado.",
          }[response.status] ||
          "Error al actualizar la contraseña.";
        setError(true);
        setMensaje(errorMsg);
        setTimeout(() => {
          setMensaje("");
          setError(false);
        } , 2000);
      }
    } catch (error){
      console.error("Error al actualizar la contraseña", error);
      setMensaje("Error de red. Favor verifique su conexión a internet.");
      setError(true);
      setTimeout(() => {
        setMensaje("");
        setError(false);
      }, 2000);
    }
  };

  /*if (newPassword !== confirmPassword) {
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
  } */

  return (
    <div className="container containerRestablecerContraseña">
      <Logogiratorio duration={650} />

      {mensaje && (
    <div className={`mensajePopupp ${error ? "error" : "success"}`}>
      {mensaje}
    </div>
  )}
    {showRestablecerBox && (
      <div className={`restablecerBox cajaLogin ${error ? "error" : ""}`}>
        <Logo />
        <h2 className="headerrRC">Restablecer Contraseña</h2>
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
                  className="entradatextoRC"
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
                  className="entradatextoRC"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            
            <button type="submit" className="botoncitoRC">
              <span>Restablecer</span>
            </button>
        </form>

        <div className="backToLogin">
          <a href="/" className="linkRC"></a>
        </div>
      </div>
    )}
    </div>
  );
}
export default RestablecerContraseña;
