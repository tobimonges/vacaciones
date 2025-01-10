import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import "./CrearUsuario.css";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Logo from "./Logo";
import Preloader from "./Preloader";

function CrearUsuario() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nroCedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [equipo, setEquipo] = useState("");
  const [cargo, setCargo] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [roles, setRoles] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  useEffect(() => {
    // Esto activa la animación inicial cuando se carga la página
    const createBox = document.querySelector(".createBox");
    createBox.classList.add("cajaLogin");
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/vacaciones/roles/listar-roles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoles(response.data); // Asume que la respuesta es una lista de objetos
      } catch (err) {
        console.error("Error al obtener los roles:", err);
        setError("Error al cargar los roles.");
      }
    };
    fetchRoles();

    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/equipos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEquipos(response.data); // Asume que la respuesta es una lista de objetos
      } catch (err) {
        console.error("Error al obtener los roles:", err);
        setError("Error al cargar los roles.");
      }
    };
    fetchEquipos();

    const fetchCargos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/cargos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCargos(response.data); // Asume que la respuesta es una lista de objetos
      } catch (err) {
        console.error("Error al obtener los roles:", err);
        setError("Error al cargar los roles.");
      }
    };
    fetchCargos();
  }, []);

  //temporizador
  useEffect(() => {
    if (message) {
      const timer = setTimeout(
        () => {
          setMessage("");
          setPopupType(""); // Restablecer el tipo de popup
        },
        popupType === "success" ? 1300 : 3000
      ); // 1.8s para éxito, 3s para error

      return () => clearTimeout(timer); // Limpieza del temporizador
    }
  }, [message, popupType]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que todos los campos requeridos están presentes
    if (
      !nombre ||
      !apellido ||
      !nroCedula ||
      !correo ||
      !contrasena ||
      !telefono ||
      !fechaIngreso ||
      !fechaNacimiento ||
      !estado ||
      !rol ||
      !cargo ||
      !equipo
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const nuevoUsuario = {
      nombre: nombre,
      apellido: apellido,
      nroCedula: parseInt(nroCedula),
      correo: correo,
      telefono: telefono,
      fechaIngreso: fechaIngreso.format("YYYY-MM-DD"),
      fechaNacimiento: fechaNacimiento.format("YYYY-MM-DD"),
      estado: true, // Asegúrate de que 'estado' sea un valor booleano
      rol: {
        id: rol,
      },
      cargo: {
        id: cargo,
      },
      equipo: {
        id: equipo,
      },
    };

    try {
      const token = localStorage.getItem("token"); // Obtener token de autenticación
      const url = "http://localhost:8080/vacaciones/crea/usuarios"; // URL para la creación del nuevo usuario
      await axios.post(url, nuevoUsuario, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
        },
      });
      setMessage("¡Usuario creado con éxito!");
      setPopupType("success");
      setTimeout(() => {
        navigate("/Home");
      }, 1300);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message); // Mostrar mensaje de error del servidor
      } else {
        setError("Error al crear el usuario.");
      }
    }
  };

  return (
    <div className="containerLogin">
      <Preloader duration={650} />
      <div
        className={`createBox ${isAnimating ? "LoginAnim" : ""} ${
          error ? "datosIncorrectos" : ""
        }`}
      >
        <Logo />
        <h2 className="headerCreate">Crear Usuario</h2>
        <form onSubmit={handleSubmit} action="login" method="post">
          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/circulo-de-usuario (2).svg"
                alt="Usuario"
                className="icon"
              />
              <input
                type="text"
                placeholder="Nombre"
                className="inputCreate"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/circulo-de-usuario (2).svg"
                alt="Usuario"
                className="icon"
              />
              <input
                type="text"
                placeholder="Apellido"
                className="inputCreate"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/tarjeta-de-identificacion (1).svg"
                alt="Usuario"
                className="icon"
              />
              <input
                type="number"
                placeholder="Nro de Cedula"
                className="inputCreate no-spinner"
                value={nroCedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/sobre.svg" alt="Usuario" className="icon" />
              <input
                type="text"
                placeholder="Correo"
                className="inputCreate"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <div className="inputGroup datePickerGroup">
              <div className="iconWrap">
                <img
                  src="/dias-del-calendario.svg"
                  alt="Fecha de Ingreso"
                  className="icon"
                />
                <DatePicker
                  label="Seleccionar fecha de nacimiento"
                  selected={fechaNacimiento}
                  onChange={(date) => setFechaNacimiento(date)}
                  dateFormat="yyyy-MM-dd"
                  className="inputCreate"
                  placeholderText="Seleccionar fecha de nacimiento"
                  required
                />
              </div>
            </div>
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <div className="inputGroup datePickerGroup">
              <div className="iconWrap">
                <img
                  src="/dias-del-calendario.svg"
                  alt="Fecha de Ingreso"
                  className="icon"
                />
                <DatePicker
                  label="Seleccionar fecha de ingreso"
                  selected={fechaIngreso}
                  onChange={(date) => setFechaIngreso(date)}
                  dateFormat="yyyy-MM-dd"
                  className="inputCreate"
                  placeholderText="Seleccionar fecha de ingreso"
                  required
                />
              </div>
            </div>
          </LocalizationProvider>

          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/mapa-del-sitio (1).svg" alt="Rol" className="icon" />
              <select
                className="inputCreate"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <option value="" disabled>
                  Rol asignado
                </option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/mapa-del-sitio (1).svg" alt="Cargo" className="icon" />
              <select
                className="inputCreate"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                required
              >
                <option value="" disabled>
                  Cargo asignado
                </option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/mapa-del-sitio (1).svg"
                alt="Equipo"
                className="icon"
              />
              <select
                className="inputCreate"
                value={equipo}
                onChange={(e) => setEquipo(e.target.value)}
                required
              >
                <option value="" disabled>
                  Equipo asignado
                </option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/circulo-de-telefono.svg"
                alt="Telefono"
                className="icon"
              />
              <input
                type="text"
                placeholder="Telefono"
                className="inputCreate"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="button">
            <span>Crear</span>
          </button>
        </form>
        {message && (
          <div
            className={
              popupType === "error" ? "popupErrorCrearUsuario" : "popupExitoso"
            }
            style={{ opacity: 1 }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CrearUsuario;
