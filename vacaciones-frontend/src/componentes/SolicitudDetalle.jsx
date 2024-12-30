import React, { useEffect, useState } from "react";
import { useSolicitud } from "./SolicitudContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SolicitudDetalle() {
  const { setSolicitud } = useSolicitud(); // Solo usamos el setter para actualizar la solicitud seleccionada
  const [solicitudes, setSolicitudes] = useState([]); // Estado para almacenar la lista de solicitudes
  const navigate = useNavigate();

  // Obtener todas las solicitudes del usuario al cargar el componente
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await axios.get("http://localhost:8080/vacaciones/solicitudes"); // Ajusta el endpoint según tu backend
        if (response.status === 200) {
          setSolicitudes(response.data);
        } else {
          console.error("No se pudieron obtener las solicitudes.");
        }
      } catch (error) {
        console.error("Error obteniendo las solicitudes:", error);
      }
    };

    fetchSolicitudes();
  }, []);

  const handleEditar = (solicitud) => {
    setSolicitud(solicitud); // Actualiza el contexto con la solicitud seleccionada
    navigate("/"); // Redirigir al formulario principal
  };

  const handleEliminar = async (solicitudId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/vacaciones/solicitudes/${solicitudId}`);
      if (response.status === 200) {
        setSolicitudes((prev) => prev.filter((s) => s.id !== solicitudId)); // Elimina la solicitud de la lista local
        alert("Solicitud eliminada.");
      } else {
        alert("Hubo un problema al eliminar la solicitud.");
      }
    } catch (error) {
      console.error("Error eliminando la solicitud:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  const handleConfirmar = async (solicitud) => {
    try {
      const response = await axios.put(`http://localhost:8080/vacaciones/solicitudes/${solicitud.id}`, solicitud);
      if (response.status === 200) {
        alert("Solicitud confirmada.");
      } else {
        alert("No se pudo confirmar la solicitud.");
      }
    } catch (error) {
      console.error("Error confirmando la solicitud:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="container">
      <h4>Mis Solicitudes</h4>
      {solicitudes.length > 0 ? (
        solicitudes.map((solicitud) => (
          <div key={solicitud.id} className="DatePicker">
            <h5>Solicitud N°{solicitud.id}</h5>
            <p>Fecha de inicio: {solicitud.fechaInicio || "No definida"}</p>
            <p>Fecha de fin: {solicitud.fechaFin || "No definida"}</p>
            <button onClick={() => handleEditar(solicitud)}>Editar</button>
            <button onClick={() => handleConfirmar(solicitud)}>OK</button>
            <button onClick={() => handleEliminar(solicitud.id)}>Eliminar</button>
          </div>
        ))
      ) : (
        <p>No tienes solicitudes registradas.</p>
      )}
    </div>
  );
}
