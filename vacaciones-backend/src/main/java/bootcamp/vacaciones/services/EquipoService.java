package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.EquipoModel;
import bootcamp.vacaciones.repositories.EquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipoService {

    @Autowired
    private EquipoRepository equipoRepository;

    public EquipoModel creaEquipo(EquipoModel equipo) {
        return equipoRepository.save(equipo);
    }

    public List<EquipoModel> listEquipo() {
        return equipoRepository.findAll();
    }

    public EquipoModel actualizaEquipo(Long id, EquipoModel updatedEquipo) {
        Optional<EquipoModel> existingEquipo = equipoRepository.findById(id);
        if (existingEquipo.isPresent()) {
            EquipoModel equipo = existingEquipo.get();
            equipo.setNombre(updatedEquipo.getNombre());
            return equipoRepository.save(equipo);
        }
        return null;
    }

    public boolean deleteEquipo(Long id) {
        if (equipoRepository.existsById(id)) {
            equipoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
