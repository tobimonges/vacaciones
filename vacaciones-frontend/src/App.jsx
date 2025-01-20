import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import HomeTh from "./components/HomeTh";
import NuevaSolicitud from "./components/NuevaSolicitud";
import SolicitudDetalle from "./components/SolicitudDetalle";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./components/AdminDashboard";
import RestablecerContraseña from "./components/RestablecerContraseña";
import LoginForgotPassword from "./components/LoginForgotPassword";
import CrearUsuario from "./components/CrearUsuario";
import CreaEquipo from "./components/CreaEquipo";
import CreaCargo from "./components/CreaCargo";
import EquipoDetalle from "./components/EquipoDetalle";
import CargoDetalle from "./components/CargoDetalle";
import UsuarioDetalle from "./components/UsuarioDetalle";
import Preloader from "./components/Preloader";

function App() {
  return (
    <Router>
      <Preloader duration={650} />
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas para funcionarios */}
        <Route path="/Home" element={<Home />} />
        <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
        <Route path="/SolicitudDetalle/:id" element={<SolicitudDetalle />} />
        {/* Ruta para restablecer contraseña */}
        <Route path="/forgotPassword" element={<LoginForgotPassword />} />
        {/* Ruta para CAMBIAR contraseña */}
        <Route path="/reset-password" element={<RestablecerContraseña />} />
        {/* Ruta exclusiva para administradores */}
        {/* Ruta para otros roles excepto FUNCIONARIO */}
        <Route
          path="/AdminDashboard"
          element={
            <PrivateRoute
              allowedRoles={["TH", "LIDER", "OPERACIONES", "DIRECTORIO"]}
            >
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/CrearUsuario"
          element={
            <PrivateRoute allowedRoles={["TH"]}>
              <CrearUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/UsuarioDetalle"
          element={
            <PrivateRoute allowedRoles={["TH"]}>
              <UsuarioDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/CreaEquipo"
          element={
            <PrivateRoute allowedRoles={["TH"]}>
              <CreaEquipo />
            </PrivateRoute>
          }
        />
        <Route
          path="/EquipoDetalle"
          element={
            <PrivateRoute allowedRoles={["TH"]}>
              <EquipoDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/CreaCargo"
          element={
            <PrivateRoute allowedRoles={["TH"]}>
              <CreaCargo />
            </PrivateRoute>
          }
        />
        <Route
          path="/CargoDetalle"
          element={
            <PrivateRoute allowedRoles={["TH"]}>
              <CargoDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/HomeTh"
          element={
            <PrivateRoute
              allowedRoles={["TH", "LIDER", "OPERACIONES", "DIRECTORIO"]}
            >
              <HomeTh />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
