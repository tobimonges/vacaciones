package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.EquipoModel;
import bootcamp.vacaciones.services.EquipoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/equipos")
@CrossOrigin(value = "${app.frontend-url}")
public class EquipoController {

    private static final Logger logger = LoggerFactory.getLogger(EquipoController.class);

    @Autowired
    private EquipoService equipoService;

    // ========== OPERACIONES CRUD BASICAS ==========

    /**
     * Crea un nuevo equipo
     */
    @PostMapping
    public ResponseEntity<EquipoModel> crearEquipo(@RequestBody EquipoModel equipo) {
        try {
            logger.info("Creando nuevo equipo");
            return ResponseEntity.ok(equipoService.guardarEquipo(equipo));
        } catch (Exception e) {
            logger.error("Error al crear equipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene todos los equipos
     */
    @GetMapping
    public ResponseEntity<List<EquipoModel>> obtenerEquipos() {
        try {
            logger.info("Obteniendo lista de equipos");
            return ResponseEntity.ok(equipoService.listarEquipos());
        } catch (Exception e) {
            logger.error("Error al obtener equipos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene un equipo específico por su ID
     * 
     * @param id ID del equipo
     * @return Equipo encontrado o 404 si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<EquipoModel> obtenerEquipoPorId(@PathVariable Long id) {
        try {
            logger.info("Buscando equipo con ID: {}", id);
            EquipoModel equipo = equipoService.buscarEquipoPorId(id);
            return equipo != null ? ResponseEntity.ok(equipo) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error al obtener equipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Actualiza un equipo existente
     * @return Equipo actualizado o 404 si no existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<EquipoModel> actualizarEquipo(
            @PathVariable Long id,
            @RequestBody EquipoModel equipo) {
        try {
            logger.info("Actualizando equipo con ID: {}", id);
            EquipoModel equipoActualizado = equipoService.actualizarEquipo(id, equipo);
            return equipoActualizado != null ? ResponseEntity.ok(equipoActualizado) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error al actualizar equipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Elimina un equipo
     * @return 204 si se eliminó correctamente, 404 si no existe
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEquipo(@PathVariable Long id) {
        try {
            logger.info("Eliminando equipo con ID: {}", id);
            EquipoModel equipo = equipoService.buscarEquipoPorId(id);
            if (equipo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "No se encontró el equipo con ID " + id
                ));
            }
            
            boolean eliminado = equipoService.eliminarEquipo(equipo);
            if (!eliminado) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "error", "No se pudo eliminar el equipo"
                ));
            }
            
            return ResponseEntity.ok(Map.of("mensaje", "Equipo eliminado con éxito"));
        } catch (Exception e) {
            logger.error("Error al eliminar equipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar el equipo",
                    "detalle", e.getMessage()
            ));
        }
    }
}