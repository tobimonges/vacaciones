import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import ProtectedRoute from "./components/rutas";
import NuevaSolicitud from "./components/NuevaSolicitud";
function App() {
  return (
    <Router>
      <Routes>
        {/*ruta Login */}
        <Route path="/" element={<Login />} />
        {/* Ruta para Home */}
        <Route path="/Home" element={<Home />} />

        <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />

        <Route path="/SolicitudDetalle" element={<SolicitudDetalle />} />
      </Routes>
    </Router>
  );
}
export default App;
