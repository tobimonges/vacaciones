import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import Badge from '@mui/material/Badge';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CheckIcon from '@mui/icons-material/Check';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [vacationRequests, setVacationRequests] = useState([]); // Datos de solicitudes
  const [userName, setUserName] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [vacationDays, setVacationDays] = useState(0);
  const [range, setRange] = useState({ start: null, end: null });
  const [selectedDays, setSelectedDays] = useState([]);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const holidays = [
    new Date(2024, 0, 1),
    new Date(2024, 3, 1),
    new Date(2024, 4, 1),
    new Date(2024, 4, 17),
    new Date(2024, 4, 18),
    new Date(2024, 5, 1),
    new Date(2024, 5, 14),
    new Date(2024, 5, 15),
    new Date(2024, 6, 12),
    new Date(2024, 8, 15),
    new Date(2024, 9, 29),
    new Date(2024, 11, 8),
    new Date(2024, 11, 25),
  ];

  const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
  const isHoliday = (date) => holidays.some((holiday) => differenceInCalendarDays(holiday, date) === 0);

  const shouldDisableDate = (date) => isWeekend(date) || isHoliday(date);

  const isInRange = (day) => {
    return selectedDays.some((selectedDay) => differenceInCalendarDays(selectedDay, day) === 0);
  };

  // Calcular días seleccionados a partir de las Solicitudes
  useEffect(() => {
    if (vacationRequests.length > 0) {
      const days = vacationRequests.flatMap(({ fecha_inicio, fecha_fin }) => {
        const startDate = new Date(fecha_inicio);
        const endDate = new Date(fecha_fin);
        return eachDayOfInterval({ start: startDate, end: endDate });
      });
      setSelectedDays(days);
    }
  }, [vacationRequests]);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = { username: 'admin@empresa.com', password: 'admin123' };
        const response = await axios.get('http://localhost:8080/vacaciones/buscarid/1', { auth });
        const { nombre, fechaIngreso, diasVacaciones } = response.data;

        setUserName(nombre);
        setJoinDate(fechaIngreso);
        setVacationDays(diasVacaciones);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setError('No se pudieron cargar los datos del usuario.');
      }
    };
    fetchUserData();
  }, []);

  // Obtener solicitudes de vacaciones
  useEffect(() => {
    const fetchVacationRequests = async () => {
      try {
        const auth = { username: 'admin@empresa.com', password: 'admin123' };
        const response = await axios.get('http://localhost:8080/vacaciones/solicitudes/1', { auth });
        setVacationRequests(response.data);
      } catch (error) {
        console.error('Error al obtener solicitudes de vacaciones:', error);
        setError('No se pudieron cargar las solicitudes de vacaciones.');
      }
    };
    fetchVacationRequests();
  }, []);

  return (
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
        <div className="calendar-container">
          <div className={`calendar-card ${error ? 'calendar-error' : ''}`}>
            <h1 className="calendar-title">Bienvenido, {userName || 'Usuario'}</h1>
            <p className="calendar-text">
              Fecha de ingreso: {joinDate ? new Date(joinDate).toLocaleDateString('es-ES') : 'Cargando...'}
            </p>
            <p className="calendar-text">
              Total de días de vacaciones disponibles: {vacationDays || 'Cargando...'}
            </p>

            {error && <p className="calendar-error-message">{error}</p>}

            <div className="button-container">
              <button
                  className="calendar-button"
                  onClick={() => navigate('/NuevaSolicitud')}
              >
                Solicitar
              </button>
              <button
                  className="calendar-button"
                  onClick={() => navigate('/componentes/SolicitudDetalle')}
              >
                Ver Solicitudes
              </button>
            </div>

            <div className="calendar-pickers-container">
              {[0, 1].map((monthOffset) => (
                  <StaticDatePicker
                      key={monthOffset}
                      displayStaticWrapperAs="desktop"
                      defaultCalendarMonth={
                        new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset)
                      }
                      value={range.start}
                      shouldDisableDate={shouldDisableDate}
                      renderDay={(day, _value, DayComponentProps) => (
                          <Badge
                              key={day.toString()}
                              overlap="circular"
                              badgeContent={isInRange(day) ? <CheckIcon color="primary" /> : undefined}
                          >
                            <PickersDay
                                {...DayComponentProps}
                                selected={isInRange(day)}
                                className={isInRange(day) ? 'calendar-day-selected' : 'calendar-day'}
                            />
                          </Badge>
                      )}
                  />
              ))}
            </div>
          </div>
        </div>
      </LocalizationProvider>
  );
};

export default Home;