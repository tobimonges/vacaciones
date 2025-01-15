package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.CargoModel;
import bootcamp.vacaciones.services.CargoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cargos")
public class CargoController {

    @Autowired
    private CargoService cargoService;

    @PostMapping
    public ResponseEntity<CargoModel> creaCargo(@RequestBody CargoModel cargo) {
        CargoModel createdCargo = cargoService.creaCargo(cargo);
        return ResponseEntity.ok(createdCargo);
    }


    @GetMapping
    public ResponseEntity<List<CargoModel>> listCargo() {
        List<CargoModel> cargos = cargoService.listarCargos();
        return ResponseEntity.ok(cargos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CargoModel> actualizaCargo(@PathVariable Long id, @RequestBody CargoModel updatedCargo) {
        CargoModel cargo = cargoService.actualizaCargo(id, updatedCargo);
        if (cargo != null) {
            return ResponseEntity.ok(cargo);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCargo(@PathVariable Long id) {
        boolean isDeleted = cargoService.deleteCargo(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
