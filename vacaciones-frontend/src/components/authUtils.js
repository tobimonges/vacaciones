import { jwtDecode } from "jwt-decode";
export const getUsuarioId = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token); // Decodifica el token directamente
      console.log("Token decodificado:", decoded); // Para depuración
      return decoded.usuarioId; // Asegúrate de que el token contenga esta información
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  }
  return null;
};
