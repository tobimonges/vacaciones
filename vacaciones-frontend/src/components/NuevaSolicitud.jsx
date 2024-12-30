// src/components/NuevaSolicitud.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import "./NuevaSolicitud.css"; // Asegúrate de que este archivo existe y tiene estilos adecuados
import "dayjs/locale/es";

const today = dayjs(); // Fecha actual

const isWeekend = (date) => {
  const day = date.day();
  return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
};

// Lista de fechas específicas deshabilitadas (feriados, eventos, etc.)
const disabledDates = [
  dayjs("2024-12-25"), // Navidad
  dayjs("2025-01-01"), // Año Nuevo
];

const isDisabledDate = (date) => {
  return disabledDates.some((disabledDate) => date.isSame(disabledDate, "day"));
};

function countValidDays(start, end) {
  // Si alguna de las fechas es null, retornamos 0
  if (!start || !end) return 0;

  // Si la fecha de fin es anterior a la de inicio, retornamos 0
  if (end.isBefore(start, "day")) return 0;

  let count = 0;
  let currentDate = start.clone();

  // Mientras currentDate <= endDate
  while (currentDate.isSame(end, "day") || currentDate.isBefore(end, "day")) {
    if (!isWeekend(currentDate) && !isDisabledDate(currentDate)) {
      count++;
    }
    // Avanzamos un día
    currentDate = currentDate.add(1, "day");
  }
  return count;
}
export default function NuevaSolicitud() {
  const usuarioId = 3; // ID del usuario autenticado
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null); // Inicialmente sin fecha seleccionada
  const [validDays, setValidDays] = useState(0);
  const [diasVacacionesDisponibles, setDiasVacacionesDisponibles] =
    useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState(""); // Mensaje de advertencia para validación
  const navigate = useNavigate();

  // Calcular días válidos cada vez que cambien las fechas
  useEffect(() => {
    const days = countValidDays(startDate, endDate);
    setValidDays(days);

    // Verificar si los días seleccionados exceden los disponibles
    if (
      diasVacacionesDisponibles !== null &&
      days > diasVacacionesDisponibles
    ) {
      setWarning("No puedes seleccionar más días de los disponibles.");
    } else {
      setWarning(""); // Limpiar la advertencia si es válido
    }
  }, [startDate, endDate, diasVacacionesDisponibles]);

  // Obtener días de vacaciones disponibles desde el backend
  useEffect(() => {
    const fetchDiasVacaciones = async () => {
      try {
        const urlBase = `http://localhost:8080/vacaciones/diasdisponiblesid/${usuarioId}`;
        const auth = {
          username: "admin@empresa.com",
          password: "admin123",
        };
        const response = await axios.get(urlBase, { auth });
        setDiasVacacionesDisponibles(response.data);
      } catch (err) {
        console.error("Error al obtener días de vacaciones disponibles:", err);
        setError("No se pudo obtener la información de días de vacaciones.");
      }
    };

    fetchDiasVacaciones();
  }, [usuarioId]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (validDays > diasVacacionesDisponibles) {
      setError("No puedes seleccionar más días de los disponibles.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Por favor, selecciona ambas fechas.");
      return;
    }

    // Construir el objeto solicitud
    const solicitud = {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      estado: false,
    };

    try {
      const urlBase = `http://localhost:8080/vacaciones/solicitudes/${usuarioId}`;
      const auth = {
        username: "admin@empresa.com",
        password: "admin123",
      };
      await axios.post(urlBase, solicitud, { auth });
      navigate("/NuevaSolicitud");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
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
