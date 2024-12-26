package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class UsuarioService implements IUsuarioService{

    UsuarioRepository usuarioRepository;

    @Override
    public List<UsuarioModel> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    public UsuarioModel buscarUsuarioPorCedula(int nroCedula){
        return usuarioRepository.findByNroCedula(nroCedula);
    }

    public int obtenerDiasVacacionesPorCedula(int nroCedula){
        UsuarioModel usuario = usuarioRepository.findByNroCedula(nroCedula);
        if(usuario == null){
            throw new IllegalArgumentException("El usuario no existe");
        }
        return usuario.getDiasVacaciones();
    }

    @Override
    public UsuarioModel buscarUsuarioPorId(Long idUsuario) {
        return usuarioRepository.findById(idUsuario).orElse(null);
    }

    @Override
    public UsuarioModel guardarUsuario(UsuarioModel usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    public void eliminarUsuario(UsuarioModel usuario) {
        usuarioRepository.delete(usuario);
    }
}
