package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.DocumentoPermisoModel;
import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.services.DocumentoPermisoService;
import bootcamp.vacaciones.services.EmailService;
import bootcamp.vacaciones.services.GoogleDriveService;
import bootcamp.vacaciones.services.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documentos")
@CrossOrigin(value = "${app.frontend-url}")
public class DocumentoPermisoController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoPermisoController.class);

    private final GoogleDriveService googleDriveService;
    private final DocumentoPermisoService documentoPermisoService;
    private final EmailService emailService;
    private final SolicitudService solicitudService;

    @Autowired
    public DocumentoPermisoController(
            DocumentoPermisoService documentoPermisoService,
            GoogleDriveService googleDriveService,
            EmailService emailService,
            SolicitudService solicitudService) {
        this.documentoPermisoService = documentoPermisoService;
        this.googleDriveService = googleDriveService;
        this.emailService = emailService;
        this.solicitudService = solicitudService;
    }

    // ========== OPERACIONES CRUD BÁSICAS ==========

    /**
     * Crea un nuevo documento
     * 
     * @param documento Datos del documento a crear
     * @return Documento creado
     */
    @PostMapping
    public ResponseEntity<?> crearDocumento(@RequestBody DocumentoPermisoModel documento) {
        try {
            logger.info("Creando nuevo documento");
            DocumentoPermisoModel nuevoDocumento = documentoPermisoService.guardarDocumento(documento);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Documento guardado con éxito.",
                    "documento", nuevoDocumento
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al crear documento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al guardar el documento.",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene todos los documentos de una solicitud
     * 
     * @param idSolicitud ID de la solicitud
     * @return Lista de documentos
     */
    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<?> obtenerDocumentosPorSolicitud(@PathVariable Long idSolicitud) {
        try {
            logger.info("Obteniendo documentos para solicitud: {}", idSolicitud);
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
            logger.error("Error al obtener documentos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener los documentos.",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Elimina un documento por su ID
     * 
     * @param idDocumento ID del documento a eliminar
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/{idDocumento}")
    public ResponseEntity<?> eliminarDocumento(@PathVariable Long idDocumento) {
        try {
            logger.info("Eliminando documento con ID: {}", idDocumento);
            documentoPermisoService.eliminarDocumento(idDocumento);
            return ResponseEntity.ok(Map.of("mensaje", "Documento eliminado con éxito."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error al eliminar documento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar el documento.",
                    "detalle", e.getMessage()
            ));
        }
    }

    // ========== GESTIÓN DE ARCHIVOS EN GOOGLE DRIVE ==========

    /**
     * Sube un documento a Google Drive
     * 
     * @param archivo Archivo a subir
     * @param nombreArchivo Nombre del archivo
     * @return ID del archivo en Google Drive
     */
    @PostMapping("/upload")
    public ResponseEntity<?> subirDocumento(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("nombreArchivo") String nombreArchivo) {
        try {
            logger.info("Subiendo documento: {}", nombreArchivo);
            
            if (!googleDriveService.esTipoPermitido(archivo.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo de archivo no permitido"));
            }

            if (!googleDriveService.esTamañoPermitido(archivo.getSize())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El archivo excede el tamaño máximo permitido"));
            }

            String fileId = googleDriveService.subirArchivo(archivo, nombreArchivo);
            return ResponseEntity.ok(Map.of("fileId", fileId));
        } catch (IOException e) {
            logger.error("Error al subir documento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al subir el documento",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Descarga un documento desde Google Drive
     * 
     * @param fileId ID del archivo en Google Drive
     * @return Archivo para descargar
     */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<ByteArrayResource> descargarDocumento(@PathVariable String fileId) {
        try {
            logger.info("Descargando documento con ID: {}", fileId);
            byte[] archivo = googleDriveService.descargarArchivo(fileId);
            String nombreArchivo = googleDriveService.obtenerNombreArchivo(fileId);
            String tipoMIME = googleDriveService.obtenerTipoMIME(fileId);

            ByteArrayResource resource = new ByteArrayResource(archivo);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(tipoMIME))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .body(resource);
        } catch (IOException e) {
            logger.error("Error al descargar documento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Elimina un documento de Google Drive
     * 
     * @param fileId ID del archivo en Google Drive
     * @return Respuesta de confirmación
     */
    @DeleteMapping("/drive/{fileId}")
    public ResponseEntity<?> eliminarDocumentoDrive(@PathVariable String fileId) {
        try {
            logger.info("Eliminando documento de Drive con ID: {}", fileId);
            if (!googleDriveService.existeArchivo(fileId)) {
                return ResponseEntity.notFound().build();
            }

            googleDriveService.eliminarArchivo(fileId);
            return ResponseEntity.ok(Map.of("mensaje", "Documento eliminado de Drive con éxito"));
        } catch (IOException e) {
            logger.error("Error al eliminar documento de Drive: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar el documento de Drive",
                    "detalle", e.getMessage()
            ));
        }
    }

    // ========== INFORMACIÓN DE DOCUMENTOS ==========

    /**
     * Obtiene el link de compartir de un documento
     * 
     * @param fileId ID del archivo en Google Drive
     * @return Link del documento
     */
    @GetMapping("/share/{fileId}")
    public ResponseEntity<?> obtenerLinkDocumento(@PathVariable String fileId) {
        try {
            logger.info("Obteniendo link de compartir para documento: {}", fileId);
            if (!googleDriveService.existeArchivo(fileId)) {
                return ResponseEntity.notFound().build();
            }

            String link = googleDriveService.obtenerLinkArchivo(fileId);
            return ResponseEntity.ok(Map.of("link", link));
        } catch (IOException e) {
            logger.error("Error al obtener link de documento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener el link del documento",
                    "detalle", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene la información de un documento
     * 
     * @param fileId ID del archivo en Google Drive
     * @return Información del documento
     */
    @GetMapping("/info/{fileId}")
    public ResponseEntity<?> obtenerInformacionDocumento(@PathVariable String fileId) {
        try {
            logger.info("Obteniendo información del documento: {}", fileId);
            if (!googleDriveService.existeArchivo(fileId)) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(Map.of(
                "nombre", googleDriveService.obtenerNombreArchivo(fileId),
                "tamaño", googleDriveService.obtenerTamañoArchivo(fileId),
                "tipo", googleDriveService.obtenerTipoMIME(fileId)
            ));
        } catch (IOException e) {
            logger.error("Error al obtener información del documento: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener la información del documento",
                    "detalle", e.getMessage()
            ));
        }
    }
}
