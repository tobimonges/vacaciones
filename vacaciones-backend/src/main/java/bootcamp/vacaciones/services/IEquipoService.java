package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.EquipoModel;
import java.util.List;

public interface IEquipoService {
    List<EquipoModel> listarEquipos();
    EquipoModel buscarEquipoPorId(Long id);
    EquipoModel guardarEquipo(EquipoModel equipo);
    boolean eliminarEquipo(EquipoModel equipo);
    EquipoModel actualizarEquipo(Long id, EquipoModel equipo);
    List<EquipoModel> buscarEquiposPorLider(Long idLider);
    void asignarLiderAEquipo(Long idEquipo, Long idLider);
    void removerLiderDeEquipo(Long idEquipo);

}