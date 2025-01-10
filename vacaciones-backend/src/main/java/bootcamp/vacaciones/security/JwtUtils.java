package bootcamp.vacaciones.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration-reset-password}")
    private int jwtExpirationResetPassword;

    @Value("${jwt.secret}")
    private String jwtSecret;
    @Value("${jwt.expiration-login}")
    private int jwtExpirationLogin;

    private final int jwtExpirationMs = 86400000; // 1 día (en milisegundos)

    // Generar un token JWT
    public String generateJwtToken(String username, Long usuarioId, String rol) {
        return Jwts.builder()
                .setSubject(username)
                .claim("usuarioId", usuarioId)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plus(Duration.ofMinutes(jwtExpirationLogin)))) // Duración en minutos
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    // Generar token para reset-password
    public String generateResetPasswordToken(String email, Long userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plus(Duration.ofMinutes(jwtExpirationResetPassword)))) // 30 minutos
                .signWith(SignatureAlgorithm.HS512, secretKey)
                .compact();
    }

    // Obtener el username del token JWT
    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody()
                .getSubject(); // Retorna el "subject" (nombre de usuario)
    }

    // Obtener el usuarioId del token JWT
    public Long getUsuarioIdFromJwtToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody()
                .get("usuarioId", Long.class); // Retorna el "usuarioId" del claim
    }

    // Validar un token JWT
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken); // Verifica la firma y validez del token
            return true;
        } catch (SignatureException e) {
            System.err.println("Firma inválida: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("Token malformado: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("Token expirado: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("Token no soportado: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("Token vacío: " + e.getMessage());
        }
        return false;
    }
}
