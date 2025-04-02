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
@RequestMapping("/solicitudes")
@CrossOrigin(value = "${app.frontend-url}")
public class SolicitudController {

    private static final Logger logger = LoggerFactory.getLogger(SolicitudController.class);
    private final SolicitudService solicitudService;
    private final UsuarioService usuarioService;

    @Autowired
    public SolicitudController(SolicitudService solicitudService, UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.solicitudService = solicitudService;
        this.usuarioService = usuarioService;
    }

    // ========== OPERACIONES CRUD BASICAS ==========

    /**
     * Obtiene todas las solicitudes de vacaciones
     */
    @GetMapping
    public ResponseEntity<?> obtenerSolicitudes() {
        try {
            List<SolicitudModel> solicitudes = solicitudService.listarSolicitudes();
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener las solicitudes",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene una solicitud por id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerSolicitudPorId(@PathVariable Long id) {
        try {
            SolicitudModel solicitud = solicitudService.buscarSolicitudPorId(id);
            if (solicitud == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "No se encontró la solicitud con ID " + id
                ));
            }
            return ResponseEntity.ok(solicitud);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener la solicitud",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Crea una nueva solicitud de vacaciones
     */
    @PostMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> crearSolicitud(@PathVariable Long idUsuario, @RequestBody SolicitudRequest solicitudRequest) {
        try {
            SolicitudModel nuevaSolicitud = solicitudService.procesarSolicitudConDTO(idUsuario, solicitudRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Solicitud creada con éxito",
                    "solicitud", nuevaSolicitud
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Solicitud inválida",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al crear la solicitud",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Actualiza una solicitud existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarSolicitud(@PathVariable Long id, @RequestBody SolicitudRequest solicitudRequest) {
        try {
            SolicitudModel solicitudActualizada = solicitudService.actualizarSolicitudConDTO(id, solicitudRequest);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud actualizada con éxito",
                    "solicitud", solicitudActualizada
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Solicitud inválida",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al actualizar la solicitud",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Elimina una solicitud existente
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarSolicitud(@PathVariable Long id) {
        try {
            solicitudService.eliminarSolicitud(id);
            return ResponseEntity.ok(Map.of("mensaje", "Solicitud eliminada con éxito"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No se encontró la solicitud",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar la solicitud",
                    "detalle", e.getMessage()
            ));
        }
    }

    // ========== GESTION DE SOLICITUDES POR USUARIO ==========

    /**
     * Obtiene todas las solicitudes de un usuario específico
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerSolicitudesPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<SolicitudModel> solicitudes = solicitudService.obtenerSolicitudesPorUsuario(usuarioId);
            return ResponseEntity.ok(solicitudes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Usuario no encontrado",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener las solicitudes del usuario",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene todas las solicitudes que debe aprobar un líder
     */
    @GetMapping("/lider/{liderId}")
    public ResponseEntity<?> obtenerSolicitudesPorLider(@PathVariable Long liderId) {
        try {
            UsuarioModel lider = usuarioService.buscarUsuarioPorId(liderId);
            if (lider == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "Líder no encontrado"
                ));
            }
            Set<SolicitudModel> solicitudes = lider.getSolicitudesComoLider();
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener solicitudes del líder",
                    "detalle", e.getMessage()
            ));
        }
    }

    // ========== PROCESAMIENTO DE SOLICITUDES ==========

    /**
     * Crea una solicitud auxiliar en nombre de otro usuario
     */
    @PostMapping("/auxiliar")
    public ResponseEntity<?> crearSolicitudAuxiliar(
            @RequestParam Long usuarioId,
            @RequestParam Long solicitanteId,
            @RequestBody SolicitudRequest solicitudRequest) {
        try {
            SolicitudModel nuevaSolicitud = solicitudService.crearSolicitudAuxiliar(usuarioId, solicitanteId, solicitudRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Solicitud auxiliar creada con éxito",
                    "solicitud", nuevaSolicitud
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Error en la solicitud",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al procesar la solicitud auxiliar",
                    "detalle", e.getMessage()
            ));
        }
    }

    // ========== APROBACIÓN Y RECHAZO DE SOLICITUDES ==========

    /**
     * Aprueba una solicitud de vacaciones
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long id, @RequestParam Long usuarioId) {
        logger.info("Recibiendo solicitud de aprobación: idSolicitud={}, usuarioId={}", id, usuarioId);
        try {
            SolicitudModel solicitudActualizada = solicitudService.aprobarSolicitud(id, usuarioId);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud aprobada con éxito",
                    "solicitud", solicitudActualizada
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Error al aprobar la solicitud",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error interno del servidor",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Rechaza una solicitud de vacaciones
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(
            @PathVariable Long id,
            @RequestParam Long usuarioId,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String comentario = body != null ? body.get("comentario") : null;
            SolicitudModel solicitudActualizada = solicitudService.rechazarSolicitud(id, usuarioId, comentario);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Solicitud rechazada con éxito",
                    "solicitud", solicitudActualizada
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Error al rechazar la solicitud",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error interno del servidor",
                    "detalle", e.getMessage()
            ));
        }
    }

    // ========== INFORMACIÓN DE FERIADOS Y CUMPLEAÑOS ==========

    /**
     * Obtiene la lista de feriados
     */
    @GetMapping("/feriados")
    public ResponseEntity<?> obtenerFeriados() {
        try {
            List<Map<String, String>> feriados = solicitudService.obtenerFeriados();
            return ResponseEntity.ok(Map.of(
                    "feriados", feriados
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener los feriados",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene el cumpleaños de un usuario específico
     */
    @GetMapping("/cumpleanos/{idUsuario}")
    public ResponseEntity<?> obtenerCumpleanoPorIdUsuario(@PathVariable Long idUsuario) {
        try {
            Map<String, String> cumpleano = solicitudService.obtenerCumpleanoPorIdUsuario(idUsuario);
            return ResponseEntity.ok(Map.of(
                    "cumpleano", cumpleano
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Usuario no encontrado",
                    "detalle", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener el cumpleaños",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene todos los cumpleaños
     */
    @GetMapping("/cumpleanos")
    public ResponseEntity<?> obtenerTodosLosCumpleanos() {
        try {
            List<Map<String, String>> cumpleanos = solicitudService.obtenerTodosLosCumpleaños();
            return ResponseEntity.ok(Map.of(
                    "cumpleanos", cumpleanos
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener los cumpleaños",
                    "detalle", e.getMessage()
            ));
        }
    }
}
