import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const { rol } = jwtDecode(token); // Extraer el rol del token

    if (!allowedRoles.includes(rol)) {
      return <Navigate to="/Home" />; // Redirige si el rol no está permitido
    }

    return children;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
