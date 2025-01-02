import React, { useState, useEffect } from "react";
import axios from "axios";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import Badge from "@mui/material/Badge";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import CheckIcon from "@mui/icons-material/Check";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { getUsuarioId, isTokenValid } from "./authUtils";
import "./Home.css";

const Home = () => {
  const [vacationRequests, setVacationRequests] = useState([]);
  const [userName, setUserName] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [vacationDays, setVacationDays] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const holidays = [
    new Date(2024, 0, 1),
    new Date(2024, 3, 1),
    new Date(2024, 4, 1),
    new Date(2024, 4, 17),
    new Date(2024, 4, 18),
    new Date(2024, 5, 1),
    new Date(2024, 5, 14),
    new Date(2024, 5, 15),
    new Date(2024, 6, 12),
    new Date(2024, 8, 15),
    new Date(2024, 9, 29),
    new Date(2024, 11, 8),
    new Date(2024, 11, 25),
  ];

  const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
  const isHoliday = (date) => holidays.some((holiday) => differenceInCalendarDays(holiday, date) === 0);
  const shouldDisableDate = (date) => isWeekend(date) || isHoliday(date);

  const isInRange = (day) => {
    return selectedDays.some((selectedDay) => differenceInCalendarDays(selectedDay, day) === 0);
  };

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
        const response = await axios.get(`http://localhost:8080/vacaciones/buscarid/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, []);

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
        const response = await axios.get(`http://localhost:8080/vacaciones/usuario/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Debug: Verificar los datos de la API
        console.log("Datos de la API:", response.data);

        const vacationDaysArray = response.data.flatMap(({ fecha_inicio, fecha_fin }) => {
          if (!fecha_inicio || !fecha_fin) {
            console.error("Fecha inválida recibida:", { fecha_inicio, fecha_fin });
            return [];
          }

          const start = new Date(fecha_inicio);
          const end = new Date(fecha_fin);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error("Fecha inválida recibida:", { fecha_inicio, fecha_fin });
            return [];
          }

          return eachDayOfInterval({
            start,
            end,
          });
        });

        setSelectedDays(vacationDaysArray);
        setVacationRequests(response.data);
      } catch (error) {
        console.error("Error al obtener solicitudes de vacaciones:", error);

        if (error.response && error.response.status === 403) {
          setError("No tienes permisos para acceder a estas solicitudes.");
        } else {
          setError("No se pudieron cargar las solicitudes de vacaciones.");
        }
      }
    };

    fetchVacationRequests();
  }, []);

  return (
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
        <div className="calendar-container">
          <div className={`calendar-card ${error ? "calendar-error" : ""}`}>
            <h1 className="calendar-title">Bienvenido, {userName || "Usuario"}</h1>
            <p className="calendar-text">
              Fecha de ingreso: {joinDate ? new Date(joinDate).toLocaleDateString("es-ES") : "Cargando..."}
            </p>
            <p className="calendar-text">
              Total de días de vacaciones disponibles: {vacationDays || "Cargando..."}
            </p>

            {error && <p className="calendar-error-message">{error}</p>}

            <div className="button-container">
              <button className="calendar-button" onClick={() => navigate("/NuevaSolicitud")}>
                Solicitar
              </button>
              <button
                  className="calendar-button"
                  onClick={() => navigate(`/SolicitudDetalle/${getUsuarioId()}`)}
              >
                Ver Solicitudes
              </button>
            </div>

            <div className="calendar-pickers-container">
              {[0, 1].map((monthOffset) => (
                  <StaticDatePicker
                      key={monthOffset}
                      displayStaticWrapperAs="desktop"
                      defaultCalendarMonth={
                        new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset)
                      }
                      value={null}
                      shouldDisableDate={shouldDisableDate}
                      renderDay={(day, _value, DayComponentProps) => {
                        const isDayInRange = isInRange(day);
                        return (
                            <Badge
                                key={day.toString()}
                                overlap="circular"
                                badgeContent={isDayInRange ? <CheckIcon color="primary" /> : undefined}
                            >
                              <PickersDay {...DayComponentProps} selected={isDayInRange} />
                            </Badge>
                        );
                      }}
                  />
              ))}
            </div>
          </div>
        </div>
      </LocalizationProvider>
  );
};

export default Home;
