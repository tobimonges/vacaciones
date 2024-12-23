package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.SolicitudRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SolicitudService {
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    public SolicitudService(SolicitudRepository solicitudRepository, UsuarioRepository usuarioRepository) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public SolicitudModel crearSolicitud(Long usuarioId, SolicitudModel solicitud) {
    if (!usuarioRepository.existsById(usuarioId)) {
        throw new IllegalArgumentException("Usuario no encontrado");
    }
    // Validar que la fecha no coincida con otra solicitud
    // ...

    solicitud.setUsuario(usuarioRepository.findById(usuarioId).orElseThrow());
    solicitud.setEstado(true);
    solicitud.setFechaInicio(solicitud.getFechaInicio());
    solicitud.setFechaFin(solicitud.getFechaFin());

    return solicitudRepository.save(solicitud);

    }

    public void cancelarSolicitud(Long id) {
        Integer id_int = Math.toIntExact(id);
        SolicitudModel solicitud = solicitudRepository.findById(id_int)
            .orElseThrow(() -> new IllegalArgumentException("La solicitud no se encontro!!."));

        solicitudRepository.delete(solicitud);
    }




    public List<SolicitudModel> listarSolicitudes() {
        return solicitudRepository.findAll();
    }
}


