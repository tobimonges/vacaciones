package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.LoginRequest;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.security.JwtUtils;
import bootcamp.vacaciones.security.JwtBlacklist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(value = "${app.frontend-url}")
public class LoginController {

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UsuarioRepository usuarioRepository;
    private final JwtBlacklist jwtBlacklist;

    @Value("${app.reset-password-requires-change-url}")
    private String baseUrl;

    @Autowired
    public LoginController(AuthenticationManager authenticationManager, 
                         JwtUtils jwtUtils, 
                         UsuarioRepository usuarioRepository, 
                         JwtBlacklist jwtBlacklist) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.usuarioRepository = usuarioRepository;
        this.jwtBlacklist = jwtBlacklist;
    }

    // ========== AUTENTICACION ==========

    /**
     * Autentica un usuario y genera un token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Iniciando autenticación para: {}", loginRequest.getUsuario());

            // Buscar el usuario por correo o numero de cedula
            UsuarioModel usuario = buscarUsuario(loginRequest.getUsuario());

            // Autenticar al usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            usuario.getCorreo(),
                            loginRequest.getPassword()
                    )
            );

            logger.info("Autenticación exitosa para: {}", usuario.getCorreo());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generar el token JWT
            String jwt = jwtUtils.generateJwtToken(usuario.getCorreo(), usuario.getId(), usuario.getRol().getNombre());

            // Verificar si requiere cambio de contraseña
            if (usuario.isRequiereCambioContrasena()) {
                String resetLink = String.format("%s?token=%s", baseUrl, jwt);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message", "Redirigir a cambio de contraseña",
                                "redirect", resetLink
                        ));
            }

            return ResponseEntity.ok(Map.of("token", jwt));
        } catch (Exception e) {
            logger.error("Error en autenticación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas"));
        }
    }

    /**
     * Cierra la sesion del usuario invalidando el token JWT
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            jwtBlacklist.addToBlacklist(jwt);
            logger.info("Token invalidado: {}", jwt);
            return ResponseEntity.ok(Map.of("message", "Sesión cerrada correctamente"));
        }
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Token inválido"));
    }

    // ========== METODOS PRIVADOS ==========

    /**
     * Busca un usuario por correo o  ceedula
     */
    private UsuarioModel buscarUsuario(String identificador) {
        if (identificador.contains("@")) {
            return usuarioRepository.findByCorreo(identificador)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        }

        try {
            int nroCedula = Integer.parseInt(identificador);
            return usuarioRepository.findByNroCedula(nroCedula)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Número de cédula inválido");
        }
    }
}
