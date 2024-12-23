package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.services.SolicitudService;
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
}
