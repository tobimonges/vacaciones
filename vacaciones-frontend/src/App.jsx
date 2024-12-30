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
        <Route
          path="/Home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/NuevaSolicitud"
          element={
            <ProtectedRoute>
              <NuevaSolicitud />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
