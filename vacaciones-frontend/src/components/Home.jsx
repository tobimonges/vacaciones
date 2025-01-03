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

// 🌍 Localización
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
  const [vacationRequests, setVacationRequests] = useState([]);
  const [userName, setUserName] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [vacationDays, setVacationDays] = useState(0);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchVacationRequests = async () => {
      const usuarioId = getUsuarioId();

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

        console.log("Respuesta de la API:", response.data); // ✅ Validar estructura

        const eventsArray = [];
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((solicitud) => {
            console.log("Solicitud actual:", solicitud); // ✅ Validar cada solicitud

            if (solicitud.fechaInicio && solicitud.fechaFin) {
              const startDate = new Date(solicitud.fechaInicio);
              startDate.setHours(0, 0, 0, 0);

              const endDate = new Date(solicitud.fechaFin);
              endDate.setHours(23, 59, 59, 999);

              console.log("Fecha Inicio:", startDate, "Fecha Fin:", endDate); // ✅ Validar fechas

              let currentDate = new Date(startDate);
              while (currentDate <= endDate) {
                eventsArray.push({
                  title: "Día de Vacaciones",
                  start: new Date(currentDate),
                  end: new Date(currentDate),
                  allDay: true,
                });
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          });
        }

        console.log("Array final de eventos:", eventsArray); // ✅ Validar array final
        setEvents(eventsArray);
      } catch (error) {
        console.error("Error al obtener solicitudes de vacaciones:", error);
        setError("No se pudieron cargar las solicitudes de vacaciones.");
      }
    };

    fetchVacationRequests();
  }, [navigate]);




  console.log("Estado final de eventos:", events); // 👈 Valida el estado antes del calendario
  // 🎨 **Renderizado del Componente**
  return (
      <div className="calendar-container">
        <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
          {/* 👤 Información del Usuario */}
          <h1 className="calendar-title">Bienvenido, {userName || "Usuario"}</h1>
          <p className="calendar-text">
            Fecha de ingreso:{" "}
            {joinDate ? new Date(joinDate).toLocaleDateString("es-ES") : "Cargando..."}
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
            />
          </div>
        </div>
      </div>
  );
};

export default Home;
