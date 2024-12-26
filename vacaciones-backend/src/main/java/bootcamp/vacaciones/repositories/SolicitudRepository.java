package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.SolicitudModel;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SolicitudRepository extends JpaRepository<SolicitudModel, Integer> {

}

