import React, { useEffect, useState } from "react";
import "./logogiratorio.css";
import logo from "../../public/roshkaicon.ico"; // Ajusta la ruta según tu estructura

const Preloader = ({ duration = 2000, onEnd }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsFading(true); // Inicia el desvanecimiento
    }, duration);

    const hideTimer = setTimeout(() => {
      setIsVisible(false); // Oculta completamente el preloader
      if (onEnd) onEnd(); // Notifica que el preloader terminó
    }, duration + 700); // 700ms adicionales para el desvanecimiento

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onEnd]);

  if (!isVisible) return null;

  return (
    <div id="logogiratorio" className={isFading ? "fade-out" : "fade-in"}>
      <img src={logo} alt="Logo" className="logo-rotando" />
    </div>
  );
};

export default logogiratorio;



//../../public/roshkaicon.ico