package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.UsuarioRequest;

import java.util.List;

public interface IUsuarioService {
    List<UsuarioModel> listarUsuarios();

    UsuarioModel buscarUsuarioPorId(Long idUsuario);

    UsuarioModel buscarUsuarioPorCedula(int nroCedula);

    int obtenerDiasVacacionesPorIdUsuario (Long idUsuario);

    int obtenerDiasVacacionesPorCedula(int nroCedula);

    UsuarioModel guardarUsuario(UsuarioRequest usuarioRequest);

    void eliminarUsuario(UsuarioModel usuario);

    UsuarioModel actualizarUsuario(Long idUsuario, UsuarioRequest usuarioRequest);

}
