import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import { Link } from "react-router-dom";
const NavigationBar = ({ logo, onLogout }) => {
    const navigate = useNavigate();
  
    return (
      <div className="nav-container">
        <nav className="navigation-bar">
          {/* Contenedor padre para los botones */}
          
            {/* Botón de Atrás */}
            <div className="nav-button-container left">
              <button className="nav-button back-button" onClick={() => navigate(-1)}>
                <img src=".\angulo-izquierdo.svg" alt="Atrás" className="button-icon" />
              </button>
            </div>




            {/* Logo centrado */}
            <div className="nav-logo">
                <Link to="/home">
                    <img src="../../public/logo-white.svg" alt="Logo" />
                </Link>
            </div>


            {/* Botón de Cerrar Sesión */}
            <div className="nav-button-container right">
              <button className="nav-button logout" onClick={onLogout}>
              <img src=".\salida.svg" alt="Atrás" className="button-icon" />
              </button>
            </div>
        </nav>
      </div>
    );
  };
export default NavigationBar;
