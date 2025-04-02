package bootcamp.vacaciones.controllers;

//import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.exceptions.UsuarioNoEncontradoException;
import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.UsuarioRequest;
import bootcamp.vacaciones.repositories.RolRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.security.JwtUtils;
import bootcamp.vacaciones.services.EmailService;
import bootcamp.vacaciones.services.IUsuarioService;
import bootcamp.vacaciones.services.RolService;
import bootcamp.vacaciones.utils.PasswordValidator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import bootcamp.vacaciones.security.JwtBlacklist;


@RestController
@RequestMapping("/usuarios")
@CrossOrigin(value = "${app.frontend-url}")
public class UsuarioController {

    private static final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Value("${app.reset-password-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtBlacklist jwtBlacklist;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final PasswordValidator passwordValidator;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioController(JwtUtils jwtUtils, EmailService emailService, JwtBlacklist jwtBlacklist, PasswordValidator passwordValidator) {
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
        this.jwtBlacklist = jwtBlacklist;
        this.passwordValidator = passwordValidator;
    }

    // ========== OPERACIONES CRUD BÁSICAS ==========
    
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody @Valid UsuarioRequest usuarioRequest) {
        try {
            if (!passwordValidator.isValid(usuarioRequest.getContrasena())) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña no cumple con los requisitos de seguridad"));
            }
            
            UsuarioModel nuevoUsuario = usuarioService.guardarUsuario(usuarioRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Usuario creado exitosamente",
                    "usuario", nuevoUsuario
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al crear usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error interno del servidor.",
                    "detalle", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<UsuarioModel>> listarUsuarios() {
        try {
            return ResponseEntity.ok(usuarioService.listarUsuarios());
        } catch (Exception e) {
            logger.error("Error al obtener usuarios: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioModel> obtenerUsuarioPorId(@PathVariable("id") Long id) {
        try {
            UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
            return usuario != null ? ResponseEntity.ok(usuario) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error al buscar usuario por ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioRequest usuarioRequest) {
        try {
            if (usuarioRequest.getContrasena() != null && !passwordValidator.isValid(usuarioRequest.getContrasena())) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña no cumple con los requisitos de seguridad"));
            }

            UsuarioModel usuarioActualizado = usuarioService.actualizarUsuario(id, usuarioRequest);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Usuario actualizado con éxito.",
                    "usuario", usuarioActualizado
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al actualizar usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Ocurrió un error al actualizar el usuario.",
                    "detalle", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
            if (usuario == null) {
                return ResponseEntity.notFound().build();
            }
            usuarioService.eliminarUsuario(usuario);
            return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado exitosamente"));
        } catch (Exception e) {
            logger.error("Error al eliminar usuario: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== BÚSQUEDAS ESPECÍFICAS ==========

    @GetMapping("/cedula/{nroCedula}")
    public ResponseEntity<UsuarioModel> obtenerUsuarioPorCedula(@PathVariable("nroCedula") int nroCedula) {
        try {
            UsuarioModel usuario = usuarioService.buscarUsuarioPorCedula(nroCedula);
            return usuario != null ? ResponseEntity.ok(usuario) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error al buscar usuario por cédula: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/rol/lideres")
    public ResponseEntity<List<UsuarioModel>> listarLideres() {
        try {
            return ResponseEntity.ok(usuarioRepository.findByRolNombreIgnoreCase("LIDER"));
        } catch (Exception e) {
            logger.error("Error al listar líderes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/rol/th")
    public ResponseEntity<List<UsuarioModel>> listarTH() {
        try {
            return ResponseEntity.ok(usuarioRepository.findByRolNombreIgnoreCase("TH"));
        } catch (Exception e) {
            logger.error("Error al listar TH: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== GESTIÓN DE VACACIONES ==========

    @GetMapping("/{id}/dias-disponibles")
    public ResponseEntity<Integer> obtenerDiasDisponiblesPorId(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerDiasVacacionesPorIdUsuario(id));
        } catch (Exception e) {
            logger.error("Error al obtener días disponibles por ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/cedula/{nroCedula}/dias-disponibles")
    public ResponseEntity<Integer> obtenerDiasDisponiblesPorCedula(@PathVariable("nroCedula") int nroCedula) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerDiasVacacionesPorCedula(nroCedula));
        } catch (Exception e) {
            logger.error("Error al obtener días disponibles por cédula: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== GESTIÓN DE CONTRASEÑAS ==========

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        String key = clientIp + ":" + email;

        logger.info("Solicitud recibida para reset-password desde IP: {} con correo: {}", clientIp, email);

        Bucket bucket = buckets.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(3, Refill.greedy(3, Duration.ofMinutes(1)));
            return Bucket4j.builder().addLimit(limit).build();
        });

        if (!bucket.tryConsume(1)) {
            logger.warn("Límite de solicitudes excedido para la clave: {}", key);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Demasiadas solicitudes recientes.");
        }

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

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestHeader("Authorization") String authHeader, @RequestParam String newPassword) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "El encabezado Authorization es requerido."));
            }

            String token = authHeader.substring(7);

            if (!jwtUtils.validateJwtToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "El token es inválido o ha expirado."));
            }

            if (!passwordValidator.isValid(newPassword)) {
                return ResponseEntity.badRequest().body(Map.of("message", "La contraseña no cumple con los requisitos de seguridad"));
            }

            String email = jwtUtils.getUsernameFromJwtToken(token);
            UsuarioModel usuario = usuarioRepository.findByCorreo(email)
                    .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado."));

            usuario.setContrasena(passwordEncoder.encode(newPassword));
            usuario.setRequiereCambioContrasena(false);
            usuarioRepository.save(usuario);

            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente"));
        } catch (UsuarioNoEncontradoException e) {
            logger.error("Error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al actualizar contraseña: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error al actualizar la contraseña"));
        }
    }
}
