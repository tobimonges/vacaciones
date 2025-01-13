package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.DocumentoPermisoModel;
import bootcamp.vacaciones.models.DocumentoPermisoModel;
import bootcamp.vacaciones.services.DocumentoPermisoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacaciones/documentos")
public class DocumentoPermisoController {

    private final DocumentoPermisoService documentoPermisoService;

    @Autowired
    public DocumentoPermisoController(DocumentoPermisoService documentoPermisoService) {
        this.documentoPermisoService = documentoPermisoService;
    }

    @PostMapping("/guardar")
    public ResponseEntity<DocumentoPermisoModel> guardarDocumento(@RequestBody DocumentoPermisoModel documento) {
        DocumentoPermisoModel nuevoDocumento = documentoPermisoService.guardarDocumento(documento);
        return ResponseEntity.ok(nuevoDocumento);
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<List<DocumentoPermisoModel>> obtenerDocumentosPorSolicitud(@PathVariable Long idSolicitud) {
        List<DocumentoPermisoModel> documentos = documentoPermisoService.obtenerDocumentosPorSolicitud(idSolicitud);
        return ResponseEntity.ok(documentos);
    }

    @DeleteMapping("/eliminar/{idDocumento}")
    public ResponseEntity<Void> eliminarDocumento(@PathVariable Long idDocumento) {
        documentoPermisoService.eliminarDocumento(idDocumento);
        return ResponseEntity.noContent().build();
    }
}
