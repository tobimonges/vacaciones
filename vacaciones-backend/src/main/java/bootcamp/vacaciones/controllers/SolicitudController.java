package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.services.SolicitudService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {
    private final SolicitudService solicitudService;
    public SolicitudController(SolicitudService solicitudService) {

        this.solicitudService = solicitudService;
    }

    @GetMapping
    public ResponseEntity<List<SolicitudModel>> obtenerSolicitudes() {
        return ResponseEntity.ok(solicitudService.listarSolicitudes());
    }

    @PostMapping("/{usuarioId}")
    public ResponseEntity<SolicitudModel> crearSolicitud(@PathVariable Long usuarioId, @RequestBody SolicitudModel solicitud) {
        try {
            SolicitudModel newSolicitud = solicitudService.crearSolicitud(usuarioId, solicitud);
            return ResponseEntity.ok(newSolicitud);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelarSolicitud(@PathVariable Long id) {
        try {
            solicitudService.cancelarSolicitud(id);
            return ResponseEntity.ok("Solicitud cancelada exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al cancelar la solicitud.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarSolicitud(
            @PathVariable Long id,
            @RequestBody SolicitudModel nuevaSolicitud) {
        try {
            SolicitudModel solicitudActualizada = solicitudService.editarSolicitud(id, nuevaSolicitud);
            return ResponseEntity.ok(solicitudActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al editar la solicitud.");
        }
    }
}
