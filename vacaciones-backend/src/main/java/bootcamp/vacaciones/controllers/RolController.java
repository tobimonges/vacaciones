package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.services.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@CrossOrigin(value = "${app.frontend-url}")
public class RolController {

    @Autowired
    private RolService rolService;

    // ========== OPERACIONES CRUD BASICAS ==========

    /**
     * Crea un nuevo rol en el sistema
     */
    @PostMapping
    public ResponseEntity<RolModel> crearRol(@RequestBody RolModel rol) {
        return ResponseEntity.ok(rolService.crearRol(rol));
    }

    /**
     * Obtiene todos los roles disponibles
     */
    @GetMapping
    public ResponseEntity<List<RolModel>> obtenerRoles() {
        return ResponseEntity.ok(rolService.obtenerRoles());
    }

    /**
     * Obtiene un rol especifico por su ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RolModel> obtenerRolPorId(@PathVariable Long id) {
        return ResponseEntity.ok(rolService.obtenerRolPorId(id));
    }

    /**
     * Actualiza un rol existente por su ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<RolModel> actualizarRol(@PathVariable Long id, @RequestBody RolModel rol) {
        return ResponseEntity.ok(rolService.actualizarRol(id, rol));
    }

    /**
     * Elimina un rol por su ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id) {
        rolService.eliminarRol(id);
        return ResponseEntity.ok().build();
    }

    // ========== BÚSQUEDAS ESPECÍFICAS ==========

    /**
     * Obtiene un rol por su nombre
     */
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<RolModel> obtenerRolPorNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(rolService.obtenerRolPorNombre(nombre));
    }
}
