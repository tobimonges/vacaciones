package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.SolicitudRequest;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.services.SolicitudService;
import bootcamp.vacaciones.services.UsuarioService;
import bootcamp.vacaciones.utils.CalendarioUtil;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/vacaciones")
public class SolicitudController {

    private static final Logger logger = LoggerFactory.getLogger(SolicitudController.class);
    private final SolicitudService solicitudService;
    private final UsuarioService usuarioService;

    @Autowired
    public SolicitudController(SolicitudService solicitudService, UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.solicitudService = solicitudService;
        this.usuarioService = usuarioService;
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
    public ResponseEntity<Object> procesarSolicitudConDTO(
            @PathVariable Long idUsuario,
            @RequestBody SolicitudRequest solicitudRequest) {
        System.out.println(solicitudRequest.toString());
        try {
            // Llamamos al servicio que maneja la solicitud
            SolicitudModel nuevaSolicitud = solicitudService.procesarSolicitudConDTO(idUsuario, solicitudRequest);
            return ResponseEntity.ok(nuevaSolicitud);
        } catch (IllegalArgumentException e) {
            // Enviar una respuesta de error detallada
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());  // Mensaje del error capturado
            return ResponseEntity.badRequest().body(errorResponse);  // Respuesta con un cuerpo que contiene el error
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
    public ResponseEntity<Object> actualizarSolicitud(
            @PathVariable Long id,
            @RequestBody SolicitudRequest solicitudRequest) {
        try {
            // Llamar al servicio para procesar la solicitud existente
            SolicitudModel solicitudActualizada = solicitudService.actualizarSolicitudConDTO(id, solicitudRequest);
            return ResponseEntity.ok(solicitudActualizada);
        } catch (IllegalArgumentException e) {
            // Manejar excepciones de argumentos inválidos
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Solicitud inválida",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            // Manejar excepciones generales
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error interno del servidor",
                    "message", e.getMessage()
            ));
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
    public ResponseEntity<Object> aprobarSolicitud(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        logger.info("Recibiendo solicitud de aprobación: idSolicitud={}, usuarioId={}", id, usuarioId);
        try {
            SolicitudModel solicitudActualizada = solicitudService.aprobarSolicitud(id, usuarioId);
            return ResponseEntity.ok(solicitudActualizada);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }



    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(
            @PathVariable Long id,
            @RequestParam Long usuarioId, // Obligatorio para identificar quién rechaza
            @RequestBody(required = false) Map<String, String> body) { // Body opcional
        try {
            // Extraer comentario solo si está presente
            String comentario = body != null ? body.get("comentario") : null;

            // Llamar al servicio unificado
            SolicitudModel solicitudActualizada = solicitudService.rechazarSolicitud(id, usuarioId, comentario);

            return ResponseEntity.ok(solicitudActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error al procesar la solicitud."));
        }
    }



    @GetMapping("/feriados")
    public ResponseEntity<List<Map<String, String>>> obtenerFeriados() {
        return ResponseEntity.ok(solicitudService.obtenerFeriados());
    }


    @GetMapping("/cumpleanos/{idUsuario}")
    public ResponseEntity<Map<String, String>> obtenerCumpleanoPorIdUsuario(@PathVariable Long idUsuario) {
        try {
            Map<String, String> cumpleano = solicitudService.obtenerCumpleanoPorIdUsuario(idUsuario);
            return ResponseEntity.ok(cumpleano);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/obtenercumpleanos")
    public ResponseEntity<List<Map<String, String>>> obtenerLosCumpleaños() {
        return ResponseEntity.ok(solicitudService.obtenerTodosLosCumpleaños());
    }

    @GetMapping("/{liderId}/solicitudes")
    public ResponseEntity<?> obtenerSolicitudesPorLider(@PathVariable Long liderId) {
        try {
            UsuarioModel lider = usuarioService.buscarUsuarioPorId(liderId);
            if (lider == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", "Líder no encontrado"));
            }

            // Accede a las solicitudes del líder
            Set<SolicitudModel> solicitudes = lider.getSolicitudesComoLider();

            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener solicitudes del líder.",
                    "detalle", e.getMessage()
            ));
        }
    }


}
