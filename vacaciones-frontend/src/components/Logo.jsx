import React from "react";
import "./Logo.css"; // Opcional: Para estilos específicos.

const Logo = () => {
  return (
    <div className="logo">
      {/* Imagen del logo o SVG */}
      <img src="../../public/logo-white.svg" alt="Logo" className="logo-img" />
    </div>
  );
};

export default Logo;
