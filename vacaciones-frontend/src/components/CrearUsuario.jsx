import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CrearUsuario.css";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";

function CrearUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nroCedula: "",
    correo: "",
    rol: "",
    equipo: "",
    cargo: "",
    fechaIngreso: "",
    fechaNacimiento: "",
    telefono: "",
    estado: true,
  });
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [roles, setRoles] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  useEffect(() => {
    const createBox = document.querySelector(".createBox");
    createBox.classList.add("cajaLogin");

    const fetchData = async (url, setter) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setter(response.data);
      } catch (err) {
        console.error(`Error al obtener los datos de ${url}:`, err);
        setError(`Error al cargar los datos de ${url}.`);
      }
    };

    fetchData("http://localhost:8080/vacaciones/roles/listar-roles", setRoles);
    fetchData("http://localhost:8080/api/equipos", setEquipos);
    fetchData("http://localhost:8080/api/cargos", setCargos);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setPopupType("");
      }, popupType === "success" ? 1300 : 3000);

      return () => clearTimeout(timer);
    }
  }, [message, popupType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prevData) => ({ ...prevData, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      nombre,
      apellido,
      nroCedula,
      correo,
      telefono,
      fechaIngreso,
      fechaNacimiento,
      rol,
      cargo,
      equipo,
    } = formData;

    if (
      !nombre ||
      !apellido ||
      !nroCedula ||
      !correo ||
      !telefono ||
      !fechaIngreso ||
      !fechaNacimiento ||
      !rol ||
      !cargo ||
      !equipo
    ) {
      setMessage("Por favor, rellene todos los campos.");
      setPopupType("error");
      return;
    }

    const nuevoUsuario = {
      ...formData,
      nroCedula: parseInt(nroCedula),
      fechaIngreso: fechaIngreso.format("YYYY-MM-DD"),
      fechaNacimiento: fechaNacimiento.format("YYYY-MM-DD"),
      rol: { id: rol },
      cargo: { id: cargo },
      equipo: { id: equipo },
    };

    try {
      const token = localStorage.getItem("token");
      const url = "http://localhost:8080/vacaciones/crea/usuarios";
      await axios.post(url, nuevoUsuario, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("¡Usuario creado con éxito!");
      setPopupType("success");
      setTimeout(() => navigate("/Home"), 1300);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear el usuario.");
    }
  };

  return (
    <div className="containerLogin">
      <Preloader duration={650} />
      <div className={`createBox ${isAnimating ? "LoginAnim" : ""} ${error ? "datosIncorrectos" : ""}`}>
        <NavigationBar onLogout={handleLogout} />
        <h2 className="headerCreate">Crear Usuario</h2>
        <form onSubmit={handleSubmit}>
          {[
            { name: "nombre", type: "text", placeholder: "Nombre", icon: "/circulo-de-usuario (2).svg" },
            { name: "apellido", type: "text", placeholder: "Apellido", icon: "/circulo-de-usuario (2).svg" },
            { name: "nroCedula", type: "number", placeholder: "Nro de Cedula", icon: "/tarjeta-de-identificacion (1).svg" },
            { name: "correo", type: "text", placeholder: "Correo", icon: "/sobre.svg" },
            { name: "telefono", type: "text", placeholder: "Telefono", icon: "/circulo-de-telefono.svg" },
          ].map(({ name, type, placeholder, icon }) => (
            <div className="inputGroup" key={name}>
              <div className="iconWrap">
                <img src={icon} alt={placeholder} className="icon" />
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  className="inputCreate"
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          ))}

          {[
            { name: "fechaNacimiento", label: "Seleccionar fecha de nacimiento", icon: "/dias-del-calendario.svg" },
            { name: "fechaIngreso", label: "Seleccionar fecha de ingreso", icon: "/dias-del-calendario.svg" },
          ].map(({ name, label, icon }) => (
            <LocalizationProvider key={name} dateAdapter={AdapterDayjs} adapterLocale="es">
              <div className="inputGroup datePickerGroup">
                <div className="iconWrap">
                  <img src={icon} alt={label} className="icon" />
                  <DatePicker
                    label={label}
                    selected={formData[name]}
                    onChange={(date) => handleDateChange(name, date)}
                    dateFormat="yyyy-MM-dd"
                    className="inputCreate"
                    placeholderText={label}
                    required
                  />
                </div>
              </div>
            </LocalizationProvider>
          ))}

          {[
            { name: "rol", label: "Rol asignado", options: roles },
            { name: "cargo", label: "Cargo asignado", options: cargos },
            { name: "equipo", label: "Equipo asignado", options: equipos },
          ].map(({ name, label, options }) => (
            <div className="inputGroup" key={name}>
              <div className="iconWrap">
                <img src="/mapa-del-sitio (1).svg" alt={label} className="icon" />
                <select
                  name={name}
                  className="inputCreate"
                  value={formData[name]}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>{label}</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>{option.nombre || option.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button type="submit" className="buttonCreate">
            <span>Crear</span>
          </button>
        </form>
        {message && (
          <div className={popupType === "error" ? "popupErrorCrearUsuario" : "popupExitoso"} style={{ opacity: 1 }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CrearUsuario;  