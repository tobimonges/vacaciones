import React, { useState, useEffect } from "react"; // Importa React y hooks de estado y efecto
import axios from "axios"; // Importa axios para hacer solicitudes HTTP
import { Calendar, dateFnsLocalizer } from "react-big-calendar"; // Importa componentes de calendario
import { format, parse, startOfWeek, getDay } from "date-fns"; // Importa funciones de manejo de fechas
import esLocale from "date-fns/locale/es"; // Importa localización en español para fechas
import "react-big-calendar/lib/css/react-big-calendar.css"; // Importa estilos CSS para el calendario
import { Link, useNavigate } from "react-router-dom"; // Importa componentes de navegación de React Router
import { getUsuarioId, isTokenValid, getUserRole } from "./authUtils"; // Importa utilidades de autenticación
import "./Home.css"; // Importa estilos CSS específicos para el componente Home
import NavigationBar from "./NavigationBar"; // Importa componente de barra de navegación
import Preloader from "./Preloader"; // Importa componente de preloader
import Sidebar from "./Sidebar"; // Importa componente de barra lateral
import "./Login.css"
import Logogiratorio from "./logogiratorio"

// Localización de fechas
const locales = { es: esLocale }; // Define la localización en español

const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) =>
    format(date, formatStr, { ...options, locale: esLocale }), // Formatea la fecha en español
  parse: (str, formatStr) =>
    parse(str, formatStr, new Date(), { locale: esLocale }), // Parsea la fecha en español
  startOfWeek: () =>
    startOfWeek(new Date(), { locale: esLocale, weekStartsOn: 0 }), // Define el inicio de la semana en español
  getDay, // Obtiene el día de la semana
  locales, // Asigna las localizaciones
});

// Constantes de estilo y mensajes
const EVENT_TYPES = {
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
  PENDIENTE: "pendiente",
  FERIADO: "feriado",
}; // Define tipos de eventos

const EVENT_COLORS = {
  [EVENT_TYPES.APROBADO]: "#a0e2b3",
  [EVENT_TYPES.RECHAZADO]: "#ff7c70",
  [EVENT_TYPES.PENDIENTE]: "#fefda6",
  [EVENT_TYPES.FERIADO]: "#c0a4c9",
}; // Define colores para cada tipo de evento

const MESSAGES = {
  SESSION_EXPIRED:
    "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
  USER_DATA_ERROR: "No se pudieron cargar los datos del usuario.",
  VACATION_REQUESTS_ERROR:
    "No se pudieron cargar las solicitudes de vacaciones.",
}; // Define mensajes de error

