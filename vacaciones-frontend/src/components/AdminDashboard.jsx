import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");

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
        console.error("Error al obtener solicitudes:", err);
        setError("No se pudieron cargar las solicitudes.");
      }
    };

    fetchSolicitudes();
  }, []);

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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
