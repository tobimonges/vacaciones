package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.CargoModel;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoRepository extends JpaRepository<CargoModel, Long> {
    // buscar cargo por nombre
    CargoModel findByNombre(String nombre);

    // buscar cargo por id
    Optional<CargoModel> findById(Long id);

    // listar cargos
    @Query("SELECT c FROM CargoModel c")
    List<CargoModel> findAll();
}
