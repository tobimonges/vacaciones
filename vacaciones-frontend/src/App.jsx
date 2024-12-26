import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import NuevaSolicitud from "./components/NuevaSolicitud";
import "./App.css"; // Importa el CSS de App

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to="/NuevaSolicitud">Nueva solicitud</Link>
          {/* Puedes agregar más enlaces de navegación aquí */}
        </nav>

        {/* Rutas definidas */}
        <div className="content">
          <Routes>
            <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
            {/* Puedes agregar más rutas aquí */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
