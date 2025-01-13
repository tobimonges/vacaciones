package bootcamp.vacaciones.repositories;

import bootcamp.vacaciones.models.SolicitudModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface SolicitudRepository extends JpaRepository<SolicitudModel, Long> {
    List<SolicitudModel> findByUsuarioId(Long usuarioId);
    @Query("SELECT s FROM SolicitudModel s WHERE s.usuario.id = :usuarioId AND " +
            "(s.fechaInicio <= :fechaFin AND s.fechaFin >= :fechaInicio)")
    List<SolicitudModel> findConflictingSolicitudes(Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin);
}


