package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.DocumentoPermisoModel;
import bootcamp.vacaciones.repositories.DocumentoPermisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentoPermisoService {

    private final DocumentoPermisoRepository documentoPermisoRepository;

    @Autowired
    public DocumentoPermisoService(DocumentoPermisoRepository documentoPermisoRepository) {
        this.documentoPermisoRepository = documentoPermisoRepository;
    }

    public DocumentoPermisoModel guardarDocumento(DocumentoPermisoModel documento) {
        return documentoPermisoRepository.save(documento);
    }

    public List<DocumentoPermisoModel> obtenerDocumentosPorSolicitud(Long idSolicitud) {
        return documentoPermisoRepository.findByIdSolicitud(idSolicitud);
    }

    public void eliminarDocumento(Long idDocumento) {
        documentoPermisoRepository.deleteById(idDocumento);
    }
}
