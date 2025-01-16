// 📚 Importaciones
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import {getUserRole, getUsuarioId, isTokenValid} from "./authUtils";
import "./Home.css";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";

// 🌍 Localización de fechas
const locales = { es: esLocale };

const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) => format(date, formatStr, { ...options, locale: esLocale }),
  parse: (str, formatStr) => parse(str, formatStr, new Date(), { locale: esLocale }),
  startOfWeek: () => startOfWeek(new Date(), { locale: esLocale }),
  getDay,
  locales,
});

// 🏠 **Componente Principal**
const HomeTh = () => {

  // 🧠 Estados
  const userRole = getUserRole(); // Obtener el rol del usuario logueado
  const [userNameTh, setUserNameTh] = useState(""); // Nombre del usuario
  const [events, setEvents] = useState([]); // Lista de eventos para el calendario
  const [error, setError] = useState(""); // Mensajes de error
  const [modalOpen, setModalOpen] = useState(false); // Estado para abrir/cerrar el modal
  const [modalEvents, setModalEvents] = useState([]); // Eventos a mostrar en el modal
  const navigate = useNavigate(); // Navegación entre rutas
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  // 🔄 Manejo de clic en "more"
  const handleShowMore = (eventsOnDay, date) => {
    setModalEvents(eventsOnDay); // Asigna los eventos de ese día al estado
    setModalOpen(true); // Abre el modal
  };
  // Verificar si el usuario tiene el rol adecuado
  const isUserAllowed = () => {
    const allowedRoles = ["TH", "LIDER", "OPERACIONES", "DIRECTORIO"];
    const userRole = getUserRole(); // Lógica para obtener el rol del usuario
    return allowedRoles.includes(userRole);
  };



  // 📥 **Obtener Datos del Usuario**
  useEffect(() => {
    console.log(userRole)
    const fetchUserData = async () => {
      const usuarioId = getUsuarioId();
      // Verificar autenticación
      if (!usuarioId || !isTokenValid()) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        navigate("/");
        return;
      }
      try {

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/vacaciones/buscarid/${usuarioId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { nombre, fechaIngreso, diasVacaciones } = response.data;
        setUserNameTh(nombre);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("No se pudieron cargar los datos del usuario.");
      }
    };

    fetchUserData();
  }, [navigate]);

  // 📥 Obtener equipos
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/equipos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEquipos(response.data);
      } catch (err) {
        console.error("Error al obtener equipos:", err);
        setError("No se pudieron cargar los equipos.");
      }
    };

    fetchEquipos();
  }, []);

  // 📥 **Obtener Solicitudes de Vacaciones**
  useEffect(() => {
    const fetchVacationRequests = async () => {
      const usuarioId = getUsuarioId();

      // Verificar autenticación
      if (!usuarioId || !isTokenValid()) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        navigate("/");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:8080/vacaciones/solicitudes",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
        );

        // Mapear las solicitudes a eventos
        const eventsArray = response.data.map((solicitud) => ({
          title: `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
          start: new Date(`${solicitud.fechaInicio}T00:00:00`),
          end: new Date(`${solicitud.fechaFin}T23:59:59`),
          allDay: true,
          type: solicitud.rechazado
              ? "rechazado"
              : solicitud.estado
                  ? "aprobado"
                  : "pendiente",
          equipo: solicitud.usuario.equipo.nombre, // Mantiene el equipo para futuros filtros
        }));

        // Fechas fijas de feriados manuales
        const feriados = [
          { date: "2025-01-01", title: "Año Nuevo" },
          { date: "2025-03-02", title: "Día de los Héroes" },
          { date: "2025-04-17", title: "Jueves Santo" },
          { date: "2025-04-18", title: "Viernes Santo" },
          { date: "2025-05-01", title: "Día del Trabajador" },
          { date: "2025-05-14", title: "Día de la Independencia" },
          { date: "2025-06-12", title: "Día de la Paz del Chaco" },
          { date: "2025-08-15", title: "Fundación de Asunción" },
          { date: "2025-09-29", title: "Victoria de Boquerón" },
          { date: "2025-12-08", title: "Día de la Virgen de Caacupé" },
          { date: "2025-12-25", title: "Navidad" },
        ];

        // Agregar feriados a los eventos
        feriados.forEach((feriado) => {
          eventsArray.push({
            title: feriado.title,
            start: new Date(`${feriado.date}T00:00:00`),
            end: new Date(`${feriado.date}T23:59:59`),
            allDay: true,
            type: "feriado",
          });
        });

        setEvents(eventsArray);
      } catch (error) {
        console.error("Error al obtener solicitudes de vacaciones:", error);
        setError("No se pudieron cargar las solicitudes de vacaciones.");
      }
    };

    fetchVacationRequests();
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token de autenticación
    navigate("/"); // Redirigir a la página de inicio de sesión
  };
  // 🎨 **Personalizar colores de días**
  const dayPropGetter = (date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return {
        style: {
          backgroundColor: "#e5e5e5", // Color personalizado para sábados y domingos
          color: "#2b2d30",
        },
      };
    }
    return {};
  };

  // 🎨 **Personalizar colores de eventos**
  const eventStyleGetter = (event) => {
    switch (event.type) {
      case "aprobado":
        return {
          style: {
            backgroundColor: "#a0e2b3", // Verde para aprobados
            color: "#000000",
            borderRadius: "4px",
          },
        };
      case "rechazado":
        return {
          style: {
            backgroundColor: "#ff7c70", // Rojo para rechazados
            color: "#000000",
            borderRadius: "4px",
          },
        };
      case "pendiente":
        return {
          style: {
            backgroundColor: "#fefda6", // Amarillo para pendientes
            color: "#000000",
            borderRadius: "4px",
          },
        };
      case "feriado":
        return {
          style: {
            backgroundColor: "#c0a4c9", // Azul para feriados
            color: "#000000",
            borderRadius: "4px",
          },
        };
      default:
        return {};
    }
  };
  // Filtrar eventos por equipo
  const filterEventsByTeam = equipoSeleccionado
      ? events.filter(
          (event) =>
              event.equipo &&
              event.equipo.toLowerCase() === equipoSeleccionado.toLowerCase()
      )
      : events;


  // 🎨 **Renderizado del Componente**
  return (
    <div className="calendar-container">
      {/*<LogoutButton />*/}
      <Preloader duration={650} />
      <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
        {/* Barra de navegación */}
        <NavigationBar onLogout={handleLogout} />
        {/*<Logo /> */}
        {/* 👤 Información del Usuario */}
        <h1 className="calendar-title">
          Bienvenido, {userNameTh || "Usuario"}
        </h1>
        <h2 className="calendar-title">Solicitudes</h2>

        {/* 🚨 Mensajes de Error */}
        {error && <p className="calendar-error-message">{error}</p>}

        {/* 🛠️ Botones de Acción */}
        <div className="buttons">
          {userRole === "LIDER" ? (
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/AdminDashboard`)}
              >
                <span>Bandeja de Solicitudes</span>
              </button>
          ) : userRole !== "LIDER" ? (
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/AdminDashboard`)}
              >
                <span>Listar Solicitudes</span>
              </button>
          ) : null}

          {/* 🛠️ Botones visibles solo para "TH" */}
          {userRole === "TH" && (
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/crearusuario`)}
              >
                <span>Registrar Funcionario</span>
              </button>
          )}
          {userRole === "TH" && (
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/UsuarioDetalle`)}
              >
                <span>Usuario Detalle</span>
              </button>
          )}
          {userRole === "TH" && (
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/CrearEquipo`)}
              >
                <span>Crear Equipo</span>
              </button>
          )}
          {userRole === "TH" && (
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/CrearCargo`)}
              >
                <span>Crear Cargo</span>
              </button>
          )}
          <div className="calendar-filters-Th">
            <select
                // className="calendar-select-Th"
                className="inputCreate"
                value={equipoSeleccionado}
                onChange={(e) => setEquipoSeleccionado(e.target.value)}
            >
              <option value="">Todos los equipos</option>
              {equipos.map((equipo) => (
                  <option key={equipo.nombre} value={equipo.nombre}>
                    {equipo.nombre}
                  </option>
              ))}
            </select>
          </div>


        </div>

        {/* 📆 Calendario */}
        <div className="calendar-big-container">
          <Calendar
              localizer={localizer}
              events={filterEventsByTeam}
              startAccessor="start"
              endAccessor="end"
              style={{height: 500, margin: "20px 0"}}
              messages={{
                today: "Hoy",
                previous: "Anterior",
                next: "Siguiente",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
            }}
            views={{ month: true }} // Mantener solo la vista de mes
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            popup // Desactivar el comportamiento predeterminado del popup
            showMultiDayTimes={true}
            onShowMore={(eventsOnDay, date) => {
              // Prevenir cambio de vista
              handleShowMore(eventsOnDay, date);
            }}
          />
        </div>

        {/* 🖍️ Leyenda de Colores */}
        <div className="calendar-legend">
          <p>
            <span
              style={{
                backgroundColor: "#a0e2b3",
                color: "#000000",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              Aprobado
            </span>
          </p>
          <p>
            <span
              style={{
                backgroundColor: "#ff7c70",
                color: "#000000",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              Rechazado
            </span>
          </p>
          <p>
            <span
              style={{
                backgroundColor: "#fefda6",
                color: "#000000",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              Pendiente
            </span>
          </p>
          <p>
            <span
              style={{
                backgroundColor: "#c0a4c9",
                color: "#000000",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              Feriado
            </span>
          </p>
        </div>

        {/* 🔲 Modal para Solicitudes del Día */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-contentTh">
              <h4>Solicitudes en esta fecha:</h4> <br />
              {modalEvents.length > 0 ? (
                <div className="modal-events-list">
                  <ul>
                    {modalEvents.map((event, index) => (
                      <li key={index}>
                        <strong>{event.title}</strong> - {event.type} <br />
                        <span
                        style={{ color: "#000000",
                          backgroundColor:
                             event.type === "aprobado"
                             ? "#a0e2b3"  // Verde pastel para aprobado
                             : event.type === "rechazado"
                             ? "#ff7c70"  // Rojo pastel para rechazado
                             : event.type === "pendiente"
                             ? "#fefda6"  // Amarillo pastel para pendiente
                             : event.type === "feriado"
                             ? "#c0a4c9"  // Morado pastel para feriado
                             : "", // Si no es ninguno de los tipos, no aplica color
                             padding: "4px 8px",
                             borderRadius: "4px",
                         }}>
                          {event.type === "aprobado"
                               ? "Aprobado"
                                  : event.type === "rechazado"
                                   ? "Rechazado"
                                   : event.type === "pendiente"
                                   ? "Pendiente"
                                   : event.type === "feriado"
                                   ? "Feriado"
                                  : ""}
                                  </span>
                                  <br />
                                  <span>
                          Desde: {event.start.toLocaleDateString()} hasta:{" "}
                          {event.end.toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No hay solicitudes para esta fecha.</p>
              )}
              <button
                className="close-modal-btn"
                onClick={() => setModalOpen(false)}
              >
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTh;