package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.payload.LoginRequest;
import bootcamp.vacaciones.security.JwtUtils;
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

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class); // Logger para LoginController

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Autowired
    public LoginController(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
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

            // Generar el token JWT
            String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());
            logger.info("JWT generado: " + jwt);

            // Retornar el token
            return ResponseEntity.ok(jwt);
        } catch (Exception e) {
            logger.error("Error en autenticación: " + e.getMessage());
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }
    }
}
