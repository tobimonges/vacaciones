import React, { useEffect, useState } from "react";
import axios from "axios";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";
import { useNavigate } from "react-router-dom";
import "./EquipoDetalle.css";
import { Link } from "react-router-dom";
import { getUserRole, getUsuarioId, isTokenValid } from "./authUtils";

const EquipoDetalle = () => {
  const [equipos, setEquipos] = useState([]);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  const userRole = getUserRole(); // Obtener el rol del usuario logueado

  useEffect(() => {
    const fetchEquipos = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:8080/api/equipos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEquipos(response.data);
      } catch (err) {
        console.error(
          "Error fetching equipos:",
          err.response?.data || err.message
        );
        setError("No se pudieron cargar los equipos.");
      }
    };

    fetchEquipos();
  }, []);

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const filteredEquipos = equipos.filter((equipo) =>
    equipo.nombre.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleEliminarEquipo = async (equipoId) => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar este equipo?"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/equipos/${equipoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEquipos((prev) => prev.filter((equipo) => equipo.id !== equipoId));
      alert("Equipo eliminado correctamente.");
    } catch (error) {
      console.error("Error eliminando el equipo:", error);
      alert("No se pudo eliminar el equipo.");
    }
  };

  const handleActualizarEquipo = async (equipoId) => {
    if (!newName.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/equipos/${equipoId}`,
        { nombre: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEquipos((prev) =>
        prev.map((equipo) =>
          equipo.id === equipoId ? { ...equipo, nombre: newName } : equipo
        )
      );

      setEditingId(null);
      setNewName("");
      alert("Equipo actualizado correctamente.");
    } catch (error) {
      console.error("Error actualizando el equipo:", error);
      alert("No se pudo actualizar el equipo.");
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-content">
          {/* 🖼️ Logo de la barra lateral */}
          <div className="sidebar-logo">
            <Link to="/home">
              <img src=".\logo-white.svg" alt="Logo" className="logo" />
            </Link>
          </div>

          <div className="sidebar-buttons">
            <div className="sidebar-buttons">
              {userRole === "LIDER" ? (
                <button
                  className="sidebar-button"
                  onClick={() => navigate(`/AdminDashboard`)}
                >
                  <span>Bandeja de Solicitudes</span>
                </button>
              ) : userRole !== "LIDER" ? (
                <button
                  className="sidebar-button"
                  onClick={() => navigate(`/AdminDashboard`)}
                >
                  <span>Listar Solicitudes</span>
                </button>
              ) : null}

              {/* 🛠️ Botones visibles solo para "TH" */}
              {userRole === "TH" && (
                <button
                  className="sidebar-button"
                  onClick={() => navigate(`/crearusuario`)}
                >
                  <span>Registrar Funcionario</span>
                </button>
              )}
              {userRole === "TH" && (
                <button
                  className="sidebar-button"
                  onClick={() => navigate(`/UsuarioDetalle`)}
                >
                  <span>Usuario Detalle</span>
                </button>
              )}
              {userRole === "TH" && (
                <button
                  className="sidebar-button"
                  onClick={() => navigate(`/CrearEquipo`)}
                >
                  <span>Crear Equipo</span>
                </button>
              )}
              {userRole === "TH" && (
                <button
                  className="sidebar-button"
                  onClick={() => navigate(`/CrearCargo`)}
                >
                  <span>Crear Cargo</span>
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-logout">
            <button className="logout-button" onClick={handleLogout}>
              <img
                src=".\salida.svg"
                alt="Cerrar sesión"
                className="button-icon"
              />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
      <div className="content-area">
        <div className="navbar">
          <div className="navbar-content">
            <NavigationBar onLogout={handleLogout} />
          </div>
        </div>
        <div className="main">
          <div className="main-content">
            <div className="calendar-title-th">
              <span>Lista de equipos</span>
            </div>
            <div className="container-detalle">
              <div className="filter-container-detalle">
                <h4>
                  <label htmlFor="filter-input">Buscar:</label>
                </h4>
                <input
                  id="filter-input-detalle"
                  type="text"
                  placeholder="Nombre del equipo"
                  value={filterText}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="content-section-detalle">
                {error ? (
                  <p className="error">{error}</p>
                ) : filteredEquipos.length === 0 ? (
                  <p>No hay equipos que coincidan con el filtro.</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipos.map((equipo) => (
                        <tr key={equipo.id}>
                          <td>{equipo.id}</td>
                          <td>
                            {editingId === equipo.id ? (
                              <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="edit-input"
                              />
                            ) : (
                              equipo.nombre
                            )}
                          </td>
                          <td className="buttons">
                            {editingId === equipo.id ? (
                              <>
                                <button
                                  className="update-button"
                                  onClick={() =>
                                    handleActualizarEquipo(equipo.id)
                                  }
                                >
                                  Guardar
                                </button>
                                <button
                                  className="cancel-button"
                                  onClick={() => {
                                    setEditingId(null); // Salir del modo edición
                                    setNewName(""); // Opcional: Limpiar el estado del nuevo nombre
                                  }}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="edit-button"
                                  onClick={() => {
                                    setEditingId(equipo.id); // Entrar en modo edición
                                    setNewName(equipo.nombre); // Cargar nombre existente
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="delete-button"
                                  onClick={() =>
                                    handleEliminarEquipo(equipo.id)
                                  }
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipoDetalle;
