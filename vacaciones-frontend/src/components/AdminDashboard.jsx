import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { getUsuarioId, getUserRole } from "./authUtils";
import Preloader from "./Preloader";

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
      const response = await axios.put(
        `http://localhost:8080/vacaciones/${id}/aprobar?usuarioId=${userId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Solicitud aprobada con éxito.");
      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === id ? response.data : solicitud
        )
      );
    } catch (err) {
      console.error("Error al aprobar solicitud:", err.response.data);
      const errorMessage =
        err.response.data.message ||
        "Ocurrió un error al aprobar la solicitud.";
      alert(`Error al aprobar la solicitud: ${errorMessage}`);
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");
    const userId = getUsuarioId();

    try {
      const response = await axios.put(
        `http://localhost:8080/vacaciones/${id}/rechazar-lider-th?usuarioId=${userId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Solicitud rechazada con éxito.");
      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === id
            ? {
                ...solicitud,
                estado: false,
                rechazado: true,
                numeroAprobaciones: 0,
              }
            : solicitud
        )
      );
    } catch (err) {
      console.error("Error al rechazar solicitud:", err.response.data);
      alert(`Error: ${err.response.data.message}`);
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
    if (userRole === "OPERACIONES") {
      if (!solicitud.estado && solicitud.rechazado) {
        return "Rechazado"; // Estado específico para OPERACIONES
      } else if (solicitud.numeroAprobaciones === 0) {
        return "Falta aprobación del Líder"; // Estado inicial visible para OPERACIONES
      } else if (solicitud.numeroAprobaciones === 1) {
        return "Pendiente a TH"; // Aprobado por líder, pendiente a TH
      } else if (solicitud.estado) {
        return "Aprobado"; // Aprobado completamente
      } else {
        return "Pendiente"; // Otros casos visibles para OPERACIONES
      }
    }

    // Lógica general para otros roles
    if (!solicitud.estado && solicitud.rechazado) {
      return "Rechazado"; // Si la solicitud fue rechazada
    } else if (solicitud.numeroAprobaciones === 0 && userRole === "TH") {
      return "Falta aprobación del Líder"; // Si no ha sido aprobada por el líder y el usuario es TH
    } else if (solicitud.numeroAprobaciones === 1) {
      return "Pendiente a TH"; // Si hay una aprobación, pendiente a TH
    } else if (solicitud.estado) {
      return "Aprobado"; // Si la solicitud está aprobada completamente
    } else {
      return "Pendiente"; // Cualquier otro caso
    }
  };

  return (
    <div>
      <Preloader duration={650} />
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
                  <td>
                    {solicitud.usuario.nombre +
                      " " +
                      solicitud.usuario.apellido}
                  </td>
                  <td>
                    {new Date(solicitud.fechaInicio).toLocaleDateString(
                      "es-ES"
                    )}
                  </td>
                  <td>
                    {new Date(solicitud.fechaFin).toLocaleDateString("es-ES")}
                  </td>
                  <td>{getEstadoSolicitud(solicitud)}</td>
                  {userRole === "TH" && (
                    <td>
                      {solicitud.numeroAprobaciones === 1 ||
                      solicitud.numeroAprobaciones === 2
                        ? "Sí"
                        : "No"}
                    </td>
                  )}
                  <td>
                    {userRole === "OPERACIONES" ? (
                      <button
                        onClick={() => openModal(solicitud.id)}
                        disabled={solicitud.rechazado}
                      >
                        Añadir comentario
                      </button>
                    ) : !solicitud.rechazado ? (
                      userRole === "LIDER" ? (
                        <>
                          <button
                            onClick={() => handleApprove(solicitud.id)}
                            disabled={solicitud.numeroAprobaciones === 1}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(solicitud.id)}
                            disabled={false}
                          >
                            Rechazar
                          </button>
                        </>
                      ) : userRole === "TH" ? (
                        <>
                          <button
                            onClick={() => handleApprove(solicitud.id)}
                            disabled={
                              solicitud.numeroAprobaciones === 0 ||
                              solicitud.estado === true
                            }
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(solicitud.id)}
                            disabled={
                              solicitud.numeroAprobaciones === 0 &&
                              !solicitud.estado
                            }
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(solicitud.id)}
                            disabled
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(solicitud.id)}
                            disabled
                          >
                            Rechazar
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(solicitud.id)}
                          disabled
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(solicitud.id)}
                          disabled
                        >
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
    </div>
  );
};

export default AdminDashboard;
