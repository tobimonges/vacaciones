import * as jwt_decode from "jwt-decode";
export const getUsuarioId = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwt_decode(token); // Decodifica el token
      return decoded.usuarioId; // Asegúrate de que el token contenga el campo usuarioId
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  }
  return null;
};