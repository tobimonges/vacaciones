// FadeOut.js
import React, { useState, useEffect } from "react";
import './FadeOut.css';

const FadeOut = ({ children }) => {
  const [fadeOut, setFadeOut] = useState(false);

  // Cambia el estado a true después de 3 segundos, simulando la salida del componente.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true); // Activa la animación fadeOut después de 3 segundos
    }, 3000);

    return () => clearTimeout(timer); // Limpia el timeout cuando se desmonta
  }, []);

  return (
    <div className={`fade-out-container ${fadeOut ? 'fade-out' : ''}`}>
      {children}
    </div>
  );
};

export default FadeOut;
