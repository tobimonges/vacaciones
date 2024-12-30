package bootcamp.vacaciones.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {

    private final String jwtSecret = "2iFBbtE1VvamHUKioDWTW2QudnXeoYJvs5lp+EDWiZKmGxWXnfamjDmnd2A9dtu9HQoTNHJBXb38kCsRez2dOg=="; // Cambia esto por una clave segura
    private final int jwtExpirationMs = 86400000; // 1 día (en milisegundos)

    // Generar un token JWT
    public String generateJwtToken(String username, Long usuarioId) {
        return Jwts.builder()
                .setSubject(username) // Establece el nombre de usuario como "subject"
                .claim("usuarioId", usuarioId) // Incluye el usuarioId en los claims
                .setIssuedAt(new Date()) // Fecha de emisión
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Fecha de expiración
                .signWith(SignatureAlgorithm.HS512, jwtSecret) // Firma con HS512
                .compact(); // Construir el token
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
