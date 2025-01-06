import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { getUsuarioId, getUserRole } from "./authUtils"; // Cambia el path según sea necesario

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
      const userId = getUsuarioId(); // Obtener el ID del usuario logueado

      try {
        const response = await axios.get(
          "http://localhost:8080/vacaciones/solicitudes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let solicitudesData = response.data;

        // Si el usuario tiene rol LIDER, filtrar por liderId
        if (userRole === "LIDER") {
          solicitudesData = solicitudesData.filter(
            (solicitud) => solicitud.lider.id === userId
          );
        }

        setSolicitudes(solicitudesData);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err);
        setError("No se pudieron cargar las solicitudes.");
      }
    };

    fetchSolicitudes();
  }, [userRole]);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/admin/solicitudes/${id}`,
        { estado: action === "approve" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(
        `Solicitud ${action === "approve" ? "aprobada" : "rechazada"} con éxito`
      );
      setSolicitudes((prev) => prev.filter((solicitud) => solicitud.id !== id));
    } catch (err) {
      console.error("Error al actualizar solicitud:", err);
      alert("Error al realizar la acción.");
    }
  };

  const handleAddComentario = async () => {
    if (!comentario.trim()) {
      alert("El comentario no puede estar vacío.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/operaciones/solicitudes/${selectedSolicitudId}`,
        { comentario },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Comentario añadido con éxito.");
      setShowModal(false);
      setComentario("");

      // Actualizar la lista localmente
      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === selectedSolicitudId
            ? { ...solicitud, comentario }
            : solicitud
        )
      );
    } catch (err) {
      console.error("Error al añadir comentario:", err);
      alert("Error al añadir el comentario.");
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
              <th>Comentarios</th>
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
                <td>{solicitud.estado ? "Aprobada" : "Pendiente"}</td>
                <td>
                  {solicitud.comentario
                    ? solicitud.comentario
                    : "No hay comentarios"}
                </td>
                <td>
                  <div className="buttons">
                    <button
                      onClick={() => handleAction(solicitud.id, "approve")}
                    >
                      Aprobar
                    </button>
                    <button
                      className="reject"
                      onClick={() => handleAction(solicitud.id, "reject")}
                    >
                      Rechazar
                    </button>
                    {userRole === "OPERACIONES" && (
                      <button
                        className="add-comment"
                        onClick={() => openModal(solicitud.id)}
                      >
                        Añadir Comentario
                      </button>
                    )}
                  </div>
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
            <div className="modal-input">
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
