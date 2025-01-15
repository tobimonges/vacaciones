package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.DocumentoPermisoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoPermisoRepository extends JpaRepository<DocumentoPermisoModel, Long> {
    List<DocumentoPermisoModel> findByIdSolicitud(Long idSolicitud);
}
