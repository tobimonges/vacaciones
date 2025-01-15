import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreaEquipo.css";
import axios from "axios";

import Preloader from "./Preloader";

function CreaEquipo() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [roles, setRoles] = useState([]); // State to store fetched roles
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(false);
  

  useEffect(() => {
    // Activates the initial animation when the page loads
    const createEquipoBox = document.querySelector(".createBox2"); // Use the correct class name
    if (createEquipoBox) {
      createEquipoBox.classList.add("cajaLogin");
    }
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/vacaciones/roles/listar-roles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoles(response.data); // Assuming the response is a list of objects
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Error loading roles.");
      }
    };
  
    fetchRoles();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoEquipo = {
      nombre: nombre,
      
    };

    try {
      const token = localStorage.getItem("token"); // Obtener token de autenticación
      console.log(token);
      const url = "http://localhost:8080/api/equipos"; // URL para la creación del nuevo equipo
      await axios.post(url, nuevoEquipo, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
        },
      });
      alert("Equipo creado exitosamente");
      navigate("/Home"); // Redirigir a la página principal u otra
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message); // Mostrar mensaje de error del servidor
      } else {
        setError("Error al crear el equipo.");
      }
    }
  };

  return (
    <div className="containerLogin2">
      <Preloader duration={650} />
      <div
        className={`createBox2 ${isAnimating ? "LoginAnim" : ""} ${
          error ? "datosIncorrectos" : ""
        }`}
      >
        <h2 className="headerCreate2">Crear Equipo</h2>
        <form onSubmit={handleSubmit} action="login" method="post">
          <div className="inputGroup2">
            <div className="iconWrap2">
            <img src="/mapa-del-sitio (1).svg" alt="Rol" className="icon" />
              <input
                type="text"
                placeholder="Nombre de Equipo"
                className="inputCreate2"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="button">
            Crear
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreaEquipo;
