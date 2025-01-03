import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import "./NuevaSolicitud.css";
import { getUsuarioId } from "./authUtils";
import LogoutButton from "./LogoutButton";

const today = dayjs();
const isWeekend = (date) => date.day() === 0 || date.day() === 6;
const disabledDates = [dayjs("2024-12-25"), dayjs("2025-01-01")];

export default function NuevaSolicitud() {
  const usuarioId = getUsuarioId();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lideres, setLideres] = useState([]); // Lista de líderes
  const [selectedUsuario, setSelectedUsuario] = useState(""); // Líder seleccionado
  const [diasVacacionesDisponibles, setDiasVacacionesDisponibles] =
    useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener líderes
    const fetchLideres = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró un token. Inicia sesión nuevamente.");
          return;
        }

        const response = await axios.get(
          "http://localhost:8080/vacaciones/lideres",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLideres(response.data); // Guardar líderes en el estado
      } catch (err) {
        console.error("Error al obtener los líderes:", err);
        setError("No se pudo obtener la información de los líderes.");
      }
    };

    fetchLideres();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !selectedUsuario) {
      setError("Por favor, selecciona ambas fechas y un líder.");
      return;
    }

    const solicitud = {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      usuarioId: selectedUsuario,
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
        <LogoutButton />
        <div className="DatePicker">
          <h2>Nueva Solicitud</h2>
          <div className="info-cards" style={{ display: "flex", gap: "15px" }}>
            <div className="info-card">
              <p className="info-number">{diasVacacionesDisponibles}</p>
              <h3>Días Disponibles</h3>
            </div>
          </div>
          {warning && <p className="warning">{warning}</p>}
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <DatePicker
                label="Fecha de inicio"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
              />
            </div>
            <div className="mb-3">
              <DatePicker
                label="Fecha de fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                disabled={!startDate}
              />
            </div>
            <div className="mb-3">
              <select
                value={selectedUsuario}
                onChange={(e) => setSelectedUsuario(e.target.value)}
                className="select-usuarios"
              >
                <option value="" disabled>
                  Selecciona un líder
                </option>
                {lideres.map((lider) => (
                  <option key={lider.id} value={lider.id}>
                    {lider.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!startDate || !endDate || !selectedUsuario}
            >
              Crear Solicitud
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
}
