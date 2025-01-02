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

export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return exp > currentTime;
  } catch (error) {
    console.error("Error al validar el token:", error);
    return false;
  }
};
