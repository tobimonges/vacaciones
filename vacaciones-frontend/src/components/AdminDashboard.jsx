import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { getUsuarioId, getUserRole } from "./authUtils";
import Preloader from "./Preloader";
import Logo from "./Logo";

import NavigationBar from "./NavigationBar";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [comentario, setComentario] = useState("");
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [filterText, setFilterText] = useState("");
  const userId = getUsuarioId();
  const userRole = getUserRole(); // Obtener el rol del usuario logueado
  const navigate = useNavigate();

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

        // Definir el orden de prioridad de los estados
        const estadoPrioridad = {
          "Pendiente a TH": 1,
          Pendiente: 2,
          "Falta aprobación del Líder": 3,
          Aprobado: 4,
          Rechazado: 5,
        };

        //PROBAR LOGUEO CON LIDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDER
        let filteredByRole;
        if (userRole === "LIDER") {
          filteredByRole = response.data.filter(
            (solicitud) => solicitud.lider.id === userId
          );
        } else {
          filteredByRole = response.data.filter(
            (solicitud) => solicitud.usuario.id !== userId
          );
        }

        // Ordenar las solicitudes según el estado
        const sortedSolicitudes = filteredByRole.sort((a, b) => {
          const estadoA = estadoPrioridad[getEstadoSolicitud(a)] || 6;
          const estadoB = estadoPrioridad[getEstadoSolicitud(b)] || 6;
          return estadoA - estadoB;
        });

        setSolicitudes(sortedSolicitudes);
        setFilteredSolicitudes(sortedSolicitudes);
        console.log(sortedSolicitudes);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err.response.data);
        setError("No se pudieron cargar las solicitudes.");
      }
    };

    fetchSolicitudes();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");

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

      navigate(0); // Recargar la página actual
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

      navigate(0); // Recargar la página actual
    } catch (err) {
      console.error("Error al rechazar solicitud:", err.response.data);
      alert(`Error: ${err.response.data.message}`);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token de autenticación
    navigate("/"); // Redirigir a la página de inicio de sesión
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
      navigate(0); // Recargar la página actual
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

  const handleFilterChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setFilterText(searchText);

    const filtered = solicitudes.filter((solicitud) => {
      const nroCedula = solicitud.usuario.nroCedula.toString();
      const fullName =
        `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`.toLowerCase();
      const estado = getEstadoSolicitud(solicitud).toLowerCase();
      const nroSolicitud = solicitud.id.toString();
      const equipo = `${solicitud.usuario.equipo.nombre}`.toLowerCase();
      return (
        nroCedula.includes(searchText) ||
        fullName.includes(searchText) ||
        estado.includes(searchText) ||
        nroSolicitud.includes(searchText) ||
        equipo.includes(searchText)
      );
    });

    setFilteredSolicitudes(filtered);
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
        <div className="header-section">
          {/* Barra de navegación */}
          <NavigationBar onLogout={handleLogout} />
          {/*<Logo /> */}
          <div className="header-title-container">
            <div className="space"></div>
            <h4>Panel de Administrador</h4>
            <div className="filter-container">
              <label htmlFor="filter-input" className="filter-label">
                Buscar:
              </label>
              <input
                id="filter-input"
                type="text"
                placeholder="Ingrese un campo"
                value={filterText}
                onChange={handleFilterChange}
                className="inputCreate"
              />
            </div>
          </div>
        </div>
        <div className="content-section">
          {error ? (
            <p className="error">{error}</p>
          ) : filteredSolicitudes.length === 0 ? (
            <p>No hay solicitudes que coincidan con el filtro.</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nro. Solicitud</th>
                    <th>Cedula</th>
                    <th>Usuario</th>
                    <th>Equipo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Total Dias</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSolicitudes.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td>{solicitud.id}</td>
                      <td>
                        {new Intl.NumberFormat("es-ES").format(
                          solicitud.usuario.nroCedula
                        )}
                      </td>
                      <td>
                        {solicitud.usuario.nombre +
                          " " +
                          solicitud.usuario.apellido}
                      </td>
                      <td>{solicitud.usuario.equipo.nombre}</td>
                      <td>
                        {new Date(solicitud.fechaInicio).toLocaleDateString(
                          "es-ES"
                        )}
                      </td>
                      <td>
                        {new Date(solicitud.fechaFin).toLocaleDateString(
                          "es-ES"
                        )}
                      </td>
                      <td>
                        {solicitud.cantidadDias === 1
                          ? `${solicitud.cantidadDias} día`
                          : `${solicitud.cantidadDias} días`}
                      </td>
                      <td>{getEstadoSolicitud(solicitud)}</td>

                      <td>
                        {userRole === "OPERACIONES" ? (
                          <button
                            onClick={() => openModal(solicitud.id)}
                            disabled={solicitud.rechazado}
                          >
                            <span>Añadir comentario</span>
                          </button>
                        ) : !solicitud.rechazado ? (
                          userRole === "LIDER" ? (
                            <>
                              <button
                                onClick={() => handleApprove(solicitud.id)}
                                disabled={
                                  solicitud.numeroAprobaciones === 1 ||
                                  solicitud.usuario.id === userId
                                }
                              >
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => handleReject(solicitud.id)}
                                disabled={solicitud.usuario.id === userId}
                              >
                                <span>Rechazar</span>
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
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => handleReject(solicitud.id)}
                                disabled={
                                  solicitud.numeroAprobaciones === 0 &&
                                  !solicitud.estado
                                }
                              >
                                <span>Rechazar</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(solicitud.id)}
                                disabled
                              >
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => handleReject(solicitud.id)}
                                disabled
                              >
                                <span>Rechazar</span>
                              </button>
                            </>
                          )
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(solicitud.id)}
                              disabled
                            >
                              <span>Aprobar</span>
                            </button>
                            <button
                              onClick={() => handleReject(solicitud.id)}
                              disabled
                            >
                              <span>Rechazar</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
