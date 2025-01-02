import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "./Solicitud.css";

export default function SolicitudDetalle() {
  const { id } = useParams(); // ID del usuario
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]); // Lista de solicitudes
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null); // ID de la solicitud que se está editando
  const [nuevaFechaInicio, setNuevaFechaInicio] = useState(null);
  const [nuevaFechaFin, setNuevaFechaFin] = useState(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado. Por favor, inicia sesión.");
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
          setError("No se pudieron obtener las solicitudes.");
        }
      } catch (error) {
        console.error("Error obteniendo las solicitudes:", error);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchSolicitudes();
  }, [id, navigate]);

  const handleEditar = (solicitud) => {
    setEditando(solicitud.id);
    setNuevaFechaInicio(dayjs(solicitud.fechaInicio));
    setNuevaFechaFin(dayjs(solicitud.fechaFin));
  };

  const handleGuardar = async (solicitudId) => {
    try {
      const token = localStorage.getItem("token");
      if (!nuevaFechaInicio || !nuevaFechaFin) {
        alert("Por favor, selecciona ambas fechas.");
        return;
      }

      const solicitudActualizada = {
        fechaInicio: nuevaFechaInicio.format("YYYY-MM-DD"),
        fechaFin: nuevaFechaFin.format("YYYY-MM-DD"),
      };

      await axios.put(
        `http://localhost:8080/vacaciones/solicitudes/${solicitudId}`,
        solicitudActualizada,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === solicitudId
            ? { ...solicitud, ...solicitudActualizada }
            : solicitud
        )
      );
      setEditando(null);
      alert("Solicitud actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar la solicitud:", error);
      alert("No se pudo actualizar la solicitud.");
    }
  };

  const handleCancelar = () => {
    setEditando(null);
    setNuevaFechaInicio(null);
    setNuevaFechaFin(null);
  };

  const handleEliminar = async (solicitudId) => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar esta solicitud?"
    );
    if (!confirm) return;

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
      alert("Solicitud eliminada correctamente.");
    } catch (error) {
      console.error("Error eliminando la solicitud:", error);
      alert("No se pudo eliminar la solicitud.");
    }
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (solicitudes.length === 0) {
    return <p>No se encontraron solicitudes para este usuario.</p>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="container-solicitudes">
        <h4>Solicitudes del Usuario</h4>
        <ul>
          {solicitudes.map((solicitud, index) => (
            <li key={solicitud.id}>
              {editando === solicitud.id ? (
                <div>
                  <p>
                    <strong>Solicitud N°{index + 1}</strong>{" "}
                    {/* Aquí usamos el índice + 1 para obtener un contador */}
                    <br />
                    <br />
                  </p>
                  <div className="datepicker-container">
                    <DatePicker
                      label="Fecha de inicio"
                      value={nuevaFechaInicio}
                      onChange={(newValue) => setNuevaFechaInicio(newValue)}
                      renderInput={(params) => <input {...params} />}
                    />
                    <DatePicker
                      label="Fecha de fin"
                      value={nuevaFechaFin}
                      onChange={(newValue) => setNuevaFechaFin(newValue)}
                      renderInput={(params) => <input {...params} />}
                    />
                  </div>
                  <br />
                  <div className="buttons">
                    <button onClick={() => handleGuardar(solicitud.id)}>
                      Guardar
                    </button>
                    <button onClick={handleCancelar}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Solicitud N° {index + 1}</strong>{" "}
                    {/* Aquí usamos el índice + 1 para obtener un contador */}
                  </p>
                  <p>
                    <strong>Fecha de inicio:</strong>{" "}
                    {dayjs(solicitud.fechaInicio).format("DD/MM/YYYY")}
                  </p>
                  <p>
                    <strong>Fecha de fin:</strong>{" "}
                    {dayjs(solicitud.fechaFin).format("DD/MM/YYYY")}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {solicitud.estado ? "Confirmada" : "Pendiente"}
                  </p>
                  <div className="buttons">
                    <button onClick={() => handleEditar(solicitud)}>
                      Editar
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleEliminar(solicitud.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        <button className="volver-home" onClick={() => navigate("/Home")}>
          Volver al Home
        </button>
      </div>
    </LocalizationProvider>
  );
}
