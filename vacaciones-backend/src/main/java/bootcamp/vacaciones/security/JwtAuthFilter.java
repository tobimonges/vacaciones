package bootcamp.vacaciones.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);


    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtBlacklist jwtBlacklist;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);

            try {
                // Verificar si el token está en la lista negra
                if (jwtBlacklist.isBlacklisted(jwt)) {
                    logger.warn("Token invalidado: {}", jwt);
                    enviarRespuestaJson(response, HttpServletResponse.SC_UNAUTHORIZED, "Token invalidado.");
                    return;
                }

                // Validar el token y establecer la autenticación
                String username = jwtUtils.getUsernameFromJwtToken(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtils.validateJwtToken(jwt)) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (ExpiredJwtException e) {
                logger.warn("Token expirado en la solicitud a {}: {}", request.getRequestURI(), e.getMessage());
                enviarRespuestaJson(response, HttpServletResponse.SC_UNAUTHORIZED, "Token expirado.");
                return;
            } catch (Exception e) {
                logger.error("Error en la autenticación: {}", e.getMessage());
                enviarRespuestaJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error en la autenticación.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }


    private void enviarRespuestaJson(HttpServletResponse response, int status, String mensaje) throws IOException {
        response.setContentType("application/json");
        response.setStatus(status);
        response.getWriter().write(String.format("{\"message\": \"%s\"}", mensaje));
    }


}
