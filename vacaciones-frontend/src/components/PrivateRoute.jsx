import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    localStorage.setItem("isAuthenticated", "false"); // Asegurar que la sesión se cierre
    alert("No tienes acceso a la página, favor inicie sesión primero.");
    return <Navigate to="/" replace />; // Redirigir al login
  }

  return children; // Renderizar el contenido protegido
};

export default ProtectedRoute;
