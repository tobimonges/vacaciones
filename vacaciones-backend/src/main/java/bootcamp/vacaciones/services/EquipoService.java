package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.EquipoModel;
import bootcamp.vacaciones.repositories.EquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class EquipoService implements IEquipoService {

    private static final Logger logger = LoggerFactory.getLogger(EquipoService.class);

    private final EquipoRepository equipoRepository;

    @Autowired
    public EquipoService(EquipoRepository equipoRepository) {
        this.equipoRepository = equipoRepository;
    }

    @Override
    public List<EquipoModel> listarEquipos() {
        logger.info("Obteniendo lista de equipos");
        return equipoRepository.findAll();
    }

    @Override
    public EquipoModel buscarEquipoPorId(Long id) {
        logger.info("Buscando equipo con ID: {}", id);
        return equipoRepository.findById(id).orElse(null);
    }

    @Override
    public EquipoModel guardarEquipo(EquipoModel equipo) {
        logger.info("Guardando nuevo equipo");
        return equipoRepository.save(equipo);
    }

    @Override
    public boolean eliminarEquipo(EquipoModel equipo) {
        logger.info("Eliminando equipo con ID: {}", equipo.getId());
        try {
            equipoRepository.delete(equipo);
            return true;
        } catch (Exception e) {
            logger.error("Error al eliminar equipo: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public EquipoModel actualizarEquipo(Long id, EquipoModel equipo) {
        logger.info("Actualizando equipo con ID: {}", id);
        Optional<EquipoModel> equipoExistente = equipoRepository.findById(id);
        if (equipoExistente.isPresent()) {
            EquipoModel equipoActual = equipoExistente.get();
            equipoActual.setNombre(equipo.getNombre());
            return equipoRepository.save(equipoActual);
        }
        return null;
    }

    @Override
    public List<EquipoModel> buscarEquiposPorLider(Long idLider) {
        logger.info("Buscando equipos por líder con ID: {}", idLider);
        return equipoRepository.findByLiderId(idLider);
    }

    @Override
    public void asignarLiderAEquipo(Long idEquipo, Long idLider) {
        logger.info("Asignando líder {} al equipo {}", idLider, idEquipo);
        Optional<EquipoModel> equipo = equipoRepository.findById(idEquipo);
        if (equipo.isPresent()) {
            EquipoModel equipoActual = equipo.get();
            equipoActual.setLiderId(idLider);
            equipoRepository.save(equipoActual);
        }
    }


    @Override
    public void removerLiderDeEquipo(Long idEquipo) {
        logger.info("Removiendo líder del equipo {}", idEquipo);
        Optional<EquipoModel> equipo = equipoRepository.findById(idEquipo);
        if (equipo.isPresent()) {
            EquipoModel equipoActual = equipo.get();
            equipoActual.setLiderId(null);
            equipoRepository.save(equipoActual);
        }
    }
}
