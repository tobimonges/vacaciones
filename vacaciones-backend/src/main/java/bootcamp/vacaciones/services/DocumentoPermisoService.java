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
        if (documento == null || documento.getIdSolicitud() == null) {
            throw new IllegalArgumentException("El documento o la solicitud son inválidos.");
        }
        return documentoPermisoRepository.save(documento);
    }

    public List<DocumentoPermisoModel> obtenerDocumentosPorSolicitud(Long idSolicitud) {
        if (idSolicitud == null) {
            throw new IllegalArgumentException("El ID de la solicitud no puede ser nulo.");
        }
        return documentoPermisoRepository.findByIdSolicitud(idSolicitud);
    }

    public void eliminarDocumento(Long idDocumento) {
        if (!documentoPermisoRepository.existsById(idDocumento)) {
            throw new IllegalArgumentException("El documento con ID " + idDocumento + " no existe.");
        }
        documentoPermisoRepository.deleteById(idDocumento);
    }
}
