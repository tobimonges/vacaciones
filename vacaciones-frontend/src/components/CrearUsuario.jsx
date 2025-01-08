import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CrearUsuario.css";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Preloader from "./Preloader";

function CrearUsuario() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nroCedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [roles, setRoles] = useState([]);

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
  }, []);

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
      !fechaIngreso
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (contrasena !== ConfirmPassword) {
      alert(
        "Las contraseñas no coinciden. Por favor, verifica e intenta nuevamente."
      );
      return;
    }

    const nuevoUsuario = {
      nombre: nombre,
      apellido: apellido,
      nroCedula: parseInt(nroCedula),
      correo: correo,
      contrasena: contrasena,
      telefono: telefono,
      fechaIngreso: fechaIngreso.format("YYYY-MM-DD"), // Asegúrate de formatear la fecha
      estado: true, // Asegúrate de que 'estado' sea un valor booleano
      rol: {
        id: rol,
      },
    };

    try {
      const token = localStorage.getItem("token"); // Obtener token de autenticación
      console.log(token);
      const url = "http://localhost:8080/vacaciones/crea/usuarios"; // URL para la creación del nuevo usuario
      await axios.post(url, nuevoUsuario, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
        },
      });
      alert("Usuario creado exitosamente");
      navigate("/Home"); // Redirigir a la página principal u otra
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
        <h2 className="headerCreate">Crear Usuario</h2>
        <form onSubmit={handleSubmit} action="login" method="post">
          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/circulo-de-usuario (2).svg" alt="Usuario" className="icon" />
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
              <img src="/circulo-de-usuario (2).svg" alt="Usuario" className="icon" />
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
              <img src="/tarjeta-de-identificacion (1).svg" alt="Usuario" className="icon" />
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

          <div className="inputGroup">
            <div className="iconWrap">
              <img src="/avatar.svg" alt="Rol" className="icon" />
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

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <div className="inputGroup">
              <div className="iconWrap">
                <img
                  src="/dias-del-calendario.svg"
                  alt="Fecha de Ingreso"
                  className="icon"
                />
                <DatePicker
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
              <img src="/circle-phone-flip (1).svg" alt="Usuario" className="icon" />
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

          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/bloquear-hashtag.svg"
                alt="Contraseña"
                className="icon"
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="inputCreate"
                value={contrasena} // Vincula el valor con el estado
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inputGroup">
            <div className="iconWrap">
              <img
                src="/bloquear-hashtag.svg"
                alt="Contraseña"
                className="icon"
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                className="inputCreate"
                value={ConfirmPassword} // Vincula el valor con el estado
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="button">
            Crear
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearUsuario;
