package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.repositories.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;

    // Constructor (opcional pero útil para inyección de dependencias a través de constructor)
    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public RolModel crearRol(RolModel rol) {
        // Guardamos el rol en la base de datos
        return rolRepository.save(rol);
    }

    public List<RolModel> listarRoles() {
        // Retorna todos los roles
        return rolRepository.findAll();
    }

    public RolModel buscarPorNombre(String nombre) {
        // Usamos nuestro método personalizado
        return rolRepository.findByNombre(nombre);
    }
}
