// 📚 Importaciones
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Link, useNavigate } from "react-router-dom";
import { getUsuarioId, isTokenValid, getUserRole } from "./authUtils";
import "./Home.css";
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

// 🎨 **Constantes de estilo y mensajes**
const EVENT_TYPES = {
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
  PENDIENTE: "pendiente",
  FERIADO: "feriado",
};

const EVENT_COLORS = {
  [EVENT_TYPES.APROBADO]: "#a0e2b3",
  [EVENT_TYPES.RECHAZADO]: "#ff7c70",
  [EVENT_TYPES.PENDIENTE]: "#fefda6",
  [EVENT_TYPES.FERIADO]: "#c0a4c9",
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
        <span style={{ backgroundColor: color, color: "#000000", padding: "8px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", cursor: "pointer" }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </p>
    ))}
  </div>
);

// 🎨 **Componente de botones del calendario**
const CalendarButtons = ({ navigate, isUserAllowed, onLogout }) => (
  <div className="sidebar-buttons">
    <button className="sidebar-button" onClick={() => navigate("/Home")}>
      <span className="sidebar-text-focus">Home</span>
    </button>
    <button className="sidebar-button" onClick={() => navigate("/NuevaSolicitud")}>
      <span>Solicitar</span>
    </button>
    <button className="sidebar-button" onClick={() => navigate(`/SolicitudDetalle/${getUsuarioId()}`)}>
      <span>Ver Solicitudes</span>
    </button>
    {isUserAllowed() && (
      <button className="sidebar-button" onClick={() => navigate(`/HomeTh`)}>
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

        // Solicitar días de vacaciones disponibles dinámicamente
        const vacationDaysResponse = await axios.get(`http://localhost:8080/vacaciones/diasdisponiblesid/${usuarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(vacationDaysResponse.data)
        setVacationDays(vacationDaysResponse.data || 0);

        // Realizamos las solicitudes para obtener otros datos
        const [userDataResponse, vacationRequestsResponse, holidaysResponse, birthdaysResponse] = await Promise.all([
          axios.get(`http://localhost:8080/vacaciones/buscarid/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/vacaciones/usuario/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/vacaciones/feriados", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8080/vacaciones/cumpleanos/${usuarioId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { nombre, fechaIngreso } = userDataResponse.data;
        setUserName(nombre);
        setJoinDate(fechaIngreso);

        // Procesar eventos
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const dayPropGetter = (date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return {
        style: {
          backgroundColor: "#e5e5e5",
        },
      };
    }
    return {};
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: EVENT_COLORS[event.type],
        color: "#000000",
        borderRadius: "4px",
      },
    };
  };

  return (

    // 🖼️ **Estructura de la página** 
    <div className="container home-container">



      { /* 📚 **Barra lateral** */}
      <div className="sidebar">
        <div className="sidebar-content">

          {/* 🖼️ Logo de la barra lateral */}
          <div className="sidebar-logo">
            <Link to="/home">
              <img src=".\logo-white.svg" alt="Logo" className="logo" />
            </Link>
          </div>

          <div className="sidebar-buttons">
            <CalendarButtons navigate={navigate} isUserAllowed={isUserAllowed} />
          </div>

          <div className="sidebar-logout">
            <button className="logout-button" onClick={handleLogout}>
              <img src=".\salida.svg" alt="Cerrar sesión" className="button-icon" />
              <span>Cerrar sesión</span>
            </button>
          </div>

        </div>
      </div>


      { /* 📚 **Área de contenido** */}
      <div className="content-area">


        { /* 📚 **Barra de navegación** */}
        <div className="navbar">
          <div className="navbar-content">
            <NavigationBar onLogout={handleLogout} />
          </div>
        </div>


        { /* 📚 **Contenido principal** */}
        <div className="main">
          <div className="main-content">
              <div className="calendar-title">
                <p className="calendar-text">
                  Fecha de ingreso: {joinDate ? new Date(joinDate).toLocaleDateString("es-ES") : "Cargando..."}
                </p>
                <p className="calendar-text">
                  Total de días de vacaciones disponibles: {vacationDays !== undefined ? vacationDays : "Cargando..."}
                </p>
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
    </div>
  );
};

export default Home;