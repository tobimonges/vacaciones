package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.UsuarioRequest;
import jakarta.mail.MessagingException;

import java.util.List;

public interface IUsuarioService {
    List<UsuarioModel> listarUsuarios();

    UsuarioModel buscarUsuarioPorId(Long idUsuario);

    UsuarioModel buscarUsuarioPorCedula(int nroCedula);

    int obtenerDiasVacacionesPorIdUsuario (Long idUsuario);

    int obtenerDiasVacacionesPorCedula(int nroCedula);

    UsuarioModel guardarUsuario(UsuarioRequest usuarioRequest) throws MessagingException;

    void eliminarUsuario(UsuarioModel usuario);

    UsuarioModel actualizarUsuario(Long idUsuario, UsuarioRequest usuarioRequest);

    void actualizarAntiguedadYVacaciones();

    int calcularDiasVacaciones(int years);

    boolean cumpleAniversario(int months, int days);

}
