package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.EquipoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipoRepository extends JpaRepository<EquipoModel, Long> {
    EquipoModel findByNombre(String nombre);
}
