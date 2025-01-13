import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Solicitud.css";

import Logo from "./Logo";
import Preloader from "./Preloader";

export default function EquipoDetalle() {
  const { id } = useParams(); // ID del usuario
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]); // Lista de equipos
  const [error, setError] = useState(""); // Error handling

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado. Por favor, inicia sesión.");
          navigate("/");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/vacaciones/usuario/${id}/equipos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setEquipos(response.data); // Guardar los equipos obtenidos
        } else {
          setError("No se pudieron obtener los equipos.");
        }
      } catch (error) {
        console.error("Error obteniendo los equipos:", error);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchEquipos();
  }, [id, navigate]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (equipos.length === 0) {
    return <p>No se encontraron equipos para este usuario.</p>;
  }

  return (
    <div className="container-solicitudes">
      <Preloader duration={650} />
      <Logo />
      <h4>Equipos del Usuario</h4>
      <ul>
        {equipos.map((equipo) => (
          <li key={equipo.id}>
            <p>
              <strong>ID del Equipo:</strong> {equipo.id}
            </p>
            <p>
              <strong>Nombre:</strong> {equipo.nombre}
            </p>
          </li>
        ))}
      </ul>
      <button className="volver-home" onClick={() => navigate("/Home")}>
        Volver al Home
      </button>
    </div>
  );
}
