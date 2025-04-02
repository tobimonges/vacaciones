package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.CargoModel;
import bootcamp.vacaciones.services.CargoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cargos")
@CrossOrigin(value = "${app.frontend-url}")
public class CargoController {

    private static final Logger logger = LoggerFactory.getLogger(CargoController.class);

    private final CargoService cargoService;

    @Autowired
    public CargoController(CargoService cargoService) {
        this.cargoService = cargoService;
    }

    // ========== OPERACIONES CRUD BASICAS ==========

    /**
     * Crea un nuevo cargo
     */
    @PostMapping
    public ResponseEntity<?> crearCargo(@RequestBody CargoModel cargo) {
        try {
            logger.info("Creando nuevo cargo");
            CargoModel nuevoCargo = cargoService.creaCargo(cargo);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Cargo creado con éxito.",
                    "cargo", nuevoCargo
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al crear cargo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al crear el cargo.",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene todos los cargos
     */
    @GetMapping
    public ResponseEntity<?> listarCargos() {
        try {
            logger.info("Obteniendo lista de cargos");
            List<CargoModel> cargos = cargoService.listarCargos();
            if (cargos.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "mensaje", "No se encontraron cargos"
                ));
            }
            return ResponseEntity.ok(cargos);
        } catch (Exception e) {
            logger.error("Error al obtener cargos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener los cargos.",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Actualiza un cargo existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCargo(@PathVariable Long id, @RequestBody CargoModel cargo) {
        try {
            logger.info("Actualizando cargo con ID: {}", id);
            CargoModel cargoActualizado = cargoService.actualizaCargo(id, cargo);
            if (cargoActualizado == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "No se encontró el cargo con ID " + id
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Cargo actualizado con éxito.",
                    "cargo", cargoActualizado
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al actualizar cargo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al actualizar el cargo.",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Elimina un cargo por su ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCargo(@PathVariable Long id) {
        try {
            logger.info("Eliminando cargo con ID: {}", id);
            boolean eliminado = cargoService.deleteCargo(id);
            if (!eliminado) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "No se encontró el cargo con ID " + id
                ));
            }
            return ResponseEntity.ok(Map.of("mensaje", "Cargo eliminado con éxito."));
        } catch (Exception e) {
            logger.error("Error al eliminar cargo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar el cargo.",
                    "detalle", e.getMessage()
            ));
        }
    }
}
