import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUsuarioId, getUserRole } from "./authUtils"; // Importa utilidades de autenticación
import axios from "axios";

/**
 * Componente para los botones de la barra lateral.
 */
const SidebarButtons = () => {
  const userRole = getUserRole(); // Obtener el rol del usuario logueado
  const navigate = useNavigate();
  const location = useLocation();
  const isHomeTH = location.pathname === "/HomeTH";
  const isHome = location.pathname === "/Home";
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/equipos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEquipos(response.data);
      } catch (err) {
        console.error("Error al obtener equipos:", err);
        setError("No se pudieron cargar los equipos.");
      }
    };

    fetchEquipos();
  }, []);

  /**
   * Verifica si el usuario tiene un rol permitido.
   * @returns {boolean}
   */
  const isUserAllowed = () => {
    const allowedRoles = ["TH", "LIDER", "DIRECTORIO", "OPERACIONES"];
    return allowedRoles.includes(userRole);
  };

  return (
    <div className="sidebar-buttons">
      {/* Botón Home */}
      {!isHome && (
        <button className="sidebar-button" onClick={() => navigate("/Home")}>
          <span className="sidebar-text-focus">Home</span>
        </button>
      )}

      {/* Botón para Solicitar */}
      {!isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate("/NuevaSolicitud")}
        >
          <span>Solicitar</span>
        </button>
      )}

      {/* Botón para Ver Solicitudes */}
      {!isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/SolicitudDetalle/${getUsuarioId()}`)}
        >
          <span>Mis Solicitudes</span>
        </button>
      )}

      {/* Botón para Gestión de Solicitudes (usuarios con rol permitido) */}
      {isUserAllowed() && !isHomeTH && (
        <button className="sidebar-button" onClick={() => navigate("/HomeTH")}>
          <span>Gestión de Solicitudes</span>
        </button>
      )}

      {/* Botón Solicitud Auxiliar (solo para usuarios 'TH' en la página HomeTH) */}
      {isUserAllowed() && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate("/SolicitudAuxiliar")}
        >
          <span>Solicitud Auxiliar</span>
        </button>
      )}

      {userRole === "LIDER" && isHomeTH ? (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/AdminDashboard`)}
        >
          <span>Bandeja de Solicitudes</span>

          <img
            src="/icono-notificaciones.svg"
            alt="Solicitudes"
            title="Solicitudes"
            className="notificacion"
          />
        </button>
      ) : userRole !== "LIDER" && isUserAllowed && isHomeTH ? (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/AdminDashboard`)}
        >
          <span>Listar Solicitudes</span>
          <img
            src="/icono-notificaciones.svg"
            alt="Solicitudes"
            title="Solicitudes"
            className="notificacion"
          />
        </button>
      ) : null}

      {userRole === "TH" && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/crearusuario`)}
        >
          <span>Registrar Funcionario</span>
        </button>
      )}

      {userRole === "TH" && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/UsuarioDetalle`)}
        >
          <span>Editar Datos de Funcionario</span>
        </button>
      )}
      {userRole === "TH" && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/CreaEquipo`)}
        >
          <span>Crear Equipo</span>
        </button>
      )}
      {userRole === "TH" && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/EquipoDetalle`)}
        >
          <span>Editar Equipo</span>
        </button>
      )}
      {userRole === "TH" && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/CreaCargo`)}
        >
          <span>Crear Cargo</span>
        </button>
      )}
      {userRole === "TH" && isHomeTH && (
        <button
          className="sidebar-button"
          onClick={() => navigate(`/CreaCargo`)}
        >
          <span>Editar Cargo</span>
        </button>
      )}

      {isUserAllowed() && isHomeTH && (
        <select
          className="sidebar-button sidebar-button-homeTH"
          value={equipoSeleccionado}
          onChange={(e) => setEquipoSeleccionado(e.target.value)}
        >
          <option value="">Todos los equipos</option>
          {equipos.map((equipo) => (
            <option key={equipo.nombre} value={equipo.nombre}>
              {equipo.nombre}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

/**
 * Componente principal de la barra lateral.
 */
const Sidebar = () => {
  const navigate = useNavigate();

  /**
   * Maneja el cierre de sesión del usuario.
   */
  const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token de autenticación
    navigate("/"); // Redirige al usuario al inicio de sesión
  };

  return (
    <div className="sidebar-content">
      {/* Logo de la barra lateral */}
      <div className="sidebar-logo">
        <Link to="/Home">
          <img src="./logo-white.svg" alt="Logo" className="logo" />
        </Link>
      </div>

      {/* Botones de la barra lateral */}
      <SidebarButtons />

      {/* Botón para cerrar sesión */}
      <div className="sidebar-logout">
        <button className="logout-button" onClick={handleLogout}>
          <img src="./salida.svg" alt="Cerrar sesión" className="button-icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
