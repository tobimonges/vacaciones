package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.SolicitudModel;
import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepositoryImplementation<SolicitudModel, Integer> {
    boolean existsByUsuarioId(Integer usuarioId);
    List<SolicitudModel> findByEstado(Boolean estado);
}

