import React, { useEffect, useState } from "react";
import axios from "axios";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";
import { useNavigate } from "react-router-dom";
import "./EquipoDetalle.css";

const EquipoDetalle = () => {
  const [equipos, setEquipos] = useState([]);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

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
    <div>
      <Preloader duration={650} />
      <div className="container-detalle">
        <NavigationBar onLogout={handleLogout} />
        <div className="header-section-detalle">
          <div className="header-title-container-detalle">
            <h4 className="title">Lista de Equipos</h4>
          </div>
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
                        <button
                          className="update-button"
                          onClick={() => handleActualizarEquipo(equipo.id)}
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          className="edit-button"
                          onClick={() => {
                            setEditingId(equipo.id);
                            setNewName(equipo.nombre);
                          }}
                        >
                          Actualizar
                        </button>
                      )}
                      <button
                        className="delete-button"
                        onClick={() => handleEliminarEquipo(equipo.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipoDetalle;
