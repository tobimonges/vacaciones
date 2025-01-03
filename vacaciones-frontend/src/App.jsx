import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import NuevaSolicitud from "./components/NuevaSolicitud";
import SolicitudDetalle from "./components/SolicitudDetalle";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./components/AdminDashboard"; // Ajusta la ruta si es necesario
import LoginForgotPassword from "./components/LoginForgotPassword";
import RestablecerContraseña from "./components/RestablecerContraseña";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas para funcionarios */}
        <Route path="/Home" element={<Home />} />
        <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
        {/* Ruta para ver detalles de una solicitud */}
        <Route path="/SolicitudDetalle/:id" element={<SolicitudDetalle />} />
        {/* Ruta para restablecer contraseña */}
        <Route path="/forgotPassword" element={<LoginForgotPassword />} />
        {/* Ruta para CAMBIAR contraseña */}
        <Route path="/restablecer" element={<RestablecerContraseña />} />
        {/* Ruta exclusiva para administradores */}
        <Route
          path="/AdminDashboard"
          element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
