import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { getUsuarioId, getUserRole } from "./authUtils";
import Preloader from "./Preloader";

import NavigationBar from "./NavigationBar";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal de confirmación de rechazo
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [comentario, setComentario] = useState("");
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [actionType, setActionType] = useState("");
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

        // Validar que la respuesta sea válida
        if (!response || !response.data) {
          throw new Error("La respuesta de la API no es válida.");
        }

        // Definir el orden de prioridad de los estados
        const estadoPrioridad = {
          "Pendiente a TH": 1,
          Pendiente: 2,
          "Falta aprobación del Líder": 3,
          Aprobado: 4,
          Rechazado: 5,
        };

        // Filtrar según el rol del usuario
        let filteredByRole;
        if (userRole === "LIDER") {
          filteredByRole = response.data.filter((solicitud) =>
            solicitud.lideres.some((lider) => lider.id === userId)
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
      } catch (err) {
        console.error("Error al obtener solicitudes:", err.message || err);
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
      setShowConfirmModal(false);
      navigate(0); // Recargar la página actual
    } catch (err) {
      console.error("Error al aprobar solicitud:", err.response.data);
      const errorMessage =
        err.response.data.message ||
        "Ocurrió un error al aprobar la solicitud.";
      alert(`Error al aprobar la solicitud: ${errorMessage}`);
    }
  };

  const handleRejectConfirm = (id) => {
    setSelectedSolicitudId(id);
    setActionType("reject"); // Establecer acción como rechazo
    setShowConfirmModal(true); // Mostrar modal de confirmación
  };

  const handleApproveConfirm = (id) => {
    setSelectedSolicitudId(id);
    setActionType("approve"); // Establecer acción como aprobación
    setShowConfirmModal(true); // Mostrar modal de confirmación
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false); // Cerrar modal de confirmación
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");
    const userId = getUsuarioId();

    try {
      await axios.put(
          `http://localhost:8080/vacaciones/${id}/rechazar?usuarioId=${userId}`, // URL con parámetros
          {}, // Body vacío ya que no estás enviando datos en el cuerpo
          {
            headers: { Authorization: `Bearer ${token}` }, // Headers correctamente colocados
          }
      );
      alert("Solicitud rechazada con éxito.");
      setShowConfirmModal(false);
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
    const url = `http://localhost:8080/vacaciones/buscarid/${userId}`;

    const { data: usuario } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si el comentario está vacío, asignar "Rechazado por <nombre del usuario>"
    const comentarioFinal = comentario.trim()
      ? comentario.trim()
      : `Rechazado por ${usuario.nombre}`;

    try {
      await axios.put(
        `http://localhost:8080/vacaciones/${selectedSolicitudId}/rechazar?usuarioId=${userId}`,
        { comentario: comentarioFinal },
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
            ? {
                ...solicitud,
                estado: false,
                rechazado: true,
                comentario: comentarioFinal,
              }
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

  const handleAction = () => {
    if (actionType === "approve") {
      handleApprove(selectedSolicitudId);
    } else if (actionType === "reject") {
      handleReject(selectedSolicitudId);
    }
  };

  const getEstadoSolicitud = (solicitud) => {
    // Común a todos los roles, dependiendo del estado de la solicitud
    if (!solicitud.estado && solicitud.rechazado) {
      return "Rechazado"; // Si la solicitud fue rechazada
    }

    // Lógica de estados basados en el número de aprobaciones
    if (solicitud.numeroAprobaciones === 0) {
      return "Falta aprobación del Líder"; // Si la solicitud no ha sido aprobada por el líder
    } else if (solicitud.numeroAprobaciones === 1 && userRole === "TH") {
      return "Pendiente a GTH"; // Si la solicitud está pendiente de aprobación de GTH
    } else if (solicitud.numeroAprobaciones === 1) {
      return "Pendiente a TH"; // Si está pendiente de aprobación de TH
    }

    // Si la solicitud está completamente aprobada
    if (solicitud.estado) {
      return "Aprobado"; // Aprobación completa
    }
  };

  return (
    <div className="container">
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
                          <>
                            {getEstadoSolicitud(solicitud) ===
                            "Falta aprobación del Líder" ? (
                              solicitud.lideres.some(
                                (lider) => lider.id === userId
                              ) ? (
                                // Mostrar botones de Aprobar y Rechazar si el usuario logueado es el líder asignado
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveConfirm(solicitud.id)
                                    }
                                    className="btn-approve"
                                  >
                                    <span>Aprobar</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectConfirm(solicitud.id)
                                    }
                                    className="btn-reject"
                                  >
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              ) : (
                                // Mostrar botones deshabilitados si el usuario logueado no es el líder asignado
                                <>
                                  <button disabled>
                                    <span>Aprobar</span>
                                  </button>
                                  <button disabled>
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              )
                            ) : getEstadoSolicitud(solicitud) === "Aprobado" ? (
                              // Mostrar botón de Añadir Comentario para OPERACIONES si el estado es "Aprobado"
                              <button onClick={() => openModal(solicitud.id)}>
                                <span>Añadir comentario</span>
                              </button>
                            ) : (
                              // Mostrar botones deshabilitados para otros estados
                              <>
                                <button disabled>
                                  <span>Aprobar</span>
                                </button>
                                <button disabled>
                                  <span>Rechazar</span>
                                </button>
                              </>
                            )}
                          </>
                        ) : !solicitud.rechazado ? (
                          userRole === "DIRECTORIO" ? (
                            solicitud.lideres.some(
                              (lider) => lider.id === userId
                            ) ? (
                              <>
                                {getEstadoSolicitud(solicitud) === "Aprobado" ||
                                getEstadoSolicitud(solicitud) ===
                                  "Pendiente a TH" ||
                                getEstadoSolicitud(solicitud) ===
                                  "Rechazado" ? (
                                  // Si el estado es "Aprobado", "Pendiente a TH" o "Rechazado", los botones están deshabilitados
                                  <>
                                    <button disabled>
                                      <span>Aprobar</span>
                                    </button>
                                    <button disabled>
                                      <span>Rechazar</span>
                                    </button>
                                  </>
                                ) : (
                                  // Si no es uno de los estados mencionados, los botones están habilitados
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApproveConfirm(solicitud.id)
                                      }
                                      className="btn-approve"
                                    >
                                      <span>Aprobar</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectConfirm(solicitud.id)
                                      }
                                      className="btn-reject"
                                    >
                                      <span>Rechazar</span>
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              // Si el usuario no es líder, los botones están deshabilitados
                              <>
                                <button disabled>
                                  <span>Aprobar</span>
                                </button>
                                <button disabled>
                                  <span>Rechazar</span>
                                </button>
                              </>
                            )
                          ) : userRole === "LIDER" ? (
                            <>
                              {getEstadoSolicitud(solicitud) ===
                                "Pendiente a TH" ||
                              getEstadoSolicitud(solicitud) === "Rechazado" ||
                              getEstadoSolicitud(solicitud) === "Aprobado" ? (
                                // Botones deshabilitados si el estado es "Pendiente a TH", "Rechazado" o "Aprobado"
                                <>
                                  <button disabled>
                                    <span>Aprobar</span>
                                  </button>
                                  <button disabled>
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              ) : getEstadoSolicitud(solicitud) ===
                                "Pendiente" || getEstadoSolicitud(solicitud) ===
                              "Falta aprobación del Líder" ? (
                                // Mostrar botones Aprobar y Rechazar si el estado está en "Pendiente"
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveConfirm(solicitud.id)
                                    }
                                    className="btn-approve"
                                  >
                                    <span>Aprobar</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectConfirm(solicitud.id)
                                    }
                                    className="btn-reject"
                                  >
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              ) : (
                                // Fallback (botones deshabilitados)
                                <>
                                  <button disabled>
                                    <span>Aprobar</span>
                                  </button>
                                  <button disabled>
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              )}
                            </>
                          ) : userRole === "TH" || userRole === "GTH" ? (
                            <>
                              {getEstadoSolicitud(solicitud) === "Aprobado" ? (
                                // Deshabilitar botones si el estado es "Aprobado"
                                <>
                                  <button disabled>
                                    <span>Aprobar</span>
                                  </button>
                                  <button disabled>
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              ) : (
                                // Mostrar botones Aprobar y Rechazar para otros estados
                                <>
                                  <button
                                    onClick={() =>
                                      handleApproveConfirm(solicitud.id)
                                    }
                                    disabled={
                                      solicitud.numeroAprobaciones === 0 ||
                                      solicitud.estado
                                    }
                                    className="btn-approve"
                                  >
                                    <span>Aprobar</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectConfirm(solicitud.id)
                                    }
                                    disabled={
                                      solicitud.numeroAprobaciones === 0 &&
                                      !solicitud.estado
                                    }
                                    className="btn-reject"
                                  >
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            // Fallback (botones deshabilitados)
                            <>
                              <button disabled>
                                <span>Aprobar</span>
                              </button>
                              <button disabled>
                                <span>Rechazar</span>
                              </button>
                            </>
                          )
                        ) : (
                          // Botones deshabilitados si la solicitud está rechazada
                          <>
                            <button disabled>
                              <span>Aprobar</span>
                            </button>
                            <button disabled>
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
      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>
              {actionType === "approve"
                ? "Confirmar Aprobación"
                : "Confirmar Rechazo"}
            </h4>
            <p>
              {actionType === "approve"
                ? "¿Estás seguro que quieres aprobar esta solicitud?"
                : "¿Estás seguro que quieres rechazar esta solicitud?"}
            </p>
            <div className="modal-buttons">
              <button
                onClick={handleAction} // Llama a la acción seleccionada (aprobar o rechazar)
                className="btn-confirm"
              >
                Sí
              </button>
              <button
                onClick={closeConfirmModal} // Cierra el modal sin realizar ninguna acción
                className="btn-cancel"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
