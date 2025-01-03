package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.LoginRequest;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.security.JwtUtils;
import bootcamp.vacaciones.security.JwtBlacklist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UsuarioRepository usuarioRepository;
    private final JwtBlacklist jwtBlacklist;

    @Autowired
    public LoginController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UsuarioRepository usuarioRepository, JwtBlacklist jwtBlacklist) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.usuarioRepository = usuarioRepository;
        this.jwtBlacklist = jwtBlacklist;
    }

    @PostMapping("/login")
    public ResponseEntity<String> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Iniciando autenticación para: " + loginRequest.getEmail());

            // Autenticación del usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            logger.info("Autenticación exitosa para: " + loginRequest.getEmail());

            // Establecer el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Obtener el usuario desde la base de datos
            UsuarioModel usuario = usuarioRepository.findByCorreo(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String rol = usuario.getRol().getNombre(); // Extraer el nombre del rol

            // Generar el token JWT
            String jwt = jwtUtils.generateJwtToken(usuario.getCorreo(), usuario.getId(), rol);

            // Retornar el token
            return ResponseEntity.ok(jwt);
        } catch (Exception e) {
            logger.error("Error en autenticación: " + e.getMessage());
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            jwtBlacklist.addToBlacklist(jwt);
            logger.info("Token invalidado: " + jwt);
            return ResponseEntity.ok("Sesión cerrada correctamente.");
        }
        return ResponseEntity.badRequest().body("Token inválido.");
    }
}
