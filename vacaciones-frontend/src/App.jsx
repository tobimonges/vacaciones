import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import NuevaSolicitud from "./components/NuevaSolicitud";
import SolicitudDetalle from "./components/SolicitudDetalle";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
                {/* Ruta para ver detalles de una solicitud */}
                <Route path="/SolicitudDetalle/:id" element={<SolicitudDetalle />} />
            </Routes>
        </Router>
    );
}

export default App;
