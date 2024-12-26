import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Calendar from './pages/Calendar'; // Componente Calendar
import Home from './pages/Home.jsx';     // Página de inicio
import About from './pages/About.jsx';   // Página de "Acerca de"

function HomeApp() {
    const [selectedDaysCount, setSelectedDaysCount] = useState(0); // Estado para los días seleccionados

    return (
        <Router>
            <div>
                {/* Barra de navegación */}
                <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
                    <ul style={{ display: 'flex', listStyleType: 'none', gap: '20px', padding: 0 }}>
                        <li>
                            <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>Home</Link>
                        </li>
                        <li>
                            <Link to="/calendar" style={{ textDecoration: 'none', color: 'blue' }}>Calendar</Link>
                        </li>
                        <li>
                            <Link to="/about" style={{ textDecoration: 'none', color: 'blue' }}>About</Link>
                        </li>
                    </ul>
                </nav>

                {/* Rutas definidas */}
                <Routes>
                    {/* Ruta para la página principal */}
                    <Route path="/" element={<Home />} />

                    {/* Ruta para el calendario con props */}
                    <Route
                        path="/calendar"
                        element={<Calendar
                            userName="John"
                            joinDate="2024-01-01"
                            vacationDays={12}
                            setSelectedDaysCount={setSelectedDaysCount} // Pasando la función para actualizar el estado
                        />}
                    />

                    {/* Ruta para la página About */}
                    <Route path="/about" element={<About />} />
                </Routes>


            </div>
        </Router>
    );
}

export default HomeApp;
