import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreaEquipo.css"; // Updated CSS file
import axios from "axios";

import Preloader from "./Preloader";

function CreaCargo() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [roles, setRoles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const boxForm = document.querySelector(".createBox2");
    if (boxForm) {
      boxForm.classList.add("cajaLogin");
    }

    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/vacaciones/roles/listar-roles", // Replace with actual endpoint
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoles(response.data); // Assuming response.data is the list of roles
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Error al cargar los roles.");
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoCargo = {
      nombre: nombre,
    };

    try {
      const token = localStorage.getItem("token");
      const url = "http://localhost:8080/vacaciones/crea/cargos"; // Endpoint for creating cargos
      await axios.post(url, nuevoCargo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Cargo creado exitosamente");
      navigate("/Home");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al crear el cargo.");
      }
    }
  };

  return (
    <div className="containerLogin2">
      <Preloader duration={650} />
      <div
        className={`createBox2 ${isAnimating ? "LoginSlide" : ""} ${
          error ? "datosIncorrectos" : ""
        }`}
      >
        <h2 className="headerCreate2">Crear Cargo</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputGroup2">
            <div className="iconWrap2">
            <img src="/circulo-de-usuario (2).svg" alt="Usuario" className="icon" />
              <input
                type="text"
                placeholder="Nombre de Cargo"
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

export default CreaCargo;
