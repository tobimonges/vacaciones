import { jwtDecode } from "jwt-decode";
import axios from "axios";

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

export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = jwtDecode(token); // Decodifica el JWT
    return payload.rol;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
}

export function isAdmin() {
  const rol = getUserRole();
  return rol?.includes("ADMIN");
}

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

export async function logout() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No hay token almacenado para cerrar sesión.");
    return;
  }
  try {
    // Enviar el token al backend para invalidarlo
    await axios.post(
      "http://localhost:8080/api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Eliminar el token del almacenamiento local
    localStorage.removeItem("token");
    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = "/";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    // Manejar el error, por ejemplo, mostrar un mensaje al usuario
    alert("No se pudo cerrar sesión correctamente. Intenta de nuevo.");
  }
}
