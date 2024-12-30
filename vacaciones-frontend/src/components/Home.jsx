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
import './Home.css';

const Home = () => {
    const [userName, setUserName] = useState('');
    const [joinDate, setJoinDate] = useState('');
    const [vacationDays, setVacationDays] = useState(0);
    const [range, setRange] = useState({ start: null, end: null });
    const [selectedDaysCount, setSelectedDaysCount] = useState(0);
    const [error, setError] = useState('');

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

    //  Función para determinar si es fin de semana
    const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

    //  Función para determinar si es feriado
    const isHoliday = (date) => holidays.some((holiday) => differenceInCalendarDays(holiday, date) === 0);

    // ️ Desactivar fechas no válidas
    const shouldDisableDate = (date) => isWeekend(date) || isHoliday(date);

    // ️ Validar si el día está dentro del rango seleccionado
    const isInRange = (day) => {
        if (!range.start || !range.end) return false;
        return day >= range.start && day <= range.end && !isWeekend(day) && !isHoliday(day);
    };

    // ️ Calcular días seleccionados
    useEffect(() => {
        const calculateSelectedDays = () => {
            if (!range.start || !range.end) return 0;
            const allDays = eachDayOfInterval({ start: range.start, end: range.end });
            return allDays.filter((day) => !isWeekend(day) && !isHoliday(day)).length;
        };
        setSelectedDaysCount(calculateSelectedDays());
    }, [range]);

    //  Obtener datos del usuario desde el backend
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const auth = {
                    username: "admin@empresa.com",
                    password: "admin123",
                };
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


    // ️ Manejar selección de fechas
    const handleDateSelection = (newValue) => {
        setError('');
        if (!range.start || (range.start && range.end)) {
            if (!shouldDisableDate(newValue)) {
                setRange({ start: newValue, end: null });
            }
        } else {
            if (!shouldDisableDate(newValue)) {
                if (newValue >= range.start) {
                    setRange({ ...range, end: newValue });
                } else {
                    setError('La fecha de finalización no puede ser anterior a la fecha de inicio');
                }
            }
        }
    };

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
                    <h3 className="calendar-selected-days">
                        Total días seleccionados: {selectedDaysCount}
                    </h3>

                    {error && <p className="calendar-error-message">{error}</p>}

                    <div className="calendar-pickers-container">
                        {[0, 1].map((monthOffset) => (
                            <StaticDatePicker
                                key={monthOffset}
                                displayStaticWrapperAs="desktop"
                                defaultCalendarMonth={
                                    new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset)
                                }
                                value={range.start}
                                onChange={handleDateSelection}
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
