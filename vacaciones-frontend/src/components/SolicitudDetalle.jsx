import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getUsuarioId, getUserRole } from "./authUtils";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "./Solicitud.css";
import Logo from "./Logo";
import Logogiratorio from "./logogiratorio";

function isWeekend(date) {
  return date.day() === 0 || date.day() === 6;
}

function countValidDays(start, end, reservedDates, disabledDates) {
  if (!start || !end) return 0;
  if (end.isBefore(start, "day")) return 0;

  let count = 0;
  let currentDate = start.clone();

  while (currentDate.isSame(end, "day") || currentDate.isBefore(end, "day")) {
    if (
      !isWeekend(currentDate) &&
      !reservedDates.some((reserved) => currentDate.isSame(reserved, "day")) &&
      !disabledDates.some((disabled) => currentDate.isSame(disabled, "day"))
    ) {
      count++;
    }
    currentDate = currentDate.add(1, "day");
  }
  return count;
}

// Componente de notificación
function Notificacion({ mensaje, tipo, onClose }) {
  if (!mensaje) return null;

  return (
    <div className={`MensajePopuppNS ${tipo}`} onAnimationEnd={onClose}>
      {mensaje}
    </div>
  );
}

export default function SolicitudDetalle() {
  const usuarioId = getUsuarioId();
  const { id } = useParams(); // ID del usuario
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]); // Lista de solicitudes
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null); // ID de la solicitud que se está editando
  const [nuevaFechaInicio, setNuevaFechaInicio] = useState(null);
  const [nuevaFechaFin, setNuevaFechaFin] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [lideres, setLideres] = useState([]);
  const [reservedDates, setReservedDates] = useState([]);
  const [diasVacacionesDisponibles, setDiasVacacionesDisponibles] = useState(null);
  const [selectedLideres, setSelectedLideres] = useState([null]); // Líder seleccionado
  const userRole = getUserRole();
  const [mensaje, setMensaje] = useState(""); // Mensaje de notificación
  const [tipoMensaje, setTipoMensaje] = useState(""); // Tipo de notificación


  const disabledDates = [dayjs("2024-12-25"), dayjs("2025-01-01")]; 

  const mostrarNotificacion = (mensaje, tipo) => {
    setMensaje(mensaje);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(""), 5000);
  };


  const handleAddLiderSelector = () => {
    if (selectedLideres.length < 3) {
      setSelectedLideres([...selectedLideres, null]);
    }
  };

  const handleDeleteSelector = (index) => {
    setSelectedLideres((prevSelectedLideres) =>
      prevSelectedLideres.filter((_, i) => i !== index)
    );
  };

  const handleLiderChange = (value, index) => {
    const newSelectedLideres = [...selectedLideres];
    newSelectedLideres[index] = parseInt(value, 10);
    setSelectedLideres(newSelectedLideres);
  };

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          mostrarNotificacion("No estás autenticado. Por favor, inicia sesión.", "Error");
          navigate("/");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/vacaciones/usuario/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.status === 200) {
          setSolicitudes(response.data); // Guardar las solicitudes obtenidas
        } else {
          mostrarNotificacion("No se pudieron obtener las solicitudes.", "Error");
        }
      } catch (error) {
        console.error("Error obteniendo las solicitudes:", error);
        mostrarNotificacion("Error al conectar con el servidor.", "Error");
      }
    };

    fetchSolicitudes();
  }, [id, navigate]);

  useEffect(() => {
    const fetchLideres = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/vacaciones/lideres",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLideres(response.data);
      } catch (err) {
        console.error("Error al obtener líderes:", err);
        mostrarNotificacion("No se pudo obtener la información de los líderes.", "Error");
      }
    };

    fetchLideres();
  }, []);

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

        if (userRole === "DIRECTORIO") {
          setLideres(null); // Configurar lideres como null
          return; // Finalizar la función
        }

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
        console.error("Error al obtener usuarios:", err);
       // setError("No se pudo obtener la información de los usuarios.");
        setMensaje("No se pudo obtener la información de los usuarios.");
        setTipoMensaje("Error");
      }
    };

    fetchUsuarios();
  }, [userRole, usuarioId]);

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/vacaciones/usuario/${usuarioId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReservedDates(response.data.map((date) => dayjs(date)));
      } catch (err) {
        console.error("Error obteniendo fechas reservadas:", err);
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

  const shouldDisableDate = (date) => {
    return (
      date.isBefore(dayjs(), "day") ||
      isWeekend(date) ||
      disabledDates.some((disabled) => date.isSame(disabled, "day")) ||
      reservedDates.some((reserved) => date.isSame(reserved, "day"))
    );
  };

  const handleEditar = (solicitud) => {
    if (solicitud.numeroaprobaciones > 0 && solicitud.estado) {
      alert("Esta solicitud no se puede editar porque ya tiene aprobaciones y está confirmada.");
      return;
    }
    setEditando(solicitud.id);
    setNuevaFechaInicio(dayjs(solicitud.fechaInicio));
    setNuevaFechaFin(dayjs(solicitud.fechaFin));
  };

  const handleGuardar = async (solicitudId) => {
    try {
      const token = localStorage.getItem("token");
      if (!nuevaFechaInicio || !nuevaFechaFin) {
        mostrarNotificacion("Por favor, selecciona ambas fechas.", "Error");
        return;
      }

      const cantidadDias = countValidDays(
        nuevaFechaInicio,
        nuevaFechaFin,
        reservedDates,
        disabledDates
      );

      if (cantidadDias > diasVacacionesDisponibles) {
        mostrarNotificacion("No tienes suficientes días de vacaciones disponibles.", "Error");
        return;
      }

      const actualizarSolicitud = {
        fechaInicio: nuevaFechaInicio.format("YYYY-MM-DD"),
        fechaFin: nuevaFechaFin.format("YYYY-MM-DD"),
        liderIds: selectedLideres.filter((lider) => lider !== null),
        cantidadDias: cantidadDias
      };
      console.log(actualizarSolicitud);
      await axios.put(
        `http://localhost:8080/vacaciones/solicitudes/${solicitudId}`,
        actualizarSolicitud,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const response = await axios.get(
        `http://localhost:8080/vacaciones/usuario/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSolicitudes(response.data);
      }

      setEditando(null);
      mostrarNotificacion("Solicitud actualizada correctamente.", "Success");
    } catch (error) {
      console.error("Error al actualizar la solicitud:", error);
      mostrarNotificacion("No se pudo actualizar la solicitud. Rellena todos los campos", "Error");
    }
  };

  const handleCancelar = () => {
    setEditando(null);
    setNuevaFechaInicio(null);
    setNuevaFechaFin(null);
  };

  const handleEliminar = async (solicitudId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/vacaciones/solicitudes/${solicitudId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar la lista de solicitudes
      setSolicitudes((prev) =>
        prev.filter((solicitud) => solicitud.id !== solicitudId)
      );
      mostrarNotificacion("Solicitud eliminada correctamente.", "Success");
    } catch (error) {
      console.error("Error eliminando la solicitud:", error);
      mostrarNotificacion("No se pudo eliminar la solicitud.", "Error");
    }
  };

  // Filtrar solicitudes según el estado
  const solicitudesFiltradas =
      filtro === "Todas" || !filtro
          ? solicitudes
          : solicitudes.filter((solicitud) => {
            if (filtro === "Aprobado") return solicitud.estado === true;
            if (filtro === "Pendiente") return solicitud.estado === false && !solicitud.rechazado;
            if (filtro === "Rechazado") return solicitud.rechazado === true;
            return false;
          });

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (solicitudes.length === 0) {
    return (
      <div className="container">
        <Logogiratorio duration={650} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="container-solicitudes">
          <Logo />
            <h4>Solicitudes del Usuario</h4>
            <br />
            <h4>No se encontraron solicitudes para este usuario.</h4>
            <br />
            <button className="volver-home" onClick={() => navigate("/Home")}>
              Volver al Home
            </button>
          </div>
        </LocalizationProvider>
      </div>
    );
  }

  return (
    <div className="container">
      <Notificacion mensaje={mensaje} tipo={tipoMensaje} />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" >
        <Logogiratorio duration={650} />
        <div className="container-solicitudes">
          <Logo />
          <h4>Solicitudes del Usuario</h4>
          {/* Lista desplegable para filtro */}
          {editando === null && (
              <select
                  className="select-filtro"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="Todas"> Todas</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Aprobado">Aprobados</option>
                <option value="Rechazado">Rechazados</option>
              </select>
          )}
          <ul>
            {solicitudesFiltradas.map((solicitud, index) => (
              <li key={solicitud.id}>
                {editando === solicitud.id ? (
                  <div>
                    <p>
                      <strong>Solicitud N°{index + 1}</strong>
                      <br />
                      <br />
                    </p>
                    <div className="datepicker-container">
                      <DatePicker
                        label="Fecha de inicio"
                        value={nuevaFechaInicio}
                        onChange={(newValue) => setNuevaFechaInicio(newValue)}
                        shouldDisableDate={shouldDisableDate}
                        renderInput={(params) => <input {...params} />}
                      />
                      <DatePicker
                        label="Fecha de fin"
                        value={nuevaFechaFin}
                        onChange={(newValue) => setNuevaFechaFin(newValue)}
                        shouldDisableDate={(date) =>
                          shouldDisableDate(date) ||
                          (nuevaFechaInicio && date.isBefore(nuevaFechaInicio, "day"))
                        }
                        renderInput={(params) => <input {...params} />}
                      />
                    </div>
                    {userRole !== "DIRECTORIO" &&
                      selectedLideres.map((selectedLider, index) => (
                        <div
                          className={`mb-3-lideresDetalle ${
                            index !== selectedLideres.length - 1 ||
                            selectedLideres.length === 3
                          }`}
                          key={index}
                        >
                          <select
                            value={selectedLider || ""}
                            onChange={(e) => handleLiderChange(e.target.value, index)}
                            className="select-usuariosDetalle"
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
                              <div
                                className="imagenBotonMas"
                                onClick={
                                  index === selectedLideres.length - 1 &&
                                  selectedLideres.length < 3
                                    ? handleAddLiderSelector // Agrega un nuevo selector si es el último y hay menos de 3
                                    : () => handleDeleteSelector(index) // Elimina si no es el último
                                }
                              >
                                <img
                                  src={
                                    index === selectedLideres.length - 1 &&
                                    selectedLideres.length < 3
                                      ? "/agregar.svg" // Ícono para agregar en el último selector
                                      : "/circulo-negativo.svg" // Ícono para eliminar en otros selectores
                                  }
                                  alt={
                                    index === selectedLideres.length - 1 &&
                                    selectedLideres.length < 3
                                      ? "Añadir líder"
                                      : "Eliminar líder"
                                  }
                                  title={
                                    index === selectedLideres.length - 1 &&
                                    selectedLideres.length < 3
                                      ? "Añadir líder"
                                      : "Eliminar líder"
                                  }
                                    className="imagenBotonMasDetalle-img"
                                />
                             </div>
                          </div>
                      ))}
                    <div className="buttons">
                      <button onClick={() => handleGuardar(solicitud.id)}>
                        <span>Guardar</span>
                      </button>
                      <button onClick={handleCancelar}>
                        <span>Cancelar</span>
                        </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="titulo-solicitud"><strong>Solicitud N°{index + 1}</strong></div>
                    <div className="solicitud-contenedor">
                      <div className="columna">
                        <p>
                          <strong>Fecha de inicio:</strong>{" "}
                          {dayjs(solicitud.fechaInicio).format("DD/MM/YYYY")}
                        </p>
                        <p>
                          <strong>Fecha de fin:</strong>{" "}
                          {dayjs(solicitud.fechaFin).format("DD/MM/YYYY")}
                        </p>
                        <p>
                          <strong>Cantidad de días:</strong> {solicitud.cantidadDias}
                        </p>
                      </div>
                      <div className="columna">
                        <p>
                          <strong>Estado:</strong>{" "}
                          {solicitud.rechazado ? "Rechazado" : solicitud.estado ? "Aprobado" : "Pendiente"}
                        </p>
                        <p>
                          <strong>Líderes:</strong>{" "}
                            {solicitud.lideres && solicitud.lideres.length > 0
                              ? solicitud.lideres.map((lider) => {
                                  const [primerNombre] = lider.nombre.split(" ", 1);
                                  const [primerApellido] = lider.apellido.split(" ", 1);
                                  return `${primerNombre} ${primerApellido}`;
                                }).join(", ")
                              : "Sin líderes asignados"}
                        </p> 
                        <p>
                          <strong>Comentario:</strong> {solicitud.comentario || "Sin comentario"}
                        </p>
                      </div>
                    </div>
                    <div className="buttons">
                      <button 
                        onClick={() => handleEditar(solicitud)}
                        disabled={
                          solicitud.numAprobaciones > 0 ||
                          solicitud.estado || solicitud.rechazado
                        }
                      >
                        <span>Editar</span>
                        </button>

                      <button
                        className="delete"
                        onClick={() => handleEliminar(solicitud.id)}
                        disabled={solicitud.estado || solicitud.rechazado}
                      >
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button className="volver-home" onClick={() => navigate("/Home")}>
            <span>Volver al Home</span>
          </button>
        </div>
      </LocalizationProvider>

    </div>
  );
}
