import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import "./NuevaSolicitud.css";
import { getUsuarioId } from "./authUtils"; // Helper para obtener usuarioId
import LogoutButton from "./LogoutButton"; // Importar el componente del botón

const today = dayjs();
const isWeekend = (date) => date.day() === 0 || date.day() === 6;
const disabledDates = [dayjs("2024-12-25"), dayjs("2025-01-01")];

function countValidDays(start, end, reservedDates = []) {
  if (!start || !end) return 0;
  if (end.isBefore(start, "day")) return 0;

  let count = 0;
  let currentDate = start.clone();
  while (currentDate.isSame(end, "day") || currentDate.isBefore(end, "day")) {
    if (
      !isWeekend(currentDate) &&
      !disabledDates.some((d) => currentDate.isSame(d, "day")) &&
      !reservedDates.some((d) => currentDate.isSame(d, "day"))
    ) {
      count++;
    }
    currentDate = currentDate.add(1, "day");
  }
  return count;
}

export default function NuevaSolicitud() {
  const usuarioId = getUsuarioId();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validDays, setValidDays] = useState(0);
  const [diasVacacionesDisponibles, setDiasVacacionesDisponibles] =
    useState(null);
  const [reservedDates, setReservedDates] = useState([]); // Fechas ya reservadas
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token. Inicia sesión nuevamente.");
          return;
        }

        const url = `http://localhost:8080/vacaciones/usuario/${usuarioId}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dates = response.data.flatMap((solicitud) => {
          const start = dayjs(solicitud.fechaInicio);
          const end = dayjs(solicitud.fechaFin);
          const range = [];
          let currentDate = start.clone();
          while (
            currentDate.isSame(end, "day") ||
            currentDate.isBefore(end, "day")
          ) {
            range.push(currentDate.clone());
            currentDate = currentDate.add(1, "day");
          }
          return range;
        });

        setReservedDates(dates);
      } catch (err) {
        console.error("Error al obtener fechas reservadas:", err);
        setError("No se pudo obtener la información de las solicitudes.");
      }
    };

    fetchReservedDates();
  }, [usuarioId]);

  useEffect(() => {
    const fetchDiasDisponibles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token. Inicia sesión nuevamente.");
          return;
        }

        const url = `http://localhost:8080/vacaciones/diasdisponiblesid/${usuarioId}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDiasVacacionesDisponibles(response.data);
      } catch (err) {
        console.error("Error al obtener días de vacaciones disponibles:", err);
        setError("No se pudo obtener la información de días de vacaciones.");
      }
    };

    fetchDiasDisponibles();
  }, [usuarioId]);

  useEffect(() => {
    const days = countValidDays(startDate, endDate, reservedDates);
    setValidDays(days);

    if (
      diasVacacionesDisponibles !== null &&
      days > diasVacacionesDisponibles
    ) {
      setWarning("No puedes seleccionar más días de los disponibles.");
    } else {
      setWarning("");
    }
  }, [startDate, endDate, diasVacacionesDisponibles, reservedDates]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Por favor, selecciona ambas fechas.");
      return;
    }

    if (startDate.isBefore(today, "day")) {
      setError("La fecha de inicio no puede ser anterior a la fecha actual.");
      return;
    }

    if (endDate.isBefore(startDate, "day")) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    if (validDays > diasVacacionesDisponibles) {
      setError("No puedes seleccionar más días de los disponibles.");
      return;
    }

    const solicitud = {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      estado: false,
    };

    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:8080/vacaciones/solicitudes/${usuarioId}`;
      await axios.post(url, solicitud, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Carga de solicitud exitosa");
      navigate("/Home");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al crear la solicitud.");
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <div className="container">
        <LogoutButton /> {/* Botón de cierre de sesión */}
        <div className="DatePicker">
          <h2>Nueva Solicitud</h2>
          <div className="info-cards" style={{ display: "flex", gap: "15px" }}>
            <div className="info-card">
              <p className="info-number">{diasVacacionesDisponibles}</p>
              <h3>Días Disponibles</h3>
            </div>
            <div className="info-card">
              <p className="info-number">{validDays}</p>
              <h3>Días de Vacaciones</h3>
            </div>
          </div>
          {warning && <p className="warning">{warning}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <DatePicker
                label="Fecha de inicio"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  if (
                    endDate &&
                    newValue &&
                    endDate.isBefore(newValue, "day")
                  ) {
                    setEndDate(null);
                  }
                }}
                shouldDisableDate={(date) => {
                  return (
                    date.isBefore(today, "day") ||
                    isWeekend(date) ||
                    disabledDates.some((d) => date.isSame(d, "day")) ||
                    reservedDates.some((d) => date.isSame(d, "day"))
                  );
                }}
              />
            </div>
            <div className="mb-3">
              <DatePicker
                label="Fecha de fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                shouldDisableDate={(date) => {
                  return (
                    (startDate && date.isBefore(startDate, "day")) ||
                    isWeekend(date) ||
                    disabledDates.some((d) => date.isSame(d, "day")) ||
                    reservedDates.some((d) => date.isSame(d, "day"))
                  );
                }}
                disabled={!startDate}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={validDays > diasVacacionesDisponibles}
            >
              Crear Solicitud
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
}
