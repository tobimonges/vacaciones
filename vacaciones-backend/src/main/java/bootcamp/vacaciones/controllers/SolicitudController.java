package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.services.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacaciones")
public class SolicitudController {
    
    private final SolicitudService solicitudService;
    
    @Autowired
    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping("/solicitudes")
    public List<SolicitudModel> obtenerSolicitudes() {
        return solicitudService.listarSolicitudes();
    }

    @PostMapping("/solicitudes/{idUsuario}")
    public ResponseEntity<SolicitudModel> guardarSolicitud(@PathVariable Long idUsuario, @RequestBody SolicitudModel solicitud) {
        try {
            SolicitudModel newSolicitud = solicitudService.guardarSolicitud(idUsuario, solicitud);
            return ResponseEntity.ok(newSolicitud);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/solicitudes/{id}")
    public ResponseEntity<SolicitudModel> obtenerSolicitudPorId(@PathVariable Long id) {
        SolicitudModel solicitud = solicitudService.buscarSolicitudPorId(id);
        if (solicitud == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(solicitud);
        }
    }

    @DeleteMapping("solicitudes/{id}")
    public ResponseEntity<String> eliminarSolicitud(@PathVariable Long id) {
        try {
            solicitudService.eliminarSolicitud(id);
            return ResponseEntity.ok("Solicitud cancelada exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la solicitud.");
        }
    }

    @PutMapping("solicitudes/{id}")
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
