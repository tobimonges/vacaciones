import React, { useEffect, useState } from "react";
import axios from "axios";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";
import { useNavigate } from "react-router-dom";
import "./EquipoDetalle.css"; // Reusing the same CSS

const CargoDetalle = () => {
  const [cargos, setCargos] = useState([]);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCargos = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:8080/api/cargos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCargos(response.data);
      } catch (err) {
        console.error("Error fetching cargos:", err.response?.data || err.message);
        setError("No se pudieron cargar los cargos.");
      }
    };

    fetchCargos();
  }, []);

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const filteredCargos = cargos.filter((cargo) =>
    cargo.nombre?.toLowerCase().includes(filterText.toLowerCase())
  );
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleEliminarCargo = async (cargoId) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este cargo?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/cargos/${cargoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCargos((prev) => prev.filter((cargo) => cargo.id !== cargoId));
      alert("Cargo eliminado correctamente.");
    } catch (error) {
      console.error("Error eliminando el cargo:", error);
      alert("No se pudo eliminar el cargo.");
    }
  };

  const handleActualizarCargo = async (cargoId) => {
    if (!newName.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/cargos/${cargoId}`,
        { nombre: newName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCargos((prev) =>
        prev.map((cargo) =>
          cargo.id === cargoId ? { ...cargo, nombre: newName } : cargo
        )
      );

      setEditingId(null);
      setNewName("");
      alert("Cargo actualizado correctamente.");
    } catch (error) {
      console.error("Error actualizando el cargo:", error);
      alert("No se pudo actualizar el cargo.");
    }
  };

  return (
    <div>
      <Preloader duration={650} />
      <div className="container-detalle">
        <NavigationBar onLogout={handleLogout} />
        <div className="header-section-detalle">
          <div className="header-title-container-detalle">
            <h4 className="title">Lista de Cargos</h4>
          </div>
          <div className="filter-container-detalle">
            <h4>
              <label htmlFor="filter-input">Buscar:</label>
            </h4>
            <input
              id="filter-input-detalle"
              type="text"
              placeholder="Nombre del cargo"
              value={filterText}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="content-section-detalle">
          {error ? (
            <p className="error">{error}</p>
          ) : filteredCargos.length === 0 ? (
            <p>No hay cargos que coincidan con el filtro.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCargos.map((cargo) => (
                  <tr key={cargo.id}>
                    <td>{cargo.id}</td>
                    <td>
                      {editingId === cargo.id ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        cargo.nombre
                      )}
                    </td>
                    <td className="buttons">
                      {editingId === cargo.id ? (
                        <button
                          className="update-button"
                          onClick={() => handleActualizarCargo(cargo.id)}
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          className="edit-button"
                          onClick={() => {
                            setEditingId(cargo.id);
                            setNewName(cargo.nombre);
                          }}
                        >
                          Actualizar
                        </button>
                      )}
                      <button
                        className="delete-button"
                        onClick={() => handleEliminarCargo(cargo.id)}
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

export default CargoDetalle;
