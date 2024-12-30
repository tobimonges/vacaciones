package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.SolicitudModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface SolicitudRepository extends JpaRepository<SolicitudModel, Long> {
    List<SolicitudModel> findByUsuarioId(Long usuarioId);
}

