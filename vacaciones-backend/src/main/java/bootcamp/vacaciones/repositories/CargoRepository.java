package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.CargoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoRepository extends JpaRepository<CargoModel, Long> {
}
