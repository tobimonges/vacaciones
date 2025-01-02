import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Solicitud.css";

export default function SolicitudDetalle() {
  const { id } = useParams(); // ID del usuario
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]); // Lista de solicitudes
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado. Por favor, inicia sesión.");
          navigate("/");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/vacaciones/usuario/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setSolicitudes(response.data); // Guardar las solicitudes obtenidas
        } else {
          setError("No se pudieron obtener las solicitudes.");
        }
      } catch (error) {
        console.error("Error obteniendo las solicitudes:", error);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchSolicitudes();
  }, [id, navigate]);

  const handleEditar = (solicitudId) => {
    navigate(`/editar-solicitud/${solicitudId}`);
  };

  const handleEliminar = async (solicitudId) => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar esta solicitud?"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/vacaciones/solicitudes/${solicitudId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Actualizar la lista de solicitudes
      setSolicitudes((prev) =>
        prev.filter((solicitud) => solicitud.id !== solicitudId)
      );
      alert("Solicitud eliminada correctamente.");
    } catch (error) {
      console.error("Error eliminando la solicitud:", error);
      alert("No se pudo eliminar la solicitud.");
    }
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (solicitudes.length === 0) {
    return <p>No se encontraron solicitudes para este usuario.</p>;
  }

  return (
    <div className="container">
      <h4>Solicitudes del Usuario N°{id}</h4>
      <ul>
        {solicitudes.map((solicitud) => (
          <li key={solicitud.id}>
            <p>Solicitud N°{solicitud.id}</p>
            <p>Fecha de inicio: {solicitud.fechaInicio}</p>
            <p>Fecha de fin: {solicitud.fechaFin}</p>
            <p>Estado: {solicitud.estado ? "Confirmada" : "Pendiente"}</p>
            <div className="buttons">
              <button onClick={() => handleEditar(solicitud.id)}>Editar</button>
              <button
                className="delete"
                onClick={() => handleEliminar(solicitud.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button className="volver-home" onClick={() => navigate("/Home")}>Volver al Home</button>
    </div>
  );
}
