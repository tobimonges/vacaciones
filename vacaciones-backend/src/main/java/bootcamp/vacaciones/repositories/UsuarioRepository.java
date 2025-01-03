package bootcamp.vacaciones.repositories;
import bootcamp.vacaciones.models.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {
    UsuarioModel findByNroCedula(int nroCedula);
    Optional<UsuarioModel> findByCorreo(String correo);

    @Query("SELECT u FROM UsuarioModel u WHERE u.rol.nombre = 'LIDER'")
    List<UsuarioModel> listarLideres();

}
