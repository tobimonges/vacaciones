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
import Logo from "./Logo";

import Preloader from "./Preloader";

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
const HomeTh = () => {
    // 🔄 Manejo de clic en "more"
    const handleShowMore = (eventsOnDay, date) => {
        setModalEvents(eventsOnDay); // Asigna los eventos de ese día al estado
        setModalOpen(true); // Abre el modal
    };
    // 🧠 Estados
    const [userNameTh, setUserNameTh] = useState(""); // Nombre del usuario
    const [joinDate, setJoinDate] = useState(""); // Fecha de ingreso del usuario
    const [vacationDays, setVacationDays] = useState(0); // Días de vacaciones disponibles
    const [events, setEvents] = useState([]); // Lista de eventos para el calendario
    const [error, setError] = useState(""); // Mensajes de error
    const [modalOpen, setModalOpen] = useState(false); // Estado para abrir/cerrar el modal
    const [modalEvents, setModalEvents] = useState([]); // Eventos a mostrar en el modal
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
                setUserNameTh(nombre);
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
                    `http://localhost:8080/vacaciones/solicitudes`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const eventsArray = [];


                response.data.forEach((solicitud) => {

                    if (solicitud.fechaInicio && solicitud.fechaFin) {
                        const startDate = new Date(solicitud.fechaInicio).toISOString().split("T")[0];
                        const endDate = new Date(solicitud.fechaFin).toISOString().split("T")[0];

                        // Nueva lógica para asignar tipo de evento
                        const type = solicitud.rechazado
                            ? "rechazado"
                            : solicitud.estado
                                ? "aprobado"
                                : "pendiente";

                        eventsArray.push({
                            title: solicitud.usuario.nombre + " " + solicitud.usuario.apellido,
                            start: new Date(`${startDate}T00:00:00`),
                            end: new Date(`${endDate}T23:59:59`),
                            allDay: true,
                            type,
                        });
                    }
                });

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
                        backgroundColor: "#67bcc1", // Verde para aprobados
                        color: "#ffffff",
                        borderRadius: "4px",
                    },
                };
            case "rechazado":
                return {
                    style: {
                        backgroundColor: "#6e6cba", // Rojo para rechazados
                        color: "#ffffff",
                        borderRadius: "4px",
                    },
                };
            case "pendiente":
                return {
                    style: {
                        backgroundColor: "#6b97c8", // Amarillo para pendientes
                        color: "#ffffff",
                        borderRadius: "4px",
                    },
                };
            case "feriado":
                return {
                    style: {
                        backgroundColor: "#479cf8", // Azul para feriados
                        color: "#ffffff",
                        borderRadius: "4px",
                    },
                };
            default:
                return {};
        }
    };

    // 🖼️ **Mostrar Modal con Eventos del Día**
    const handleDayClick = (date) => {
        const eventsOnDate = events.filter(
            (event) =>
                new Date(event.start).toLocaleDateString() ===
                new Date(date).toLocaleDateString()
        );
        setModalEvents(eventsOnDate);
        setModalOpen(true);
    };

    // 🎨 **Renderizado del Componente**
    return (
        <div className="calendar-container">
            <Preloader duration={650} />
            <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
                <Logo />
                {/* 👤 Información del Usuario */}
                <h1 className="calendar-title">Bienvenido, {userNameTh || "Usuario"}</h1>
                <h2 className="calendar-title">Solicitudes Generales</h2>

                {/* 🚨 Mensajes de Error */}
                {error && <p className="calendar-error-message">{error}</p>}

                {/* 🛠️ Botones de Acción */}
                <div className="buttons">
                    <button
                        className="calendar-button"
                        onClick={() => navigate("/Home")}
                    >
                        Home
                    </button>
                    <button
                        className="calendar-button"
                        onClick={() => navigate(`/AdminDashboard`)}
                    >
                        Dashboard
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
                        views={{ month: true }} // Mantener solo la vista de mes
                        eventPropGetter={eventStyleGetter}
                        popup={false} // Desactivar el comportamiento predeterminado del popup
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
            <span style={{ backgroundColor: "#67bcc1", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>
              Aprobado
            </span>
                    </p>
                    <p>
            <span style={{ backgroundColor: "#6e6cba", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>
              Rechazado
            </span>
                    </p>
                    <p>
            <span style={{ backgroundColor: "#6b97c8", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>
              Pendiente
            </span>
                    </p>
                    <p>
            <span style={{ backgroundColor: "#479cf8", color: "#ffffff", padding: "4px", borderRadius: "4px" }}>
              Feriado
            </span>
                    </p>
                </div>

                {/* 🔲 Modal para Solicitudes del Día */}
                {modalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-contentTh">
                            <h4>Solicitudes en esta fecha:</h4> <br/>
                            {modalEvents.length > 0 ? (
                                <div className="modal-events-list">
                                    <ul>
                                        {modalEvents.map((event, index) => (
                                            <li key={index}>
                                                <strong>{event.title}</strong> - {event.type} <br/>
                                                <span>
                                    Desde: {event.start.toLocaleDateString()} hasta: {event.end.toLocaleDateString()}
                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p>No hay solicitudes para esta fecha.</p>
                            )}
                            <button className="close-modal-btn" onClick={() => setModalOpen(false)}>
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
