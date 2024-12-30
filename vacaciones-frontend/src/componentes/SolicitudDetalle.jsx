import React, { useEffect } from "react";
import { useSolicitud } from "./SolicitudContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SolicitudDetalle() {
  const { solicitud, setSolicitud } = useSolicitud();
  const navigate = useNavigate();

  // Obtener los detalles de una solicitud específica al cargar el componente
  useEffect(() => {
    const fetchSolicitud = async () => {
      if (!solicitud?.id) {
        console.error("El ID de la solicitud no está definido.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/vacaciones/${solicitud.id}`);
        if (response.status === 200) {
          setSolicitud(response.data);
        } else {
          console.error("No se pudo obtener la solicitud.");
        }
      } catch (error) {
        console.error("Error obteniendo la solicitud:", error);
      }
    };

    fetchSolicitud();
  }, [solicitud?.id, setSolicitud]);

  const handleEditar = () => {
    navigate("/"); // Redirigir al formulario principal
  };

  const handleEliminar = async () => {
    if (!solicitud?.id) {
      console.error("El ID de la solicitud no está definido.");
      alert("No se puede eliminar una solicitud sin ID.");
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8080/vacaciones/${solicitud.id}`);
      if (response.status === 200) {
        setSolicitud({ startDate: null, endDate: null }); // Resetear el contexto
        alert("Solicitud eliminada.");
        navigate("/");
      } else {
        alert("Hubo un problema al eliminar la solicitud.");
      }
    } catch (error) {
      console.error("Error eliminando la solicitud:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  const handleConfirmar = async () => {
    if (!solicitud?.id) {
      console.error("El ID de la solicitud no está definido.");
      alert("No se puede confirmar una solicitud sin ID.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/vacaciones/${solicitud.id}`, solicitud);
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
      <div className="DatePicker">
        <h4>Solicitud N°{solicitud.id || "1"}</h4>
        <p>Fecha de inicio: {solicitud.startDate?.format("DD/MM/YYYY") || "No definida"}</p>
        <p>Fecha de fin: {solicitud.endDate?.format("DD/MM/YYYY") || "No definida"}</p>
        <button onClick={handleEditar}>Editar</button>
        <button onClick={handleConfirmar}>OK</button>
        <button onClick={handleEliminar}>Eliminar</button>
      </div>
    </div>
  );
}


