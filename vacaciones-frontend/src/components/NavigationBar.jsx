import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBar = ({ logo, onLogout }) => {
    const navigate = useNavigate();
  
    return (
      <div className="nav-container">
        <nav className="navigation-bar">
          {/* Contenedor padre para los botones */}
          
            {/* Botón de Atrás */}
            <div className="nav-button-container left">
              <button className="nav-button back-button" onClick={() => navigate(-1)}>
                <span className="text">Atrás</span>
              </button>
            </div>
          
  
          {/* Logo centrado */}
          <div className="nav-logo">
            <img src="../../public/logo-white.svg" alt="Logo" />
          </div>

            {/* Botón de Cerrar Sesión */}
            <div className="nav-button-container right">
              <button className="nav-button logout" onClick={onLogout}>
                <span className="text">Cerrar sesión</span>
              </button>
            </div>
        </nav>
      </div>
    );
  };
export default NavigationBar;
