import React, { useState, useEffect } from "react";
import './FadeIn.css';

const FadeIn = ({ children }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true); // Activa la animación fadeIn cuando se monta el componente
  }, []);

  return (
    <div className={`fade-in-container ${fadeIn ? 'fade-in' : ''}`}>
      {children}
    </div>
  );
};

export default FadeIn;
