// src/components/NuevaSolicitud.jsx

import React, { useState, useEffect } from "react";
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
  //  const { usuario } = useAuth(); // Obtener el usuario desde el contexto de autenticación //////////////////////////////////////
  const usuarioId = 3; // Asegúrate de que el usuario esté autenticado y tenga un ID //////////////////////////////////
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null); // Inicialmente sin fecha seleccionada
  const [validDays, setValidDays] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Calcular días válidos cada vez que cambian las fechas
  useEffect(() => {
    const days = countValidDays(startDate, endDate);
    setValidDays(days);
  }, [startDate, endDate]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!usuarioId) {
      setError("Usuario no autenticado.");
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
      //diasSeleccionados: validDays,
    };

    try {
      // URL del backend para crear una nueva solicitud, incluyendo usuarioId en el path
      const urlBase = `http://localhost:8080/vacaciones/solicitudes/${usuarioId}`; // Aquí incluimos el usuarioId en el path
      // Agregar credenciales para autenticación básica
      const auth = {
        username: "admin@empresa.com", // Reemplaza con tu nombre de usuario
        password: "admin123", // Reemplaza con tu contraseña
      };
      // Realizar la solicitud POST con autenticación básica
      await axios.post(urlBase, solicitud, {
        auth, // Agregamos las credenciales de autenticación básica
      });
      // Redirigir a la lista de solicitudes después de crear
      navigate("/");
    } catch (err) {
      // Manejo de errores
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        console.log(solicitud);
        setError("Error al crear la solicitud.");
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <div className="container">
        <div className="DatePicker">
          <h4>Nueva Solicitud</h4>
          {error && <p className="error">{error}</p>}
          <p>Tienes seleccionados {validDays} día(s)</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <DatePicker
                label="Fecha de inicio"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  // Resetear la fecha de fin si es anterior a la nueva fecha de inicio
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
                    date.isBefore(today, "day") || // No puede ser antes de hoy
                    isWeekend(date) || // No puede ser fin de semana
                    isDisabledDate(date) // No puede ser una fecha deshabilitada
                  );
                }}
                format="YYYY-MM-DD"
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
                    (startDate && date.isBefore(startDate, "day")) || // No puede ser anterior a la fecha de inicio
                    isWeekend(date) || // No puede ser fin de semana
                    isDisabledDate(date) // No puede ser una fecha deshabilitada
                  );
                }}
                format="YYYY-MM-DD"
                disabled={!startDate} // Deshabilita si no hay fecha de inicio seleccionada
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
            <button type="submit" className="btn btn-primary">
              Crear Solicitud
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
}
