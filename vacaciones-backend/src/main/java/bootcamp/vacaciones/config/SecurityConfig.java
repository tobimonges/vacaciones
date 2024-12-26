package bootcamp.vacaciones.config;

import bootcamp.vacaciones.services.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // 1) Definimos el PasswordEncoder para encriptar las contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // 3) Definimos el SecurityFilterChain, que establece reglas de seguridad
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Deshabilita CSRF solo si estás haciendo pruebas; en producción se recomienda habilitarlo
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
                )

                // Autorizamos requests
                .authorizeHttpRequests(auth -> {
                    // Ejemplo: Rutas que solo puede acceder un ROLE_ADMIN
                    auth.requestMatchers("/admin/**").hasRole("ADMIN");
                    // Rutas que solo puede acceder un ROLE_FUNCIONARIO
                    auth.requestMatchers("/funcionario/**").hasRole("FUNCIONARIO");
                    // Rutas que solo puede acceder un ROLE_INVITADO
                    auth.requestMatchers("/invitado/**").hasRole("INVITADO");
                    // Todo lo demás requiere simplemente estar autenticado
                    auth.anyRequest().authenticated();
                })

                // Configuramos el formulario de login

                .httpBasic(httpBasic -> httpBasic
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                );

        // Importante: Al final construimos la configuración
        return http.build();
    }

    // 4) Creamos un AuthenticationManager que sepa usar nuestro userDetailsService + passwordEncoder
    @Bean
    public AuthenticationManager authManager(HttpSecurity http,
                                             PasswordEncoder passwordEncoder,
                                             UserDetailsService userDetailsService) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);

        return authBuilder.build();

    }
}
