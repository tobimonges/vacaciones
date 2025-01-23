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
  const [pendingCount, setPendingCount] = useState(0);

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
      }
    };

    fetchEquipos();
  }, []);

  //Funcion para contar solicitudes pendientes
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId"); // Obtener el ID desde localStorage

        if (!userId) {
          console.error("El ID del usuario no está disponible.");
          return;
        }

        const response = await axios.get(
          "http://localhost:8080/vacaciones/solicitudes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const requests = response.data;

        // Filtrar solicitudes pendientes (numeroAprobaciones === 0) excluyendo las del usuario logueado
        const pendingRequests = requests.filter(
          (request) =>
            request.numeroAprobaciones === 0 &&
            request.usuario.id !== parseInt(userId)
        );

        setPendingCount(pendingRequests.length);
      } catch (error) {
        console.error("Error al obtener las solicitudes pendientes:", error);
      }
    };

    fetchPendingRequests();
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

      {["LIDER", "OPERACIONES", "DIRECTORIO"].includes(userRole) &&
        isHomeTH && (
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
            {pendingCount > 0 && ( // Mostrar la imagen solo si pendingCount es 0 o 1
                <img
                    src="/icono-notificaciones.svg"
                    alt="Solicitudes"
                    title="Solicitudes"
                    className="notificacion"
                />
            )}
          </button>
      ) : userRole !== "LIDER" && isUserAllowed() && isHomeTH ? (
          <button
              className="sidebar-button"
              onClick={() => navigate(`/AdminDashboard`)}
          >
            <span>Listar Solicitudes</span>
            {(pendingCount === 0 || pendingCount === 1) && ( // Mostrar la imagen solo si pendingCount es 0 o 1
                <img
                    src="/icono-notificaciones.svg"
                    alt="Solicitudes"
                    title="Solicitudes"
                    className="notificacion"
                />
            )}
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