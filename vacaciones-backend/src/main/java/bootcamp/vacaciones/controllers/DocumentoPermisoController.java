package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.DocumentoPermisoModel;
import bootcamp.vacaciones.services.DocumentoPermisoService;
import bootcamp.vacaciones.services.GoogleDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vacaciones/documentos")
public class DocumentoPermisoController {

    private final GoogleDriveService googleDriveService;
    private final DocumentoPermisoService documentoPermisoService;

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

            // Validar el tipo MIME permitido
            String tipoMime = archivo.getContentType();
            if (!googleDriveService.esTipoPermitido(tipoMime)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "error", "El tipo de archivo no es válido. Solo se permiten PDF e imágenes."
                ));
            }

            // Obtener el ID de la carpeta principal desde la configuración
            String folderId = googleDriveService.getRootFolderId();

            // Subir el archivo a Google Drive
            String urlArchivo = googleDriveService.subirArchivo(
                    archivo.getOriginalFilename(),
                    tipoMime,
                    archivo.getInputStream()
            );

            // Guardar la referencia en la base de datos
            DocumentoPermisoModel nuevoDocumento = new DocumentoPermisoModel();
            nuevoDocumento.setIdSolicitud(idSolicitud);
            nuevoDocumento.setUrlDocumento(urlArchivo);
            DocumentoPermisoModel documentoGuardado = documentoPermisoService.guardarDocumento(nuevoDocumento);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Archivo subido con éxito.",
                    "documento", documentoGuardado
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al subir el archivo.",
                    "detalle", e.getMessage()
            ));
        }
    }


}
