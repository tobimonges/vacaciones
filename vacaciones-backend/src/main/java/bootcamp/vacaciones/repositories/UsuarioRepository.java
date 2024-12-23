package bootcamp.vacaciones.repositories;
import bootcamp.vacaciones.models.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {

}
