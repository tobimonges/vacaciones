package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Buscar al usuario en la base de datos
        UsuarioModel usuario = usuarioRepository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + username));

        // 2. Obtener el nombre del rol (por ejemplo "ADMIN" o "FUNCIONARIO")
        String rolBD = usuario.getRol().getNombre();
        // Spring Security requiere que el rol tenga el prefijo "ROLE_".
        // Si tu BD ya tiene "ADMIN", "FUNCIONARIO", "INVITADO", no pasa nada.
        // El "roles()" de Spring le antepone "ROLE_" automáticamente.

        // 3. Construimos el UserDetails para que Spring Security lo entienda
        // El password ya debería estar codificado en la BD con BCrypt
        UserBuilder builder = User.withUsername(usuario.getCorreo());
        builder.password(usuario.getContrasena());
        builder.roles(rolBD);
        // → roles("ADMIN") internamente se vuelve "ROLE_ADMIN".
        // 4. Retornamos el objeto de tipo UserDetails
        logger.info("Correo encontrado: {}", usuario.getCorreo());
        logger.info("Rol del usuario: {}", rolBD);
        logger.info("Contraseña encontrada (hasheada): {}", usuario.getContrasena());
        logger.info("Configurando UserDetails con rol: ROLE_{}", rolBD);
        return builder.build();
    }
}
