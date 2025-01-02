SolicitudContext
import React, { createContext, useState, useContext } from "react";
import axios from "axios";

// Crear el contexto
const SolicitudContext = createContext();

// Crear un proveedor para envolver la aplicación
export function SolicitudProvider({ children }) {
  const [solicitud, setSolicitud] = useState({
    id: null,
    startDate: null,
    endDate: null,
    estado: "pendiente", // Valor predeterminado
  });

  const [solicitudes, setSolicitudes] = useState([]); // Lista completa de solicitudes

  // Función para cargar solicitudes desde el backend
  const fetchSolicitudes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/vacaciones/solicitudes");
      setSolicitudes(response.data);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  return (
    <SolicitudContext.Provider
      value={{
        solicitud,
        setSolicitud,
        solicitudes,
        setSolicitudes,
        fetchSolicitudes,
      }}
    >
      {children}
    </SolicitudContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useSolicitud() {
  return useContext(SolicitudContext);
}

