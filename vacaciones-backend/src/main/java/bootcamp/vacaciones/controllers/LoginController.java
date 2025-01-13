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
            logger.info("Iniciando autenticación para: " + loginRequest.getUsuario());

            // Buscar el usuario por correo o número de cédula
            UsuarioModel usuario;
            if (loginRequest.getUsuario().contains("@")) {
                usuario = usuarioRepository.findByCorreo(loginRequest.getUsuario())
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            } else {
                int nroCedula;
                try {
                    nroCedula = Integer.parseInt(loginRequest.getUsuario());
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Número de cédula inválido");
                }
                usuario = usuarioRepository.findByNroCedula(nroCedula)
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            }

            // Autenticar al usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            usuario.getCorreo(), // Usar el correo para la autenticación
                            loginRequest.getPassword()
                    )
            );

            logger.info("Autenticación exitosa para: " + usuario.getCorreo());

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generar el token JWT
            String jwt = jwtUtils.generateJwtToken(usuario.getCorreo(), usuario.getId(), usuario.getRol().getNombre());

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
