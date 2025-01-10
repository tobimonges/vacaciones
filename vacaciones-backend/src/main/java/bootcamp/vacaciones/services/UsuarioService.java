package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
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

    public int obtenerDiasVacacionesPorIdUsuario(Long idUsuario) {
        UsuarioModel usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
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
        if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        if (usuarioRepository.findByNroCedula(usuario.getNroCedula()) != null) {
            throw new IllegalArgumentException("La cédula ya está registrada");
        }
        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
        usuario.setContrasena(contrasenaEncriptada);
        return usuarioRepository.save(usuario);
    }

    @Override
    public void eliminarUsuario(UsuarioModel usuario) {
        usuarioRepository.delete(usuario);
    }
    @Scheduled(cron = "0 04 15 * * ?")
    public void actualizarAntiguedadYVacaciones() {
        List<UsuarioModel> usuarios = usuarioRepository.findAll();

        for (UsuarioModel usuario : usuarios) {
            usuarioRepository.actualizarAntiguedad(usuario.getId());

            UsuarioModel usuarioActualizado = usuarioRepository.findById(usuario.getId()).orElseThrow();

            int years = usuarioRepository.obtenerYears(usuario.getId());
            int months = usuarioRepository.obtenerMonths(usuario.getId());
            int days = usuarioRepository.obtenerDays(usuario.getId());

            if (cumpleAniversario(months, days)) {
                int nuevosDiasVacaciones = calcularDiasVacaciones(years);
                usuarioActualizado.setDiasVacaciones(
                        usuarioActualizado.getDiasVacaciones() + nuevosDiasVacaciones
                );
            }
            usuarioRepository.save(usuarioActualizado);

        }
    }
    public int calcularDiasVacaciones(int years) {
        if (years >= 1 && years < 5) {
            return 12;
        } else if (years >= 5 && years <= 10) {
            return 18;
        } else if (years > 10) {
            return 30;
        }
        return 0;
    }

    public boolean cumpleAniversario(int months, int days) {
        return months == 0 && days == 0;
    }
}
