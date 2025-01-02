import React, { createContext, useState, useContext } from "react";

// Crear el contexto
const SolicitudContext = createContext();

// Crear un proveedor para envolver la aplicación
export function SolicitudProvider({ children }) {
  const [solicitud, setSolicitud] = useState({
    startDate: null,
    endDate: null,
  });

  return (
    <SolicitudContext.Provider value={{ solicitud, setSolicitud }}>
      {children}
    </SolicitudContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useSolicitud() {
  return useContext(SolicitudContext);
}
