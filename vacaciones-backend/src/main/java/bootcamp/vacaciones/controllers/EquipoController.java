package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.EquipoModel;
import bootcamp.vacaciones.services.EquipoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    @Autowired
    private EquipoService equipoService;

    @PostMapping
    public ResponseEntity<EquipoModel> creaEquipo(@RequestBody EquipoModel equipo) {
        EquipoModel createdEquipo = equipoService.creaEquipo(equipo);
        return ResponseEntity.ok(createdEquipo);
    }

    @GetMapping
    public ResponseEntity<List<EquipoModel>> listEquipo() {
        List<EquipoModel> equipos = equipoService.listEquipo();
        return ResponseEntity.ok(equipos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoModel> actualizaEquipo(@PathVariable Long id, @RequestBody EquipoModel updatedEquipo) {
        EquipoModel equipo = equipoService.actualizaEquipo(id, updatedEquipo);
        if (equipo != null) {
            return ResponseEntity.ok(equipo);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipo(@PathVariable Long id) {
        boolean isDeleted = equipoService.deleteEquipo(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}