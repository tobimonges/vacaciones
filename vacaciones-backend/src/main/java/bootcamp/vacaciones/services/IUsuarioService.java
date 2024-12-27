package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;

import java.util.List;

public interface IUsuarioService {
    List<UsuarioModel> listarUsuarios();

    UsuarioModel buscarUsuarioPorId(Long idUsuario);

    UsuarioModel buscarUsuarioPorCedula(int nroCedula);

    int obtenerDiasVacacionesPorIdUsuario (Long idUsuario);

    int obtenerDiasVacacionesPorCedula(int nroCedula);

    UsuarioModel guardarUsuario(UsuarioModel usuario);

    void eliminarUsuario(UsuarioModel usuario);

}
