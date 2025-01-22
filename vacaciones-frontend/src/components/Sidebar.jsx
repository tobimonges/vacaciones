import React from "react";
import { Link } from "react-router-dom";
import { getUsuarioId, isTokenValid, getUserRole } from "./authUtils"; // Importa utilidades de autenticación
import { useNavigate } from "react-router-dom";


const SidebarButtons = ({ navigate, isUserAllowed}) => (
    <div className="sidebar-buttons">
        <button className="sidebar-button" onClick={() => navigate("/Home")}>
            <span className="sidebar-text-focus">Home</span>
        </button>
        <button
            className="sidebar-button"
            onClick={() => navigate("/NuevaSolicitud")}
        >
            <span>Solicitar</span>
        </button>
        <button
            className="sidebar-button"
            onClick={() => navigate(`/SolicitudDetalle/${getUsuarioId()}`)}
        >
            <span>Ver Solicitudes</span>
        </button>
        {isUserAllowed() && (
            <button className="sidebar-button" onClick={() => navigate(`/HomeTh`)}>
                <span>Gestion de Solicitudes</span>
            </button>
        )}
    </div>
);



const Sidebar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
      }; // Función para cerrar sesión


      // 📥 **Verificar roles permitidos**
      const isUserAllowed = () => {
        const allowedRoles = ["TH", "LIDER", "DIRECTORIO", "OPERACIONES"];
        const userRole = getUserRole(); // Lógica para obtener el rol del usuario
        return allowedRoles.includes(userRole);
      }; // Función que verifica si el usuario tiene un rol permitido

    return (
        <div className="sidebar-content">
            {/* 🖼️ Logo de la barra lateral */}
            <div className="sidebar-logo">
                <Link to="/home">
                    <img src=".\logo-white.svg" alt="Logo" className="logo" />
                </Link>
            </div>

            <div className="sidebar-buttons">
                <SidebarButtons navigate={navigate} isUserAllowed={isUserAllowed} />
            </div>

            <div className="sidebar-logout">
                <button className="logout-button" onClick={handleLogout}>
                    <img src=".\salida.svg" alt="Cerrar sesión" className="button-icon" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    );
};
export default Sidebar;
