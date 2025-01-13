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
        console.error("Error fetching equipos:", err.response?.data || err.message);
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
      await axios.delete(
        `http://localhost:8080/api/equipos/${equipoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Actualizar la lista de equipos
      setEquipos((prev) =>
        prev.filter((equipo) => equipo.id !== equipoId)
      );
      alert("Equipo eliminado correctamente.");
    } catch (error) {
      console.error("Error eliminando el equipo:", error);
      alert("No se pudo eliminar el equipo.");
    }
  };
  

  

  return (
    <div>
      <Preloader duration={650} />
      <div className="container-detalle">
        <div className="header-section-detalle">
          <NavigationBar onLogout={handleLogout} />
          <div className="header-title-container-detaller">
            <h4>Lista de Equipos</h4>
            <div className="filter-container-detalle">
              <label htmlFor="filter-input">Buscar:</label>
              <input
                id="filter-input-detalle"
                type="text"
                placeholder="Nombre del equipo"
                value={filterText}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
        <div className="content-section">
          {error ? (
            <p className="error">{error}</p>
          ) : filteredEquipos.length === 0 ? (
            <p>No hay equipos que coincidan con el filtro.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipos.map((equipo) => (
                  <tr key={equipo.id}>
                    <td>{equipo.id}</td>
                    <td>{equipo.nombre}</td>
                    <td>.</td>
                    <td>
                      <button
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
