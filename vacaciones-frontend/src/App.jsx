import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import NuevaSolicitud from "./components/NuevaSolicitud";
function App() {
  return (
    <Router>
      <Routes>
        {/*ruta Login */}
        <Route path="/" element={<Login />} />
        {/* Ruta para NuevaSolicitud */}
        <Route path="/NuevaSolicitud" element={<NuevaSolicitud />} />
      </Routes>
    </Router>
  );
}
export default App;
