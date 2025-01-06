package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.payload.SolicitudRequest;
import bootcamp.vacaciones.services.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PostMapping("/solicitudes/dto/{idUsuario}")
    public ResponseEntity<SolicitudModel> procesarSolicitudConDTO(
            @PathVariable Long idUsuario,
            @RequestBody SolicitudRequest solicitudRequest) {
        System.out.println(solicitudRequest.toString());
        try {
            // Aquí llamamos a un método en el servicio que maneje el DTO
            SolicitudModel nuevaSolicitud = solicitudService.procesarSolicitudConDTO(idUsuario, solicitudRequest);
            return ResponseEntity.ok(nuevaSolicitud);
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
    @PutMapping("/solicitudes/{id}")
    public ResponseEntity<SolicitudModel> actualizarSolicitud(
            @PathVariable Long id,
            @RequestBody SolicitudRequest solicitudRequest) {
        try {
            // Llamar al servicio para procesar la solicitud existente
            SolicitudModel solicitudActualizada = solicitudService.actualizarSolicitudConDTO(id, solicitudRequest);
            return ResponseEntity.ok(solicitudActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerSolicitudesPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<SolicitudModel> solicitudes = solicitudService.obtenerSolicitudesPorUsuario(usuarioId);
            return ResponseEntity.ok(solicitudes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener las solicitudes del usuario.");
        }
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<String> aprobarSolicitud(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        try {
            String resultado = solicitudService.aprobarSolicitud(id, usuarioId);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<String> rechazarSolicitud(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @RequestBody Map<String, String> body) {
        try {
            String comentario = body.get("comentario");
            if (comentario == null || comentario.isEmpty()) {
                return ResponseEntity.badRequest().body("El comentario es obligatorio para rechazar una solicitud.");
            }

            String resultado = solicitudService.rechazarSolicitud(id, usuarioId, comentario);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
