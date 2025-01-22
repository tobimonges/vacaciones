package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.UsuarioRequest;
import bootcamp.vacaciones.repositories.RolRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.utils.GeneradorContraseña;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService implements IUsuarioService{
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final EmailService emailService;
    @Autowired
    private RolRepository rolRepository;

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


    public UsuarioModel guardarUsuario(UsuarioRequest usuarioRequest) {
        if (usuarioRepository.findByCorreo(usuarioRequest.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        if (usuarioRepository.findByNroCedula(usuarioRequest.getNroCedula()).isPresent()) {
            throw new IllegalArgumentException("La cédula ya está registrada");
        }


        UsuarioModel usuario = new UsuarioModel();
        usuario.setNombre(usuarioRequest.getNombre());
        usuario.setApellido(usuarioRequest.getApellido());
        usuario.setNroCedula(usuarioRequest.getNroCedula());
        usuario.setCorreo(usuarioRequest.getCorreo());
        usuario.setFechaNacimiento(usuarioRequest.getFechaNacimiento());
        usuario.setTelefono(usuarioRequest.getTelefono());
        usuario.setFechaIngreso(usuarioRequest.getFechaIngreso());
        usuario.setEstado(usuarioRequest.isEstado());
        usuario.setRol(usuarioRequest.getRol());
        usuario.setCargo(usuarioRequest.getCargo());
        usuario.setEquipo(usuarioRequest.getEquipo());
        usuario.setRequiereCambioContrasena(true);



        if (usuarioRequest.getContrasena() == null || usuarioRequest.getContrasena().isEmpty()) {
            String passwordAleatoria = GeneradorContraseña.generarContraseñaAleatoria();

            emailService.enviarCorreo(
                    usuarioRequest.getCorreo(),
                    "Modificar Contraseña",
                    "<p>Bienvenido/a " + usuarioRequest.getNombre() + ",</p>" +
                            "<p>Se ha creado una cuenta en el sistema para solicitar vacaciones. Su contraseña temporal es:</p>" +
                            "<h3>" + passwordAleatoria + "</h3>" +
                            "<p>Por favor cambie su contraseña para acceder al sistema.</p>" +
                            "<p>Saludos</p>"
            );

            usuario.setContrasena(passwordEncoder.encode(passwordAleatoria));
        }

        return usuarioRepository.save(usuario);
    }

    @Override
    public UsuarioModel actualizarUsuario(Long idUsuario, UsuarioRequest usuarioRequest) {
        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe"));

        Optional<UsuarioModel> usuarioConCorreo = usuarioRepository.findByCorreo(usuarioRequest.getCorreo());
        if (usuarioConCorreo.isPresent() && !usuarioConCorreo.get().getId().equals(idUsuario)) {
            throw new IllegalArgumentException("El correo ya está en uso.");
        }

        Optional<UsuarioModel> usuarioConCedula = usuarioRepository.findByNroCedula(usuarioRequest.getNroCedula());
        if (usuarioConCedula.isPresent() && !usuarioConCedula.get().getId().equals(idUsuario)) {
            throw new IllegalArgumentException("El número de cédula ya está registrado.");
        }

        usuario.setNombre(usuarioRequest.getNombre());
        usuario.setApellido(usuarioRequest.getApellido());
        usuario.setNroCedula(usuarioRequest.getNroCedula());
        usuario.setCorreo(usuarioRequest.getCorreo());
        usuario.setFechaIngreso(usuarioRequest.getFechaIngreso());
        usuario.setFechaNacimiento(usuarioRequest.getFechaNacimiento());
        usuario.setTelefono(usuarioRequest.getTelefono());
        usuario.setEstado(usuarioRequest.isEstado());
        usuario.setRol(usuarioRequest.getRol());
        usuario.setCargo(usuarioRequest.getCargo());
        usuario.setEquipo(usuarioRequest.getEquipo());



        return usuarioRepository.save(usuario);
    }


    @Override
    public void eliminarUsuario(UsuarioModel usuario) {
        usuarioRepository.delete(usuario);
    }

    @Scheduled(cron = "0 00 00 * * ?")
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
                    usuarioActualizado.setDiasVacacionesRestante(usuarioActualizado.getDiasVacaciones()+usuarioActualizado.getDiasVacacionesRestante());
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
