import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import HomeTh from "./components/HomeTh";
import NuevaSolicitud from "./components/NuevaSolicitud";
import SolicitudAuxiliar from "./components/SolicitudAuxiliar";
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

function App() {
  return (
    <Router>
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
              allowedRoles={["TH", "LIDER", "OPERACIONES", "DIRECTORIO", "GTH"]}
            >
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/SolicitudAuxiliar"
          element={
            <PrivateRoute
              allowedRoles={["TH", "LIDER", "OPERACIONES", "DIRECTORIO", "GTH"]}
            >
              <SolicitudAuxiliar />
            </PrivateRoute>
          }
        />

        <Route
          path="/CrearUsuario"
          element={
            <PrivateRoute allowedRoles={["TH", "GTH"]}>
              <CrearUsuario />
            </PrivateRoute>
          }
        />
        <Route
          path="/UsuarioDetalle"
          element={
            <PrivateRoute allowedRoles={["TH", "GTH"]}>
              <UsuarioDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/CreaEquipo"
          element={
            <PrivateRoute allowedRoles={["TH", "GTH"]}>
              <CreaEquipo />
            </PrivateRoute>
          }
        />
        <Route
          path="/EquipoDetalle"
          element={
            <PrivateRoute allowedRoles={["TH", "GTH"]}>
              <EquipoDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/CreaCargo"
          element={
            <PrivateRoute allowedRoles={["TH", "GTH"]}>
              <CreaCargo />
            </PrivateRoute>
          }
        />
        <Route
          path="/CargoDetalle"
          element={
            <PrivateRoute allowedRoles={["TH", "GTH"]}>
              <CargoDetalle />
            </PrivateRoute>
          }
        />
        <Route
          path="/HomeTh"
          element={
            <PrivateRoute
              allowedRoles={["TH", "LIDER", "OPERACIONES", "DIRECTORIO", "GTH"]}
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
