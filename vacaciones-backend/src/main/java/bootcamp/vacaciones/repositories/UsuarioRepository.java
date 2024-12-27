package bootcamp.vacaciones.repositories;
import bootcamp.vacaciones.models.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    UsuarioModel findByNroCedula(int nroCedula);
    Optional<UsuarioModel> findByCorreo(String correo);
}
