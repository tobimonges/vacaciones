package bootcamp.vacaciones.repositories;
import bootcamp.vacaciones.models.UsuarioModel;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    Optional<UsuarioModel> findByCorreo(String correo);
    Optional<UsuarioModel> findByNroCedula(int nroCedula);
    List<UsuarioModel> findByRolNombreIgnoreCase(String rolNombre);
    List<UsuarioModel> findByRolNombre(String nombreRol);

    @Query("SELECT u FROM UsuarioModel u WHERE u.rol.nombre = 'LIDER'")
    List<UsuarioModel> listarLideres();

    @Query(value = "SELECT EXTRACT(YEAR FROM antiguedad) FROM usuarios WHERE id_usuario = :id", nativeQuery = true)
    int obtenerYears(@Param("id") Long id);

    @Query(value = "SELECT EXTRACT(MONTH FROM antiguedad) FROM usuarios WHERE id_usuario = :id", nativeQuery = true)
    int obtenerMonths(@Param("id") Long id);

    @Query(value = "SELECT EXTRACT(DAY FROM antiguedad) FROM usuarios WHERE id_usuario = :id", nativeQuery = true)
    int obtenerDays(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE usuarios u SET antiguedad = AGE(CURRENT_DATE, u.fecha_ingreso) WHERE u.id_usuario = :id", nativeQuery = true)
    void actualizarAntiguedad(@Param("id") Long id);
}
