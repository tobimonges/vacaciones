package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;
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

    public SolicitudModel crearSolicitud(Integer usuarioId, SolicitudModel solicitud) {
        if (!solicitudRepository.existsById(usuarioId)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        //aca agregar lo de validar que la fecha no coincida con otra solicitud
        //
        //

        solicitud.setUsuario(usuarioRepository.findById(usuarioId).orElseThrow());
        solicitud.setEstado(true);
        reserva.setFechaHoraSolicitud(LocalDate.);
    }
    

    public List<SolicitudModel> listarSolicitudes() {
        return solicitudRepository.findAll();
    }
}