// Componente de leyenda del calendario
const CalendarLegend = () => (
  <div className="calendar-legend">
    {Object.entries(EVENT_COLORS).map(([type, color]) => (
      <p key={type}>
        <span
          style={{
            backgroundColor: color,
            color: "#000000",
            padding: "8px",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            cursor: "pointer",
          }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </p>
    ))}
  </div>
); // Componente que muestra la leyenda del calendario con los colores de los eventos


// Componente Principal
const Home = () => {
  // Estados
  const [userName, setUserName] = useState(""); // Estado para el nombre del usuario
  const [joinDate, setJoinDate] = useState(""); // Estado para la fecha de ingreso del usuario
  const [vacationDays, setVacationDays] = useState(0); // Estado para los días de vacaciones disponibles
  const [events, setEvents] = useState([]); // Estado para la lista de eventos del calendario
  const [error, setError] = useState(""); // Estado para los mensajes de error
  const [isAnimating, setIsAnimating] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  const [showNavBar, setShowNavBar] = useState(false); // Estado para controlar la visibilidad de la barra de navegación
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate(); // Hook para la navegación entre rutas

  // Obtener Datos del Usuario y Solicitudes de Vacaciones
  useEffect(() => {
    const fetchData = async () => {
      const usuarioId = getUsuarioId();

      if (!usuarioId || !isTokenValid()) {
        setError(MESSAGES.SESSION_EXPIRED);
        navigate("/");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // Solicitar días de vacaciones disponibles dinámicamente
        const vacationDaysResponse = await axios.get(
          `http://localhost:8080/vacaciones/diasdisponiblesid/${usuarioId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVacationDays(vacationDaysResponse.data || 0);

        // Realizamos las solicitudes para obtener otros datos
        const [
          userDataResponse,
          vacationRequestsResponse,
          holidaysResponse,
          birthdaysResponse,
        ] = await Promise.all([
          axios.get(`http://localhost:8080/vacaciones/buscarid/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/vacaciones/usuario/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/vacaciones/feriados", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:8080/vacaciones/cumpleanos/${usuarioId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const { nombre, fechaIngreso } = userDataResponse.data;
        setUserName(nombre);
        setJoinDate(fechaIngreso);

        // Procesar eventos
        const eventsArray = vacationRequestsResponse.data
          .map((solicitud) => {
            if (solicitud.fechaInicio && solicitud.fechaFin) {
              try {
                const startDate = new Date(solicitud.fechaInicio);
                const endDate = new Date(solicitud.fechaFin);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  throw new Error("Fecha inválida");
                }

                const type = solicitud.rechazado
                  ? EVENT_TYPES.RECHAZADO
                  : solicitud.estado
                  ? EVENT_TYPES.APROBADO
                  : EVENT_TYPES.PENDIENTE;

                return {
                  title: "Vacaciones",
                  start: startDate,
                  end: endDate,
                  allDay: true,
                  type,
                };
              } catch (e) {
                console.warn("Error al procesar evento:", solicitud, e);
                return null;
              }
            }
            return null;
          })
          .filter(Boolean);

        holidaysResponse.data.forEach((feriado) => {
          eventsArray.push({
            title: feriado.descripcion,
            start: new Date(`${feriado.fecha}T00:00:00`),
            end: new Date(`${feriado.fecha}T23:59:59`),
            allDay: true,
            type: EVENT_TYPES.FERIADO,
          });
        });

        setEvents(eventsArray);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError(MESSAGES.USER_DATA_ERROR);
      }
    };

    fetchData();
  }, [navigate]); // Hook de efecto para obtener datos del usuario y solicitudes de vacaciones

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
  }; // Función para obtener propiedades de los días del calendario

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: EVENT_COLORS[event.type],
        color: "#000000",
        borderRadius: "4px",
      },
    };
  }; // Función para obtener estilos de los eventos del calendario


  useEffect(() => {
     const timeout = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setShowSidebar(true);
      }, 800); // Retraso para mostrar la barra lateral
      setTimeout(() => {
        setShowNavBar(true);
      }, 300); // Retraso para mostrar la barra de navegación
      setTimeout(() => {
        setShowMainContent(true);
      }, 100); // Retraso para mostrar la barra lateral
    }, 650); // Duración de la animación de Logogiratorio

    return () => clearTimeout(timeout);
  }, []);


  return (
    // Estructura de la página
    <div className="container home-container">
      {isAnimating ? (
      <Logogiratorio duration={650} />
    ) : (
      showMainContent && (
        <>
      {/* **Barra lateral** */}
      <div className="sidebar cajaLogin">        
        <Sidebar/>
      </div>

      {/* **Área de contenido** */}
      <div className="content-area">
        {/* **Barra de navegación** */}
        <div className="navbar cajaLogin">
        <div className="navbar-content">
            <NavigationBar/>
          </div>
        </div>

        {/* **Contenido principal** */}
        <div className="main">
          <div className="main-content cajaLogin">
            <div className="calendar-title">
              <div className="calendar-key">
                <span>Fecha de ingreso:</span>
              </div>
              <div className="calendar-value">
                <span>
                  {joinDate
                    ? new Date(joinDate).toLocaleDateString("es-ES")
                    : "Cargando..."}
                </span>
              </div>
              <div className="calendar-divisor"></div>

              <div className="calendar-key">
                <span>Vacaciones disponibles:</span>
              </div>
              <div className="calendar-value">
                <span>
                  {vacationDays !== undefined ? vacationDays : "Cargando..."}
                </span>
              </div>
              {error && <p className="calendar-error-message">{error}</p>}
            </div>
            <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
              <div className="calendar-big-container">
                <Calendar
                  localizer={localizer}
                  events={events}
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
                    showMore: (count) => `+${count} más`, // Traducción de "More"

                  }}
                  views={{ month: true }}
                  eventPropGetter={eventStyleGetter}
                  dayPropGetter={dayPropGetter}
                />
              </div>
              <CalendarLegend />
            </div>
          </div>
        </div>
      </div>
      </>
      )
    )}
    </div>
  );
};

export default Home; // Exporta el componente Home