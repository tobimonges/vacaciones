// 📚 Importaciones
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { getUsuarioId, isTokenValid, getUserRole } from "./authUtils";
import "./Home.css";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";

// 🌍 Localización de fechas
const locales = { es: esLocale };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 🎨 **Constantes de estilo y mensajes**
const EVENT_TYPES = {
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
  PENDIENTE: "pendiente",
  FERIADO: "feriado",
};

const EVENT_COLORS = {
  [EVENT_TYPES.APROBADO]: "#67bcc1",
  [EVENT_TYPES.RECHAZADO]: "#6e6cba",
  [EVENT_TYPES.PENDIENTE]: "#6b97c8",
  [EVENT_TYPES.FERIADO]: "#479cf8",
};

const MESSAGES = {
  SESSION_EXPIRED: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
  USER_DATA_ERROR: "No se pudieron cargar los datos del usuario.",
  VACATION_REQUESTS_ERROR: "No se pudieron cargar las solicitudes de vacaciones.",
};

// 🎨 **Componente de leyenda del calendario**
const CalendarLegend = () => (
  <div className="calendar-legend">
    {Object.entries(EVENT_COLORS).map(([type, color]) => (
      <p key={type}>
        <span style={{ backgroundColor: color, color: "#ffffff", padding: "8px", borderRadius: "6px" }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </p>
    ))}
  </div>
);

// 🎨 **Componente de botones del calendario**
const CalendarButtons = ({ navigate, isUserAllowed }) => (
  <div className="buttons">
    <button className="calendar-button" onClick={() => navigate("/NuevaSolicitud")}>
      <span>Solicitar</span>
    </button>
    <button className="calendar-button" onClick={() => navigate(`/SolicitudDetalle/${getUsuarioId()}`)}>
      <span>Ver Solicitudes</span>
    </button>
    {isUserAllowed() && (
      <button className="calendar-button" onClick={() => navigate(`/HomeTh`)}>
        <span>Home Talento Humano</span>
      </button>
    )}
  </div>
);

// 🏠 **Componente Principal**
const Home = () => {
  // 🧠 Estados
  const [userName, setUserName] = useState(""); // Nombre del usuario
  const [joinDate, setJoinDate] = useState(""); // Fecha de ingreso del usuario
  const [vacationDays, setVacationDays] = useState(0); // Días de vacaciones disponibles
  const [events, setEvents] = useState([]); // Lista de eventos para el calendario
  const [error, setError] = useState(""); // Mensajes de error
  const navigate = useNavigate(); // Navegación entre rutas

  // 📥 **Verificar roles permitidos**
  const isUserAllowed = () => {
    const allowedRoles = ["TH", "LIDER", "DIRECTORIO", "OPERACIONES"];
    const userRole = getUserRole(); // Lógica para obtener el rol del usuario
    return allowedRoles.includes(userRole);
  };

  // 📥 **Obtener Datos del Usuario y Solicitudes de Vacaciones**
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
        const [userDataResponse, vacationRequestsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/vacaciones/buscarid/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/vacaciones/usuario/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { nombre, fechaIngreso, diasVacaciones } = userDataResponse.data;
        setUserName(nombre);
        setJoinDate(fechaIngreso);
        setVacationDays(diasVacaciones);

        const eventsArray = vacationRequestsResponse.data.map((solicitud) => {
          if (solicitud.fechaInicio && solicitud.fechaFin) {
            const startDate = new Date(solicitud.fechaInicio).toISOString().split("T")[0];
            const endDate = new Date(solicitud.fechaFin).toISOString().split("T")[0];

            const type = solicitud.rechazado
              ? EVENT_TYPES.RECHAZADO
              : solicitud.estado
              ? EVENT_TYPES.APROBADO
              : EVENT_TYPES.PENDIENTE;

            return {
              title: "Vacaciones",
              start: new Date(`${startDate}T00:00:00`),
              end: new Date(`${endDate}T23:59:59`),
              allDay: true,
              type,
            };
          }
          return null;
        }).filter(Boolean);

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

        feriados.forEach((feriado) => {
          eventsArray.push({
            title: feriado.title,
            start: new Date(`${feriado.date}T00:00:00`),
            end: new Date(`${feriado.date}T23:59:59`),
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
        },
      };
    }
    return {};
  };

  // 🎨 **Personalizar colores de eventos**
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: EVENT_COLORS[event.type],
        color: "#ffffff",
        borderRadius: "4px",
      },
    };
  };

  // 🎨 **Renderizado del Componente**
  return (
    <div className="calendar-container">
      <Preloader duration={650} />
      <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
        <NavigationBar onLogout={handleLogout} />
        <h1 className="calendar-title">Bienvenido, {userName || "Usuario"}</h1>
        <p className="calendar-text">
          Fecha de ingreso: {joinDate ? new Date(joinDate).toLocaleDateString("es-ES") : "Cargando..."}
        </p>
        <p className="calendar-text">
          Total de días de vacaciones disponibles: {vacationDays !== undefined ? vacationDays : "Cargando..."}
        </p>
        {error && <p className="calendar-error-message">{error}</p>}
        <CalendarButtons navigate={navigate} isUserAllowed={isUserAllowed} />
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
            }}
            views={{ month: true }}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
          />
        </div>
        <CalendarLegend />
      </div>
    </div>
  );
};

export default Home;