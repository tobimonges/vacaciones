package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.utils.GeneradorContraseña;
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

    private final EmailService emailService;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public List<UsuarioModel> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    public UsuarioModel buscarUsuarioPorCedula(int nroCedula) {
        return usuarioRepository.findByNroCedula(nroCedula)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));
    }

    @Override
    public int obtenerDiasVacacionesPorCedula(int nroCedula) {
        int diasVacacionesDisponibles=0;
        UsuarioModel usuario = usuarioRepository.findByNroCedula(nroCedula)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));
        diasVacacionesDisponibles=usuario.getDiasVacaciones()+usuario.getDiasVacacionesRestante();
        return diasVacacionesDisponibles;
    }


    public int obtenerDiasVacacionesPorIdUsuario(Long idUsuario) {
        int diasVacacionesDisponibles=0;
        UsuarioModel usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
            throw new IllegalArgumentException("El usuario no existe");
        }
        diasVacacionesDisponibles=usuario.getDiasVacaciones()+usuario.getDiasVacacionesRestante();
        return diasVacacionesDisponibles;
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
        if (usuarioRepository.findByNroCedula(usuario.getNroCedula()).isPresent()) {
            throw new IllegalArgumentException("La cédula ya está registrada");
        }
        if (usuario.getContrasena() == null || usuario.getContrasena().isEmpty()) {
            String passwordAleatoria = GeneradorContraseña.generarContraseñaAleatoria();


            emailService.enviarCorreo(
                    usuario.getCorreo(),
                    "Modificar Contraseña",
                    "<p>Bienvenido/a " + usuario.getNombre() + ",</p>" +
                            "<p>Se ha creado una cuenta en el sistema para solicitar vacaciones.  Su contraseña temporal es:</p>" +
                            "<h3>" + passwordAleatoria + "</h3>" +
                            "<p>Por favor cambie su contraseña para acceder al sistema.</p>" +
                            "<p>Saludos</p>"

            );

            usuario.setContrasena(passwordEncoder.encode(passwordAleatoria));
        }
        return usuarioRepository.save(usuario);
    }

    @Override
    public UsuarioModel actualizarUsuario(Long idUsuario, UsuarioModel usuarioRecibido) {
        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        usuario.setNombre(usuarioRecibido.getNombre());
        usuario.setApellido(usuarioRecibido.getApellido());
        usuario.setCorreo(usuarioRecibido.getCorreo());
        usuario.setFechaNacimiento(usuarioRecibido.getFechaNacimiento());
        usuario.setTelefono(usuarioRecibido.getTelefono());
        usuario.setEstado(usuarioRecibido.isEstado());

        if (usuarioRecibido.getRol() != null) {
            usuario.setRol(usuarioRecibido.getRol());
        }
        if (usuarioRecibido.getEquipo() != null) {
            usuario.setEquipo(usuarioRecibido.getEquipo());
        }
        if (usuarioRecibido.getCargo() != null) {
            usuario.setCargo(usuarioRecibido.getCargo());
        }

        return usuarioRepository.save(usuario);
    }

    @Override
    public void eliminarUsuario(UsuarioModel usuario) {
        usuarioRepository.delete(usuario);
    }

    @Scheduled(cron = "0 08 14 * * ?")
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
                if (usuarioActualizado.getDiasVacaciones()>0){
                    usuarioActualizado.setDiasVacacionesRestante(usuarioActualizado.getDiasVacaciones());
                }
                usuarioActualizado.setDiasVacaciones(nuevosDiasVacaciones );
            }
            usuarioRepository.save(usuarioActualizado);

        }
    }
    public int calcularDiasVacaciones(int years) {
        if (years >= 1 && years < 6) {
            return 12;
        } else if (years >= 6 && years <= 10) {
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
