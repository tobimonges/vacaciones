import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./NuevaSolicitud"; // Importa el archivo CSS
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

export default function DateRangeValidationWithDisabledDates() {
  const [startDate, setStartDate] = React.useState(today);
  const [endDate, setEndDate] = React.useState(today.add(7, "day"));

  const validDays = countValidDays(startDate, endDate);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <div className="container">
        <div className="DatePicker">
          <h4>Nueva Solicitud</h4>
          <p>Tienes seleccionados {validDays} día(s)</p>
          <DatePicker
            label="Fecha de inicio"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            shouldDisableDate={(date) => {
              return (
                date.isBefore(today, "day") || // No puede ser antes de hoy
                isWeekend(date) || // No puede ser fin de semana
                isDisabledDate(date) // No puede ser una fecha deshabilitada
              );
            }}
            format="DD/MM/YYYY"
          />
          <DatePicker
            label="Fecha de fin"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            shouldDisableDate={(date) => {
              return (
                date.isBefore(startDate, "day") || // No puede ser anterior a la fecha de inicio
                isWeekend(date) || // No puede ser fin de semana
                isDisabledDate(date) // No puede ser una fecha deshabilitada
              );
            }}
            format="DD/MM/YYYY"
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}
