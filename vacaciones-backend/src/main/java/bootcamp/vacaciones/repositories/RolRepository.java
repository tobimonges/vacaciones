package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.RolModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends JpaRepository<RolModel, Long> {
    RolModel findByNombre(String nombre);
}
