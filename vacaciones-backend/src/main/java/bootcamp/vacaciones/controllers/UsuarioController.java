package bootcamp.vacaciones.controllers;

//import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.exceptions.UsuarioNoEncontradoException;
import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.RolRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.security.JwtUtils;
import bootcamp.vacaciones.services.EmailService;
import bootcamp.vacaciones.services.IUsuarioService;
import bootcamp.vacaciones.services.RolService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/vacaciones")

@CrossOrigin(value = "http://localhost:5173") //para recibir peticiones del front
public class UsuarioController {

    private static final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Value("${app.reset-password-url}")
    private String baseUrl;

    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioController(JwtUtils jwtUtils, EmailService emailService) {
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }


    @GetMapping("/listarusuarios")
    public List<UsuarioModel> obtenerUsuarios() {
        return usuarioService.listarUsuarios();
    }


    @GetMapping("/buscarcedula/{nroCedula}")
    public ResponseEntity<Optional<UsuarioModel>> obtenerUsuarioPorCedula(@PathVariable("nroCedula")  int nroCedula){
        Optional<UsuarioModel> usuario = Optional.ofNullable(usuarioService.buscarUsuarioPorCedula(nroCedula));
        return usuario.isPresent()
                ? ResponseEntity.ok(usuario)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Optional.empty());
    }

    @GetMapping("/lideres")
    public ResponseEntity<List<UsuarioModel>> listarLideres() {
        List<UsuarioModel> lideres = usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getRol().getNombre().equalsIgnoreCase("LIDER"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lideres);
    }
    @GetMapping("/diasdisponiblesid/{idUsuario}")
    public ResponseEntity<Integer> obtenerDiasDisponiblesPorId(@PathVariable("idUsuario") Long idUsuario) {
        int diasVacaciones = usuarioService.obtenerDiasVacacionesPorIdUsuario(idUsuario);
        return ResponseEntity.ok(diasVacaciones);
    }

    @GetMapping("/diasdisponiblescedula/{nroCedula}")
    public ResponseEntity<Integer> obtenerDiasDisponibles(@PathVariable("nroCedula") int nroCedula) {
        int diasVacaciones = usuarioService.obtenerDiasVacacionesPorCedula(nroCedula);
        return ResponseEntity.ok(diasVacaciones);
    }

    @PostMapping("/crea/usuarios")
    public UsuarioModel guardarUsuario(@RequestBody UsuarioModel usuario) {
        RolModel rol = rolRepository.findById(usuario.getRol().getId())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));
        usuario.setRol(rol);
        return usuarioService.guardarUsuario(usuario);
    }

    @GetMapping("/buscarid/{id}")
    public ResponseEntity<UsuarioModel> obtenerUsuarioPorId(@PathVariable("id") Long id) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.ok(usuario);
        }
    }

    @PutMapping("/modificar/{id}")
    public ResponseEntity<UsuarioModel> actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioModel usuarioRecibido) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            usuario.setNombre(usuarioRecibido.getNombre());
            usuario.setApellido(usuarioRecibido.getApellido());
            usuario.setCorreo(usuarioRecibido.getCorreo());
            usuario.setContrasena(usuarioRecibido.getContrasena());
            usuarioService.guardarUsuario(usuario);
            return ResponseEntity.ok(usuario);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<UsuarioModel> eliminarUsuario(@PathVariable Long id) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            usuarioService.eliminarUsuario(usuario);
            return ResponseEntity.ok(usuario);
        }
    }

    @PostMapping("/usuarios/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        String key = clientIp + ":" + email;

        logger.info("Solicitud recibida para reset-password desde IP: {} con correo: {}", clientIp, email);

        // Configuración del bucket para rate limiting
        Bucket bucket = buckets.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(3, Refill.greedy(3, Duration.ofMinutes(1)));
            return Bucket4j.builder().addLimit(limit).build();
        });

        // Verificar si hay capacidad disponible en el bucket
        if (!bucket.tryConsume(1)) {
            logger.warn("Límite de solicitudes excedido para la clave: {}", key);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Demasiadas solicitudes recientes.");
        }

        // Lógica de reset-password
        if (!emailService.esCorreoValido(email)) {
            logger.warn("Correo inválido recibido: {}", email);
            return ResponseEntity.badRequest().body("Correo inválido.");
        }

        try {
            UsuarioModel usuario = usuarioRepository.findByCorreo(email)
                    .orElseThrow(() -> new UsuarioNoEncontradoException("El correo no se encuentra registrado."));

            String token = jwtUtils.generateResetPasswordToken(usuario.getCorreo(), usuario.getId());
            String resetLink = String.format("%s?token=%s", baseUrl, token);

            logger.info("Enviando correo de reset-password al correo: {}", email);

            emailService.enviarCorreo(
                    email,
                    "Restablecimiento de Contraseña",
                    "<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href='" + resetLink + "'>Restablecer Contraseña</a>"
            );

            return ResponseEntity.ok("Correo enviado con éxito.");
        } catch (UsuarioNoEncontradoException e) {
            logger.error("Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error interno al procesar la solicitud de reset-password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Ocurrió un error interno."));
        }
    }


}
