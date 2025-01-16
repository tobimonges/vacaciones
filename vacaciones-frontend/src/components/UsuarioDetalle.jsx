import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

    const handleEditClick = (id) => {
        setSelectedUserId(id);
        setMessage("");
        setError("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
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
            setTimeout(() => {
                setSelectedUserId(null);
                navigate("/Home");
            }, 1500);
        } catch (err) {
            setError("Error al actualizar los datos del usuario.");
            console.error(err);
        }
    };

    return (
        <div className="container-usuario-detalle">
            <h2>Gestión de Usuarios</h2>
            {error && <p className="err">{error}</p>}
            {message && <p className="succ">{message}</p>}
            {!selectedUserId ? (
                <>
                    {usuarios.length === 0 ? (
                        <p>No se encontraron usuarios.</p>
                    ) : (
                        <table className="table">
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
                                            className="btn"
                                            onClick={() => handleEditClick(usuario.id)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <form onSubmit={handleSubmit} className="detalle-form">
              

                    {[
                        { name: "nombre", type: "text", label: "Nombre" },
                        { name: "apellido", type: "text", label: "Apellido" },
                        { name: "nroCedula", type: "number", label: "Número de Cédula" },
                        { name: "correo", type: "email", label: "Correo Electrónico" },
                        { name: "telefono", type: "text", label: "Teléfono" },
                        { name: "fechaIngreso", type: "date", label: "Fecha de Ingreso" }, // Nuevo campo
                        { name: "fechaNacimiento", type: "date", label: "Fecha de Nacimiento" },
                        { name: "estado", type: "boolean", label: "Estado" },
                    ].map(({ name, type, label }) => (
                        <div key={name} className="inputGroupp">
                            <label htmlFor={name}>{label}</label>
                            <input
                                type={type}
                                id={name}
                                name={name}
                                value={formData[name]}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    ))}

                    {[
                        { name: "rol", label: "Rol Asignado", options: roles },
                        { name: "equipo", label: "Equipo Asignado", options: equipos },
                        { name: "cargo", label: "Cargo Asignado", options: cargos },
                    ].map(({ name, label, options }) => (
                        <div key={name} className="inputGroupp">
                            <label htmlFor={name}>{label}</label>
                            <select
                                id={name}
                                name={name}
                                value={formData[name]}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Seleccione {label.toLowerCase()}</option>
                                {options.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.nombre || option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <h3>‎ </h3>
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
                </form>
            )}
        </div>
    );
}

export default UsuarioDetalle;
