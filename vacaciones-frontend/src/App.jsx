import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import NuevaSolicitud from "./components/NuevaSolicitud";

function App() {
  return (
    <Router>
      <div>
        {/* Barra de navegación */}
        <nav style={{ padding: "10px", background: "#f0f0f0" }}>
          <ul style={{ display: "flex", gap: "20px" }}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/NuevaSolicitud">Nueva solicitud</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        {/* Rutas definidas */}
        <Routes>
          <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
