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

const today = dayjs();
const isWeekend = (date) => date.day() === 0 || date.day() === 6;
const disabledDates = [dayjs("2024-12-25"), dayjs("2025-01-01")];
const isDisabledDate = (date) =>
  disabledDates.some((disabledDate) => date.isSame(disabledDate, "day"));

function countValidDays(start, end) {
  if (!start || !end) return 0;
  if (end.isBefore(start, "day")) return 0;

  let count = 0;
  let currentDate = start.clone();
  while (currentDate.isSame(end, "day") || currentDate.isBefore(end, "day")) {
    if (!isWeekend(currentDate) && !isDisabledDate(currentDate)) {
      count++;
    }
    currentDate = currentDate.add(1, "day");
  }
  return count;
}

export default function NuevaSolicitud() {
  const usuarioId = getUsuarioId();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);
  const [validDays, setValidDays] = useState(0);
  const [diasVacacionesDisponibles, setDiasVacacionesDisponibles] =
    useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const days = countValidDays(startDate, endDate);
    setValidDays(days);

    if (
      diasVacacionesDisponibles !== null &&
      days > diasVacacionesDisponibles
    ) {
      setWarning("No puedes seleccionar más días de los disponibles.");
    } else {
      setWarning("");
    }
  }, [startDate, endDate, diasVacacionesDisponibles]);

  useEffect(() => {
    const fetchDiasVacaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token. Inicia sesión nuevamente.");
          return;
        }

        const urlBase = `http://localhost:8080/vacaciones/diasdisponiblesid/${usuarioId}`;
        const response = await axios.get(urlBase, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDiasVacacionesDisponibles(response.data);
      } catch (err) {
        console.error("Error al obtener días de vacaciones disponibles:", err);
        setError("No se pudo obtener la información de días de vacaciones.");
      }
    };

    fetchDiasVacaciones();
  }, [usuarioId]);

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
      const urlBase = `http://localhost:8080/vacaciones/solicitudes/${usuarioId}`;
      await axios.post(urlBase, solicitud, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Carga de solicitud exitoso");
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
                    isDisabledDate(date)
                  );
                }}
                format="DD-MM-YYYY"
                renderInput={(params) => (
                  <input
                    {...params}
                    required
                    className="form-control"
                    placeholder="Selecciona la fecha de inicio"
                  />
                )}
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
                    isDisabledDate(date)
                  );
                }}
                format="DD-MM-YYYY"
                disabled={!startDate}
                renderInput={(params) => (
                  <input
                    {...params}
                    required
                    className="form-control"
                    placeholder="Selecciona la fecha de fin"
                  />
                )}
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
