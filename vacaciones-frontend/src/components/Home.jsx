// 📚 Importaciones
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { getUsuarioId, isTokenValid } from "./authUtils";
import "./Home.css";

// 🌍 Localización de fechas
const locales = { es: esLocale };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 🏠 **Componente Principal**
const Home = () => {
  // 🧠 Estados
  const [userName, setUserName] = useState(""); // Nombre del usuario
  const [joinDate, setJoinDate] = useState(""); // Fecha de ingreso del usuario
  const [vacationDays, setVacationDays] = useState(0); // Días de vacaciones disponibles
  const [events, setEvents] = useState([]); // Lista de eventos para el calendario
  const [error, setError] = useState(""); // Mensajes de error
  const navigate = useNavigate(); // Navegación entre rutas

  // 📥 **Obtener Datos del Usuario**
  useEffect(() => {
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
        setUserName(nombre);
        setJoinDate(fechaIngreso);
        setVacationDays(diasVacaciones);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("No se pudieron cargar los datos del usuario.");
      }
    };

    fetchUserData();
  }, [navigate]);

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
            `http://localhost:8080/vacaciones/usuario/${usuarioId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
        );

        const eventsArray = [];

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((solicitud) => {
            if (solicitud.fechaInicio && solicitud.fechaFin) {
              const startDate = new Date(solicitud.fechaInicio).toISOString().split("T")[0];
              const endDate = new Date(solicitud.fechaFin).toISOString().split("T")[0];

              // Agregar eventos según el estado de la solicitud
              eventsArray.push({
                title: "Permiso",
                start: new Date(`${startDate}T00:00:00`),
                end: new Date(`${endDate}T23:59:59`),
                allDay: true,
                type: solicitud.estado ? "aprobado" : solicitud.estado === false ? "rechazado" : "pendiente",
              });
            }
          });
        }

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

  // 🎨 **Personalizar colores de eventos**
  const eventStyleGetter = (event) => {
    switch (event.type) {
      case "aprobado":
        return {
          style: {
            backgroundColor: "#28a745", // Verde para aprobados
            color: "#ffffff",
            borderRadius: "4px",
          },
        };
      case "rechazado":
        return {
          style: {
            backgroundColor: "#dc3545", // Rojo para rechazados
            color: "#ffffff",
            borderRadius: "4px",
          },
        };
      case "pendiente":
        return {
          style: {
            backgroundColor: "#ffc107", // Amarillo para pendientes
            color: "#000000",
            borderRadius: "4px",
          },
        };
      case "feriado":
        return {
          style: {
            backgroundColor: "#007bff", // Azul para feriados
            color: "#ffffff",
            borderRadius: "4px",
          },
        };
      default:
        return {};
    }
  };

  // 🎨 **Renderizado del Componente**
  return (
      <div className="calendar-container">
        <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
          {/* 👤 Información del Usuario */}
          <h1 className="calendar-title">Bienvenido, {userName || "Usuario"}</h1>
          <p className="calendar-text">
            Fecha de ingreso: {joinDate ? new Date(joinDate).toLocaleDateString("es-ES") : "Cargando..."}
          </p>
          <p className="calendar-text">
            Total de días de vacaciones disponibles: {vacationDays || "Cargando..."}
          </p>

          {/* 🚨 Mensajes de Error */}
          {error && <p className="calendar-error-message">{error}</p>}

          {/* 🛠️ Botones de Acción */}
          <div className="button-container">
            <button
                className="calendar-button"
                onClick={() => navigate("/NuevaSolicitud")}
            >
              Solicitar
            </button>
            <button
                className="calendar-button"
                onClick={() => navigate(`/SolicitudDetalle/${getUsuarioId()}`)}
            >
              Ver Solicitudes
            </button>
          </div>

          {/* 📆 Calendario */}
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
            />
          </div>

          {/* 🖍️ Leyenda de Colores */}
          <div className="calendar-legend">
            <p><span style={{ backgroundColor: "#28a745", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>Aprobado</span> - Vacaciones aprobadas</p>
            <p><span style={{ backgroundColor: "#dc3545", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>Rechazado</span> - Vacaciones rechazadas</p>
            <p><span style={{ backgroundColor: "#ffc107", color: "#000000", padding: "4px", borderRadius: "4px" }}>Pendiente</span> - Vacaciones pendientes</p>
            <p><span style={{ backgroundColor: "#007bff", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>Feriado</span> - Feriados oficiales</p>
          </div>
        </div>
      </div>
  );
};

export default Home;
