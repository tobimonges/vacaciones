import jwt_decode from "jwt-decode";
export const getUsuarioId = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwt_decode(token);
    return decoded.usuarioId; // Asegúrate de que el token contenga esta información
  }
  return null;
};
