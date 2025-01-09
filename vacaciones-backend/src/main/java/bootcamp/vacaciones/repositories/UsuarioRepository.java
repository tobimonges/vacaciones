package bootcamp.vacaciones.repositories;
import bootcamp.vacaciones.models.UsuarioModel;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    UsuarioModel findByNroCedula(int nroCedula);
    Optional<UsuarioModel> findByCorreo(String correo);

    @Query("SELECT u FROM UsuarioModel u WHERE u.rol.nombre = 'LIDER'")
    List<UsuarioModel> listarLideres();

    @Modifying
    @Transactional
    @Query(value = "UPDATE usuarios u SET antiguedad = AGE(CURRENT_DATE, u.fecha_ingreso) WHERE u.id_usuario = :id", nativeQuery = true)
    void actualizarAntiguedad(@Param("id") Long id);
}
