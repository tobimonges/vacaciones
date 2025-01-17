package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.DocumentoPermisoModel;
import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.services.DocumentoPermisoService;
import bootcamp.vacaciones.services.EmailService;
import bootcamp.vacaciones.services.GoogleDriveService;
import bootcamp.vacaciones.services.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/vacaciones/documentos")
public class DocumentoPermisoController {

    private final GoogleDriveService googleDriveService;
    private final DocumentoPermisoService documentoPermisoService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SolicitudService solicitudService;

    @Autowired
    public DocumentoPermisoController(DocumentoPermisoService documentoPermisoService, GoogleDriveService googleDriveService) {
        this.documentoPermisoService = documentoPermisoService;
        this.googleDriveService = googleDriveService;
    }

    @PostMapping("/guardar")
    public ResponseEntity<?> guardarDocumento(@RequestBody DocumentoPermisoModel documento) {
        try {
            DocumentoPermisoModel nuevoDocumento = documentoPermisoService.guardarDocumento(documento);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Documento guardado con éxito.",
                    "documento", nuevoDocumento
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al guardar el documento.",
                    "detalle", e.getMessage()
            ));
        }
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<?> obtenerDocumentosPorSolicitud(@PathVariable Long idSolicitud) {
        try {
            List<DocumentoPermisoModel> documentos = documentoPermisoService.obtenerDocumentosPorSolicitud(idSolicitud);
            if (documentos.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "mensaje", "No se encontraron documentos para la solicitud con ID " + idSolicitud
                ));
            }
            return ResponseEntity.ok(documentos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener los documentos.",
                    "detalle", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/eliminar/{idDocumento}")
    public ResponseEntity<?> eliminarDocumento(@PathVariable Long idDocumento) {
        try {
            documentoPermisoService.eliminarDocumento(idDocumento);
            return ResponseEntity.ok(Map.of("mensaje", "Documento eliminado con éxito."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar el documento.",
                    "detalle", e.getMessage()
            ));
        }
    }

    @PostMapping("/subir")
    public ResponseEntity<?> subirArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("idSolicitud") Long idSolicitud) {
        try {
            if (archivo.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "El archivo no puede estar vacío."));
            }

            String tipoMime = archivo.getContentType();
            if (!googleDriveService.esTipoPermitido(tipoMime)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "El tipo de archivo no es válido. Solo se permiten PDF e imágenes."
                ));
            }

            // Validar si la solicitud existe
            SolicitudModel solicitud = solicitudService.buscarSolicitudPorId(idSolicitud);
            if (solicitud == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "No se encontró la solicitud con ID " + idSolicitud
                ));
            }

            CompletableFuture<String> urlArchivoFuture = googleDriveService.subirArchivo(
                    archivo.getOriginalFilename(),
                    tipoMime,
                    archivo.getInputStream()
            );

            urlArchivoFuture.thenAccept(urlArchivo -> {
                DocumentoPermisoModel nuevoDocumento = new DocumentoPermisoModel();
                nuevoDocumento.setIdSolicitud(idSolicitud);
                nuevoDocumento.setUrlDocumento(urlArchivo);
                documentoPermisoService.guardarDocumento(nuevoDocumento);

                if (solicitud.getLideres() != null && !solicitud.getLideres().isEmpty()) {
                    solicitud.getLideres().forEach(lider -> {
                        emailService.enviarCorreo(
                                lider.getCorreo(),
                                "Nuevo documento cargado",
                                "<p>Se ha cargado un nuevo documento para la solicitud #" + idSolicitud + ".</p>" +
                                        "<p>Puede acceder al documento desde el siguiente enlace:</p>" +
                                        "<a href='" + urlArchivo + "'>Ver Documento</a>"
                        );
                    });
                }
            }).exceptionally(ex -> {
                System.err.println("Error al subir el archivo: " + ex.getMessage());
                return null;
            });

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("mensaje", "Archivo subido con éxito y notificación enviada al líder."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al procesar la subida del archivo.",
                    "detalle", e.getMessage()
            ));
        }
    }





}
