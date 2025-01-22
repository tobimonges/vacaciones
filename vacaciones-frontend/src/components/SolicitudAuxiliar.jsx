import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import "./NuevaSolicitud.css";
import "./SolicitudAuxiliar.css";
import "./AdminDashboard.css";
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validDays, setValidDays] = useState(0);
  const [diasVacacionesDisponibles, setDiasVacacionesDisponibles] =
    useState(null);
  const [reservedDates, setReservedDates] = useState([]);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [Usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const usuarioId = selectedUserId;
  const [filterText, setFilterText] = useState("");
  const userRole = getUserRole();
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

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
    const fetchUsuarios = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          "http://localhost:8080/vacaciones/listarusuarios",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsuarios(response.data);
        setFilteredUsuarios(response.data);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err.message || err);
        setError("No se pudieron cargar las solicitudes.");
      }
    };

    fetchUsuarios();
  }, []);

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

  const openModal = () => {
    setShowModal(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
  };

  const handleUsers = () => {
    openModal(); // Abrir el modal al seleccionar usuario
  };

  const handleUserSelection = (id) => {
    setSelectedUserId(id); // Actualiza el estado con el ID del usuario seleccionado
    closeModal(); // Cierra el modal al seleccionar un usuario
    console.log("Usuario seleccionado con ID:", id); // Para depuración
  };

  const handleFilterChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setFilterText(searchText);

    const filtered = Usuarios.filter((usuario) => {
      const nroCedula = usuario.nroCedula.toString();
      const fullName = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
      const equipo = `${usuario.equipo.nombre}`.toLowerCase();
      return (
        nroCedula.includes(searchText) ||
        fullName.includes(searchText) ||
        equipo.includes(searchText)
      );
    });

    setFilteredUsuarios(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      // setError("Por favor, selecciona ambas fechas y por lo menos un lider.");
      setMensaje("Por favor, selecciona ambas fechas");
      setTipoMensaje("Error");
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
      await axios.post(url, solicitud, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //   alert("Carga de solicitud exitosa");
      setMensaje("Carga de solicitud exitosa");
      setTipoMensaje("Success");
      setTimeout(() => {
        navigate("/Home");
      }, 1500);
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
      <div className="nueva-solicitud-container">
        <div className="DatePicker">
          <Logo />
          <h2>Solicitud Auxiliar</h2>
          {mensaje && (
            <div className={`MensajePopuppNS ${tipoMensaje}`}>
              <p>{mensaje}</p>
            </div>
          )}

          <div className="info-cards" style={{ display: "flex", gap: "15px" }}>
            <div className="info-card">
              <p className="info-number">{diasVacacionesDisponibles ?? 0}</p>
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
            <div className="mb-3-auxiliar">
              <p>Seleccionar usuario:</p>
              <div className="userSelector-container">
                <div className="user-item" onClick={handleUsers}>
                  <img
                    src="./public/avatar.svg"
                    alt="Usuario"
                    className="user-image"
                  />
                  <span className="user-name">Seleccione un usuario</span>
                </div>
              </div>
            </div>

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

            <div className="buttons">
              <button className="btn" onClick={() => navigate("/Home")}>
                <span>Volver a Home</span>
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={validDays > diasVacacionesDisponibles}
              >
                <span>Crear Solicitud</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modalAuxiliar">
          <div className="modalAuxiliar-content">
            <div className="header-title-container">
              <div className="space"></div>
              <h4>Seleccion de Usuarios</h4>
              <div className="filter-container">
                <label htmlFor="filter-input" className="filter-label">
                  Buscar:
                </label>
                <input
                  id="filter-input"
                  type="text"
                  placeholder="Ingrese un campo"
                  value={filterText}
                  onChange={handleFilterChange}
                  className="inputCreate"
                />
              </div>
            </div>
            <div className="content-section">
              {error ? (
                <p className="error">{error}</p>
              ) : Usuarios.length === 0 ? (
                <p>No hay usuarios que coincidan con el filtro.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cédula</th>
                      <th>Usuario</th>
                      <th>Equipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((usuario) => (
                      <tr
                        key={usuario.nroCedula}
                        onClick={() => handleUserSelection(usuario.id)} // Asume que "id" es la propiedad con el identificador único
                        style={{ cursor: "pointer" }} // Cambia el cursor para indicar que es clickeable
                      >
                        <td>
                          {new Intl.NumberFormat("es-ES").format(
                            usuario.nroCedula
                          )}
                        </td>
                        <td>{usuario.nombre + " " + usuario.apellido}</td>
                        <td>{usuario.equipo.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <br />
            <br />
            <div className="modalAuxiliar-buttons">
              <button onClick={closeModal} className="btn-cancel">
                <span>Volver a Home</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </LocalizationProvider>
  );
}
