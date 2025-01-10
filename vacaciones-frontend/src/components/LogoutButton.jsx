import React from "react";
import { logout } from "./authUtils";
import "./LogoutButton.css";
const LogoutButton = () => {
  return (
    <button onClick={logout} className="logout-button">
      <span>Cerrar sesión</span>
    </button>
  );
};
export default LogoutButton;
