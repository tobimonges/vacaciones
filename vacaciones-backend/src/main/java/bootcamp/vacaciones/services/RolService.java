package bootcamp.vacaciones.services;

import bootcamp.vacaciones.exceptions.RolNoEncontradoException;
import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.repositories.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RolService implements IRolService {

    @Autowired
    private RolRepository rolRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RolModel> obtenerRoles() {
        return rolRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public RolModel obtenerRolPorId(Long id) {
        Optional<RolModel> rolOptional = rolRepository.findById(id);
        if (rolOptional.isEmpty()) {
            throw new RolNoEncontradoException("No se encontró el rol con ID: " + id);
        }
        return rolOptional.get();
    }

    @Override
    @Transactional(readOnly = true)
    public RolModel obtenerRolPorNombre(String nombre) {
        RolModel rol = rolRepository.findByNombre(nombre);
        if (rol == null) {
            throw new RolNoEncontradoException("No se encontró el rol con nombre: " + nombre);
        }
        return rol;
    }

    @Override
    @Transactional
    public RolModel crearRol(RolModel rol) {
        return rolRepository.save(rol);
    }

    @Override
    @Transactional
    public RolModel actualizarRol(Long id, RolModel rol) {
        RolModel rolExistente = obtenerRolPorId(id);
        rolExistente.setNombre(rol.getNombre());
        return rolRepository.save(rolExistente);
    }

    @Override
    @Transactional
    public void eliminarRol(Long id) {
        if (!rolRepository.existsById(id)) {
            throw new RolNoEncontradoException("Rol no encontrado con ID: " + id);
        }
        rolRepository.deleteById(id);
    }
}
