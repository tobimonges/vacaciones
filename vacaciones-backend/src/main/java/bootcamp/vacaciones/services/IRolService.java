package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.RolModel;
import java.util.List;

public interface IRolService {
    List<RolModel> obtenerRoles();
    RolModel obtenerRolPorId(Long id);
    RolModel obtenerRolPorNombre(String nombre);
    RolModel crearRol(RolModel rol);
    RolModel actualizarRol(Long id, RolModel rol);
    void eliminarRol(Long id);
} 