package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class UsuarioService implements IUsuarioService{
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UsuarioModel> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    public UsuarioModel buscarUsuarioPorCedula(int nroCedula){
        return usuarioRepository.findByNroCedula(nroCedula);
    }
    @Override
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
        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
        usuario.setContrasena(contrasenaEncriptada);
        return usuarioRepository.save(usuario);    }

    @Override
    public void eliminarUsuario(UsuarioModel usuario) {
        usuarioRepository.delete(usuario);
    }
}
