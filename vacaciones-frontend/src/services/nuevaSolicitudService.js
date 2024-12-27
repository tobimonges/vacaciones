// src/services/solicitudService.js
import axios from "axios";
const API_URL = "http://localhost:5000/api/solicitudes"; // Reemplaza con tu URL de backend
// Crear una nueva solicitud
export const createSolicitud = async (solicitud) => {
    try {
        const response = await axios.post(API_URL, solicitud);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// Obtener todas las solicitudes
export const getSolicitudes = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// Obtener una solicitud por ID
export const getSolicitudById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// Actualizar una solicitud por ID
export const updateSolicitud = async (id, solicitud) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, solicitud);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// Eliminar una solicitud por ID
export const deleteSolicitud = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};