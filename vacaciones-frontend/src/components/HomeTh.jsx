// 📚 Importaciones
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { getUserRole, getUsuarioId, isTokenValid } from "./authUtils";
import "./Home.css";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";
import Sidebar from "./Sidebar";

//Localización de fechas
const locales = { es: esLocale };

const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    format(date, formatStr, { ...options, locale: esLocale }),
  parse: (str, formatStr) =>
    parse(str, formatStr, new Date(), { locale: esLocale }),
  startOfWeek: () =>
    startOfWeek(new Date(), { locale: esLocale, weekStartsOn: 0 }),
  getDay,
  locales,
});

// Componente Principal
const HomeTh = () => {
  // 🧠 Estados
  const [showBirthdays, setShowBirthdays] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);
  const userRole = getUserRole(); // Obtener el rol del usuario logueado
  const [userNameTh, setUserNameTh] = useState(""); // Nombre del usuario
  const [events, setEvents] = useState([]); // Lista de eventos para el calendario
  const [error, setError] = useState(""); // Mensajes de error
  const [modalOpen, setModalOpen] = useState(false); // Estado para abrir/cerrar el modal
  const [modalEvents, setModalEvents] = useState([]); // Eventos a mostrar en el modal
  const navigate = useNavigate(); // Navegación entre rutas
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  //Manejo de clic en "more"
  const handleShowMore = (eventsOnDay, date) => {
    setModalEvents(eventsOnDay); // Asigna los eventos de ese día al estado
    setModalOpen(true); // Abre el modal
  };
  //Funcion para contar solicitudes pendientes
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId"); // Obtener el ID desde localStorage

        if (!userId) {
          console.error("El ID del usuario no está disponible.");
          return;
        }

        const response = await axios.get(
          "http://localhost:8080/vacaciones/solicitudes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const requests = response.data;

        // Filtrar solicitudes pendientes (numeroAprobaciones === 0) excluyendo las del usuario logueado
        const pendingRequests = requests.filter(
          (request) =>
            request.numeroAprobaciones === 0 && // Solicitudes pendientes
            request.lideres.some((lider) => lider.id === parseInt(userId)) // Usuario como líder
        );

        setPendingCount(pendingRequests.length);
      } catch (error) {
        console.error("Error al obtener las solicitudes pendientes:", error);
      }
    };

    fetchPendingRequests();

  }, []);

  //Funcion Para obtener equipos
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
      }
    };

    fetchEquipos();
  }, []);

  // 📥 **Obtener Datos del Usuario**
  useEffect(() => {
    const fetchUserData = async () => {
      const usuarioId = getUsuarioId();
      if (!usuarioId || !isTokenValid()) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        navigate("/");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            `http://localhost:8080/vacaciones/buscarid/${usuarioId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const { nombre } = response.data;
        setUserNameTh(nombre);

        // Marcar la página como recargada
        const shouldReload = localStorage.getItem("shouldReload");
        if (shouldReload) {
          localStorage.removeItem("shouldReload");
          navigate(0); // Recargar la página una vez
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("No se pudieron cargar los datos del usuario.");
      }
    };

    fetchUserData();
  }, [navigate]);


  // 📥 **Obtener Solicitudes de Vacaciones y Feriados**
  useEffect(() => {
    const fetchVacationData = async () => {
      const usuarioId = getUsuarioId();

      // Verificar autenticación
      if (!usuarioId || !isTokenValid()) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        navigate("/");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // Solicitudes de vacaciones
        const solicitudesResponse = await axios.get(
          "http://localhost:8080/vacaciones/solicitudes",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const solicitudesEvents = solicitudesResponse.data.map((solicitud) => {
          // Extraer usuario de solicitud
          const usuario = solicitud.usuario;

          // Verificar si usuario existe, y si no, usar un valor por defecto
          const nombre = usuario
            ? `${usuario.nombre} ${usuario.apellido}`
            : "Nombre no disponible";

          // Verificar si equipo existe dentro de usuario, y si no, usar un valor por defecto
          const equipo =
            usuario && usuario.equipo
              ? usuario.equipo.nombre
              : "Equipo no disponible";

          // Crear objetos de fecha de forma segura
          const fechaInicio = solicitud.fechaInicio
            ? new Date(`${solicitud.fechaInicio}T00:00:00`)
            : null;
          const fechaFin = solicitud.fechaFin
            ? new Date(`${solicitud.fechaFin}T23:59:59`)
            : null;

          // Retornar el evento con los datos correctamente manejados
          return {
            title: nombre, // Nombre del usuario
            start: fechaInicio, // Fecha de inicio
            end: fechaFin, // Fecha de fin
            allDay: true, // Evento todo el día
            type: solicitud.rechazado
              ? "rechazado"
              : solicitud.estado
              ? "aprobado"
              : "pendiente", // Tipo basado en estado y rechazado
            equipo: equipo, // Nombre del equipo
          };
        });

        // Feriados
        const feriadosResponse = await axios.get(
          "http://localhost:8080/vacaciones/feriados",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const feriadosEvents = feriadosResponse.data.map((feriado) => ({
          title: feriado.descripcion,
          start: new Date(`${feriado.fecha}T00:00:00`),
          end: new Date(`${feriado.fecha}T23:59:59`),
          allDay: true,
          type: "feriado",
        }));

        // Cumpleaños
        const cumpleanosResponse = await axios.get(
          "http://localhost:8080/vacaciones/obtenercumpleanos",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cumpleanosEvents = cumpleanosResponse.data.map((cumpleanos) => ({
          title: cumpleanos.descripcion,
          start: new Date(`${cumpleanos.fecha}T00:00:00`),
          end: new Date(`${cumpleanos.fecha}T23:59:59`),
          allDay: true,
          type: "cumpleanos",
        }));

        // Combinar todos los eventos
        setEvents([
          ...solicitudesEvents,
          ...feriadosEvents,
          ...cumpleanosEvents,
        ]);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError("No se pudieron cargar los datos.");
      }
    };

    fetchVacationData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/"); // Redirige a la página de inicio de sesión
  };

  // 🎨 **Personalizar colores de días**
  const dayPropGetter = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = date < today;

    if (isPastDate) {
      return {
        className: "past-date",
      };
    }
    return {};
  };

  //Personalizar colores de eventos
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
  const filterEventsByTeam = events.filter((event) => {
    // Filtrar por equipo
    const isEquipoMatch = equipoSeleccionado
      ? event.equipo &&
        event.equipo.toLowerCase() === equipoSeleccionado.toLowerCase()
      : true; // Si no hay equipo seleccionado, no se filtra por equipo
    // Filtrar por tipo de evento (cumpleaños y feriados)
    const isBirthdayVisible = event.type !== "cumpleanos" || showBirthdays;
    const isHolidayVisible = event.type !== "feriado" || showHolidays;
    // Retornar el evento solo si pasa ambos filtros
    return isEquipoMatch && isBirthdayVisible && isHolidayVisible;
  });

  //Renderizado del Componente
  return (
    <div className="container homeTH-container">
      {/* 📚 **Barra lateral** */}
      <div className="sidebar">
        <Sidebar />
      </div>

      {/* **Área de contenido** */}
      <div className="content-area">
        <Preloader duration={650} />

        {/* 📚 **Barra superior** */}
        <div className="navbar">
          <div className="navbar-content">
            <NavigationBar onLogout={handleLogout} />
          </div>
        </div>

        {/* 📚 **Contenido principal** */}
        <div className="main">
          <div className="main-content">
            <div className="calendar-title-th">
              {/* condiciones para mostrar un titulo u otro */}

              {pendingCount === 0 ? (
                <span>No tienes solicitudes pendientes.</span>
              ) : pendingCount === 1 ? (
                <span>Tienes 1 solicitud pendiente!</span>
              ) : (
                <span>Tienes {pendingCount} solicitudes pendientes!</span>
              )}
            </div>

            <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
              {/* 🛠️ Checkbox con filtros*/}

              <div className="opciones pendientes-container">
                <div className="select-container">
                  <select
                    id="equipo-select"
                    className="sidebar-button sidebar-button-homeTH"
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
                <div className="checkbox-container">
                  <div className="custom-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={showBirthdays}
                        onChange={(e) => setShowBirthdays(e.target.checked)}
                      />
                      Mostrar cumpleaños
                    </label>
                  </div>

                  <div className="custom-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={showHolidays}
                        onChange={(e) => setShowHolidays(e.target.checked)}
                      />
                      Mostrar feriados
                    </label>
                  </div>
                </div>
              </div>

              {/* 🚨 Mensajes de Error */}
              {error && <p className="calendar-error-message">{error}</p>}
              <div className="calendar-big-container">
                <Calendar
                  localizer={localizer}
                  events={filterEventsByTeam}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500, margin: "20px 0" }}
                  messages={{
                    today: "Hoy",
                    previous: "Anterior",
                    next: "Siguiente",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    showMore: (count) => `+${count} más`, // Traducción para "More"
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

                  dayLayoutAlgorithm="no-overlap"
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
                              <strong>{event.title}</strong> <br /> <br />
                              <span
                                style={{
                                  color: "#000000",
                                  backgroundColor:
                                    event.type === "aprobado"
                                      ? "#a0e2b3" // Verde pastel para aprobado
                                      : event.type === "rechazado"
                                      ? "#ff7c70" // Rojo pastel para rechazado
                                      : event.type === "pendiente"
                                      ? "#fefda6" // Amarillo pastel para pendiente
                                      : event.type === "feriado"
                                      ? "#c0a4c9" // Morado pastel para feriado
                                      : "", // Si no es ninguno de los tipos, no aplica color
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                }}
                              >
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
                              <br /> <br />
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
        </div>
      </div>
    </div>
  );
};

export default HomeTh;
