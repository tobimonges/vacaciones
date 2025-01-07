import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { getUsuarioId, getUserRole } from "./authUtils";

const AdminDashboard = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [comentario, setComentario] = useState("");

  const userRole = getUserRole(); // Obtener el rol del usuario logueado

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
            "http://localhost:8080/vacaciones/solicitudes",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
        );

        setSolicitudes(response.data);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err.response.data);
        setError("No se pudieron cargar las solicitudes.");
      }
    };

    fetchSolicitudes();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    const userId = getUsuarioId();

    try {
      await axios.put(
          `http://localhost:8080/vacaciones/${id}/aprobar?usuarioId=${userId}`,
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
      );
      alert("Solicitud aprobada con éxito.");
      setSolicitudes((prev) =>
          prev.map((solicitud) =>
              solicitud.id === id
                  ? { ...solicitud, estado: true, rechazado: false, numeroAprobaciones: 2 }
                  : solicitud
          )
      );
    } catch (err) {
      console.error("Error al aprobar solicitud:", err.response.data);

      // Extraer el mensaje de error del backend
      const errorMessage =
          err.response.data || "Ocurrió un error al aprobar la solicitud.";

      alert(`Error al aprobar la solicitud: ${errorMessage}`);
    }
  };


  const handleReject = async (id) => {
    const token = localStorage.getItem("token");
    const userId = getUsuarioId();

    try {
      await axios.put(
          `http://localhost:8080/vacaciones/${id}/rechazar-lider-th?usuarioId=${userId}`,
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
      );
      alert("Solicitud rechazada con éxito.");
      // Actualizar el estado local de las solicitudes
      setSolicitudes((prev) =>
          prev.map((solicitud) =>
              solicitud.id === id
                  ? { ...solicitud, estado: false, rechazado: true, numeroAprobaciones: 0 }
                  : solicitud
          )
      );
    } catch (err) {
      console.error("Error al rechazar solicitud:", err.response.data);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAddComentario = async () => {
    const token = localStorage.getItem("token");
    const userId = getUsuarioId();

    if (!comentario.trim()) {
      alert("El comentario no puede estar vacío.");
      return;
    }

    try {
      await axios.put(
          `http://localhost:8080/vacaciones/${selectedSolicitudId}/rechazar-operador?usuarioId=${userId}`,
          { comentario },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
      );
      alert("Comentario añadido y solicitud rechazada con éxito.");
      setShowModal(false);
      setComentario("");
      setSolicitudes((prev) =>
          prev.map((solicitud) =>
              solicitud.id === selectedSolicitudId
                  ? { ...solicitud, estado: false, rechazado: true, comentario }
                  : solicitud
          )
      );
    } catch (err) {
      console.error("Error al añadir comentario:", err);
      alert(`Error: ${err.response.data}`);
    }
  };

  const openModal = (id) => {
    setSelectedSolicitudId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setComentario("");
  };

  const getEstadoSolicitud = (solicitud) => {
    if (solicitud.estado) {
      return "Aprobado";
    } else if (!solicitud.estado && solicitud.rechazado) {
      return "Rechazado";
    } else {
      return "Pendiente";
    }
  };

  return (
      <div className="container-admin">
        <h4>Panel de Administrador</h4>
        {error ? (
            <p className="error">{error}</p>
        ) : solicitudes.length === 0 ? (
            <p>No hay solicitudes pendientes.</p>
        ) : (
            <table className="admin-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                {userRole === "TH" && <th>Aprobada por Líder</th>}
                <th>Acciones</th>
              </tr>
              </thead>
              <tbody>
              {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>{solicitud.id}</td>
                    <td>{solicitud.usuario.nombre}</td>
                    <td>{solicitud.fechaInicio}</td>
                    <td>{solicitud.fechaFin}</td>
                    <td>{getEstadoSolicitud(solicitud)}</td>
                    {userRole === "TH" && (
                        <td>
                          {solicitud.numeroAprobaciones === 1 || solicitud.numeroAprobaciones === 2
                              ? "Sí"
                              : "No"}
                        </td>
                    )}
                    <td>
                      {userRole === "OPERACIONES" ? (
                          <button onClick={() => openModal(solicitud.id)}>
                            Añadir Comentario
                          </button>
                      ) : (
                          <>
                            <button onClick={() => handleApprove(solicitud.id)}>
                              Aprobar
                            </button>
                            <button onClick={() => handleReject(solicitud.id)}>
                              Rechazar
                            </button>
                          </>
                      )}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}

        {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h4>Añadir Comentario</h4>
                <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escriba un comentario..."
                ></textarea>
                <div className="modal-buttons">
                  <button onClick={handleAddComentario}>Guardar</button>
                  <button onClick={closeModal}>Cancelar</button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminDashboard;
