package bootcamp.vacaciones.repositories;

import org.springframework.stereotype.Service;


public interface UsuarioRepository {
    boolean existsById(Integer usuarioId);
}
