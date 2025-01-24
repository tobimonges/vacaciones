import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import dayjs from "dayjs";
import Preloader from "./Preloader";
import NavigationBar from "./NavigationBar";
import "./UsuarioDetalle.css";

function UsuarioDetalle() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nroCedula: "",
    correo: "",
    telefono: "",
    fechaIngreso: "",
    fechaNacimiento: "",
    estado: true,
    rol: "",
    equipo: "",
    cargo: "",
  });
  const [roles, setRoles] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const navigate = useNavigate();

  // Obtener lista de usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:8080/vacaciones/listarusuarios",
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsuarios(response.data);
      } catch (err) {
        setError("No se pudieron cargar los usuarios.");
        console.error(err);
      }
    };

    fetchUsuarios();
  }, []);

  // Obtener datos para roles, equipos y cargos
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");

        const [rolesRes, equiposRes, cargosRes] = await Promise.all([
          axios.get("http://localhost:8080/vacaciones/roles/listar-roles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/equipos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/cargos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRoles(rolesRes.data);
        setEquipos(equiposRes.data);
        setCargos(cargosRes.data);
      } catch (err) {
        setError("No se pudieron cargar los datos de roles, equipos o cargos.");
        console.error(err);
      }
    };

    fetchOptions();
  }, []);

  // Obtener datos del usuario seleccionado
  useEffect(() => {
    if (selectedUserId) {
      const fetchUsuario = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
              `http://localhost:8080/vacaciones/buscarid/${selectedUserId}`,
              { headers: { Authorization: `Bearer ${token}` } }
          );
          const usuario = response.data;
          setFormData({
            ...usuario,
            rol: usuario.rol?.id || "",
            equipo: usuario.equipo?.id || "",
            cargo: usuario.cargo?.id || "",
          });
        } catch (err) {
          setError("Error al cargar los datos del usuario.");
          console.error(err);
        }
      };

      fetchUsuario();
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setPopupType("");
      }, popupType === "success" ? 1300 : 3000);

      return () => clearTimeout(timer);
    }
  }, [message, popupType]);

  const handleEditClick = (id) => {
    setSelectedUserId(id);
    setMessage("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prevData) => ({ ...prevData, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const updatedData = {
        ...formData,
        rol: { id: formData.rol },
        equipo: { id: formData.equipo },
        cargo: { id: formData.cargo },
      };

      await axios.put(
          `http://localhost:8080/vacaciones/modificar/${selectedUserId}`,
          updatedData,
          { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Usuario actualizado con éxito.");
      setPopupType("success");
      setTimeout(() => {
        setSelectedUserId(null);
        navigate("/Home");
      }, 1500);
    } catch (err) {
      if (err.response.data.hasOwnProperty("nombre")) {
        setMessage(err.response.data.nombre);
      } else if (err.response.data.hasOwnProperty("apellido")) {
        setMessage(err.response.data.apellido);
      } else if (err.response.data.hasOwnProperty("fechaIngreso")) {
        setMessage(err.response.data.fechaIngreso);
      } else if (err.response.data.hasOwnProperty("fechaNacimiento")) {
        setMessage(err.response.data.fechaNacimiento);
      } else if (err.response.data.hasOwnProperty("correo")) {
        setMessage(err.response.data.correo);
      } else if (err.response.data.hasOwnProperty("telefono")) {
        setMessage(err.response.data.telefono);
      } else {
        setMessage("Error al actualizar los datos del usuario.");
      }
      setPopupType("error");
    }
  };

  return (
      <div className="container">
        <div className="container-detalle2">
          {/* 📚 **Área de contenido** */}
          <Preloader duration={650} />

          <div className="content-area2">
            {/* 📚 **Barra de navegación** */}
            <div className="navbar">
              <div className="navbar-content">
                <NavigationBar onLogout={handleLogout} />
              </div>
            </div>

            {/* 📚 **Contenido principal** */}
            <div className="main">
              <div className="main-content">
                <br></br>
                <br></br>
                {error && <p className="err">{error}</p>}
                {message && (
                    <div className={popupType === "error" ? "popupErrorCrearUsuario" : "popupExitoso"} style={{ opacity: 1 }}>
                      {message}
                    </div>
                )}
                {!selectedUserId ? (
                    <>
                      {usuarios.length === 0 ? (
                          <p>No se encontraron usuarios.</p>
                      ) : (
                          <div className="content-section">
                            <table className="admin-table">
                              <thead>
                              <tr>
                                <th>Nro Cedula</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Correo</th>
                                <th>Acciones</th>
                              </tr>
                              </thead>
                              <tbody>
                              {usuarios.map((usuario) => (
                                  <tr key={usuario.id}>
                                    <td>{usuario.nroCedula}</td>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.apellido}</td>
                                    <td>{usuario.correo}</td>
                                    <td>
                                      <button
                                          className="boton"
                                          onClick={() => handleEditClick(usuario.id)}
                                      >
                                        Editar
                                      </button>
                                    </td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      )}
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="detalle-form2">
                      {[
                        {
                          name: "nombre",
                          type: "text",
                          placeholder: "Nombre",
                          label: "Nombre",
                          icon: "/circulo-de-usuario (2).svg",
                        },
                        {
                          name: "apellido",
                          type: "text",
                          placeholder: "Apellido",
                          label: "Apellido",
                          icon: "/circulo-de-usuario (2).svg",
                        },
                        {
                          name: "nroCedula",
                          type: "number",
                          placeholder: "Nro de Cedula",
                          label: "CI",
                          icon: "/tarjeta-de-identificacion (1).svg",
                        },
                        {
                          name: "correo",
                          type: "text",
                          placeholder: "Correo",
                          label: "Correo",
                          icon: "/sobre.svg",
                        },
                        {
                          name: "telefono",
                          type: "text",
                          placeholder: "Telefono",
                          label: "Telefono",
                          icon: "/circulo-de-telefono.svg",
                        },
                      ].map(({ name, type, label, icon }) => (
                          <div key={name}>
                            <label htmlFor={name} className="label-detalle">
                              {label}
                            </label>
                            <div className="iconWrap">
                              <img src={icon} className="icon" />
                              <input
                                  type={type}
                                  id={name}
                                  name={name}
                                  value={formData[name]}
                                  className="inputCreate"
                                  onChange={handleInputChange}
                                  required
                              />
                            </div>
                          </div>
                      ))}

                      {[
                        {
                          name: "estado",
                          type: "boolean",
                          label: "Estado Funcionario",
                          options: [
                            { id: true, nombre: "Contratado" },
                            { id: false, nombre: "Ex-Funcionario" },
                          ],
                        },
                        {
                          name: "rol",
                          label: "Rol de Funcionario",
                          options: roles,
                        },
                        {
                          name: "equipo",
                          label: "Equipo Asignado",
                          options: equipos,
                        },
                        {
                          name: "cargo",
                          label: "Cargo Asignado",
                          options: cargos,
                        },
                      ].map(({ name, label, options }) => (
                          <div>
                            <label htmlFor={name} className="label-detalle">
                              {label}
                            </label>
                            <div className="iconWrap">
                              <img
                                  src="/mapa-del-sitio (1).svg"
                                  alt={label}
                                  className="icon"
                              />
                              <select
                                  id={name}
                                  name={name}
                                  value={formData[name]}
                                  className="inputCreate"
                                  onChange={handleInputChange}
                                  required
                              >
                                {options.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.nombre || option.name}
                                    </option>
                                ))}
                              </select>
                            </div>
                          </div>
                      ))}

                      {[
                        {
                          name: "fechaIngreso",
                          type: "date",
                          label: "Fecha de Ingreso",
                          icon: "/dias-del-calendario.svg",
                        },
                        {
                          name: "fechaNacimiento",
                          type: "date",
                          label: "Fecha de Nacimiento",
                          icon: "/dias-del-calendario.svg",
                        },
                      ].map(({ name, type, label, icon }) => (
                          <div key={name}>
                            <LocalizationProvider
                                key={name}
                                dateAdapter={AdapterDayjs}
                                adapterLocale="es"
                            >
                              <label htmlFor={name} className="label-detalle2">
                                {label}
                              </label>
                              <div className="iconWrap">
                                <img src={icon} className="icon" />
                                <div className="datePickerGroup">
                                  <DatePicker
                                      value={
                                        formData[name] ? dayjs(formData[name]) : null
                                      } // Asegúrate de usar dayjs para valores válidos
                                      onChange={(date) =>
                                          handleDateChange(
                                              name,
                                              date ? date.format("YYYY-MM-DD") : ""
                                          )
                                      }
                                      slotProps={{
                                        textField: {
                                          variant: "outlined",
                                          fullWidth: true,
                                          className: "inputCreate",
                                          required: true,
                                        },
                                      }}
                                  />
                                </div>
                              </div>
                            </LocalizationProvider>
                          </div>
                      ))}
                      <div className="boton-container">
                        <button type="submit" className="boton">
                          Guardar Cambios
                        </button>
                        <button
                            type="button"
                            className="boton"
                            onClick={() => setSelectedUserId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
export default UsuarioDetalle;