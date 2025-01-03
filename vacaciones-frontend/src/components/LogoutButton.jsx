import React from "react";
import { logout } from "./authUtils";
import "./LogoutButton.css";
const LogoutButton = () => {
  return (
    <button onClick={logout} className="logout-button">
      Cerrar sesión
    </button>
  );
};
export default LogoutButton;
