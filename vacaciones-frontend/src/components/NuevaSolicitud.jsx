import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import "./NuevaSolicitud.css";
import { getUsuarioId, getUserRole } from "./authUtils";
import Logo from "./Logo";


import Preloader from "./Preloader";

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
  const [reservedDates, setReservedDates] = useState([]);
  const [lideres, setLideres] = useState([]); // Lista de líderes
  const [selectedLideres, setSelectedLideres] = useState([null]); // Líder seleccionado
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();
  const userRole = getUserRole();
<<<<<<< HEAD
  const [file, setFile] = useState(null); // Nuevo estado para el archivo
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // Success, Error, Warning
=======
  const [file, setFile] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const handleAddLiderSelector = () => {
    if (selectedLideres.length < 3) {
      setSelectedLideres([...selectedLideres, null]);
    }
  };

  const handleLiderChange = (value, index) => {
    const newSelectedLideres = [...selectedLideres];
    newSelectedLideres[index] = parseInt(value, 10);
    setSelectedLideres(newSelectedLideres);
  };
>>>>>>> develop

  useEffect(() => {
    if (mensaje) {
      // Ocultar el mensaje automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        setMensaje("");
        setTipoMensaje("");
      }, 3000);
  
      return () => clearTimeout(timer); // Limpiar el temporizador en caso de que el componente se desmonte
    }
  }, [mensaje]);

  
  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
       //   setError("No se encontró un token. Inicia sesión nuevamente.");
          setMensaje("No se encontró un token. Inicia sesión nuevamente.");
          setTipoMensaje("Error");
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
       // setError("No se pudo obtener la información de las solicitudes.");
        setMensaje("No se pudo obtener la información de las solicitudes.");
        setTipoMensaje("Error");
      }
    };

    fetchReservedDates();
  }, [usuarioId]);

  useEffect(() => {
    const fetchDiasDisponibles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
      //    setError("No se encontró un token. Inicia sesión nuevamente.");
          setMensaje("No se encontró un token. Inicia sesión nuevamente.");
          setTipoMensaje("Error");
          return;
        }

        const url = `http://localhost:8080/vacaciones/diasdisponiblesid/${usuarioId}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDiasVacacionesDisponibles(response.data);
      } catch (err) {
        console.error("Error al obtener días de vacaciones disponibles:", err);
     //   setError("No se pudo obtener la información de días de vacaciones.");
        setMensaje("No se pudo obtener la información de días de vacaciones.");
        setTipoMensaje("Error");
      }
    };

    fetchDiasDisponibles();
  }, [usuarioId]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/vacaciones/listarusuarios",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const usuarios = response.data;

        // Validar usuarios según el rol del usuario logueado
        let usuariosFiltrados = [];

        switch (userRole) {
          case "FUNCIONARIO_FABRICA":
            usuariosFiltrados = usuarios.filter((usuario) =>
              ["LIDER", "OPERACIONES", "DIRECTORIO"].includes(
                usuario.rol.nombre
              )
            );
            break;

          case "FUNCIONARIO_TERCERIZADO":
            usuariosFiltrados = usuarios.filter((usuario) =>
              ["OPERACIONES", "DIRECTORIO"].includes(usuario.rol.nombre)
            );
            break;

          case "TH":
            usuariosFiltrados = usuarios.filter((usuario) =>
              ["OPERACIONES", "DIRECTORIO"].includes(usuario.rol.nombre)
            );
            break;

          case "OPERACIONES":
            usuariosFiltrados = usuarios.filter(
              (usuario) => usuario.rol.nombre === "DIRECTORIO"
            );
            break;

          case "LIDER":
            usuariosFiltrados = usuarios.filter((usuario) =>
              ["OPERACIONES", "DIRECTORIO"].includes(usuario.rol.nombre)
            );
            break;

          case "DIRECTORIO":
            throw new Error(
              "El rol DIRECTORIO no selecciona un líder. Por favor, revisa tu configuración."
            );

          default:
            throw new Error(
              "Rol no soportado para la creación de solicitudes. Contacta al administrador."
            );
        }

        // Excluir al usuario logueado de la lista
        usuariosFiltrados = usuariosFiltrados.filter(
          (usuario) => usuario.id !== usuarioId
        );

        setLideres(usuariosFiltrados);
      } catch (err) {
<<<<<<< HEAD
        console.error("Error al obtener líderes:", err);
      //  setError("No se pudo obtener la información de los líderes.");
        setMensaje("No se pudo obtener la información de los líderes.");
        setTipoMensaje("Error");
=======
        console.error("Error al obtener usuarios:", err);
        setError("No se pudo obtener la información de los usuarios.");
>>>>>>> develop
      }
    };

    fetchUsuarios();
  }, [userRole, usuarioId]);

  useEffect(() => {
    const days = countValidDays(startDate, endDate, reservedDates);
    setValidDays(days);

    if (
      diasVacacionesDisponibles !== null &&
      days > diasVacacionesDisponibles
    ) {
    //  setWarning("No puedes seleccionar más días de los disponibles.");
      setMensaje("No puedes seleccionar más días de los disponibles.");
      setTipoMensaje("Warning");
    } else {
      setWarning("");
    }
  }, [startDate, endDate, diasVacacionesDisponibles, reservedDates]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guardar el archivo seleccionado

    const fileNameSpan = document.getElementById("file-name");
    if (e.target.files.length > 0) {
      fileNameSpan.textContent = "Archivo adjuntado";
    } else {
      fileNameSpan.textContent = "Seleccionar adjunto"; // Texto predeterminado si no hay archivo
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

<<<<<<< HEAD
    if (!startDate || !endDate || !selectedLider) {
   //   setError("Por favor, selecciona ambas fechas y un líder.");
      setMensaje("Por favor, selecciona ambas fechas y un líder.");
      setTipoMensaje("Error");
=======
    if (!startDate || !endDate || !selectedLideres) {
      setError("Por favor, selecciona ambas fechas y por lo menos un lider.");
>>>>>>> develop
      return;
    }

    const solicitud = {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      liderIds: selectedLideres.filter((lider) => lider !== null), // Filtrar valores nulos
      cantidadDias: validDays,
    };

    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:8080/vacaciones/solicitudes/dto/${usuarioId}`;
      const solicitudResponse = await axios.post(url, solicitud, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const solicitudId = solicitudResponse.data.id; // Obtener ID de la solicitud creada

      // Subir archivo si existe
      if (file) {
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("idSolicitud", solicitudId);

        await axios.post(
          "http://localhost:8080/vacaciones/documentos/subir",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

   //   alert("Carga de solicitud exitosa");
      setMensaje("Carga de solicitud exitosa");
      setTipoMensaje("Success");
      navigate("/Home");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
    //    setError("Error al crear la solicitud.");
        setMensaje("Error al crear la solicitud.");
        setTipoMensaje("Error");
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Preloader duration={650} />
      <div className="container">
        <div className="DatePicker">
          <Logo />
          <h2>Nueva Solicitud</h2>
          {mensaje && (
  <div className={`MensajePopuppNS ${tipoMensaje}`}>
    <p>{mensaje}</p>
  </div>
)}

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
            {selectedLideres.map((selectedLider, index) => (
              <div
                className={`mb-3-lideres ${
                  index !== selectedLideres.length - 1 ||
                  selectedLideres.length === 3
                    ? "flex-column"
                    : ""
                }`}
                key={index}
              >
                <select
                  value={selectedLider || ""}
                  onChange={(e) => handleLiderChange(e.target.value, index)}
                  className="select-usuarios"
                >
                  <option value="" disabled>
                    Selecciona un líder
                  </option>
                  {lideres
                    .filter(
                      (lider) =>
                        !selectedLideres.includes(lider.id) || // Permitir líderes no seleccionados
                        selectedLider === lider.id // Mantener el líder previamente seleccionado
                    )
                    .map((lider) => (
                      <option key={lider.id} value={lider.id}>
                        {lider.nombre} {lider.apellido}
                      </option>
                    ))}
                </select>
                {index === selectedLideres.length - 1 &&
                  selectedLideres.length < 3 && (
                    <div onClick={handleAddLiderSelector}>
                      <img
                        src="./public/yamada-btn.png"
                        alt="Añadir líder"
                        title="Añadir líder"
                      />
                    </div>
                  )}
              </div>
            ))}

            {userRole === "FUNCIONARIO_TERCERIZADO" && (
              <div className="mb-3">
                <p htmlFor="file">Adjuntar aprobación de vacación:</p>
                <div className="file-upload-container">
                  <label htmlFor="file" className="file-upload-label">
                    <img
                      src="./public/clip-vertical.svg"
                      alt="Subir archivo"
                      className="file-upload-image"
                    />

                    <input
                      type="file"
                      id="file"
                      className="inputFile"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    <span id="file-name" className="file-name">
                      Seleccionar adjunto
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="buttons">
              <button className="btn" onClick={() => navigate("/Home")}>
                <span>Volver a Home</span>
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  validDays > diasVacacionesDisponibles || !selectedLideres
                }
              >
                <span>Crear Solicitud</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
}
