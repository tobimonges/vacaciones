// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "./authUtils";

const PrivateRoute = ({ children, adminOnly }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/Home" />;
  }

  return children;
};

export default PrivateRoute;
