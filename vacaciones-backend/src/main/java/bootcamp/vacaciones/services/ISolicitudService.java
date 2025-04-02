package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.SolicitudRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Set;

public interface ISolicitudService {

    List<SolicitudModel> listarSolicitudes();

    SolicitudModel buscarSolicitudPorId(Long idSolicitud);

    SolicitudModel guardarSolicitud(Long idUsuario, SolicitudModel solicitud);

    SolicitudModel actualizarSolicitudConDTO(Long id, SolicitudRequest solicitudRequest);

    SolicitudModel procesarSolicitudConDTO(Long idUsuario, SolicitudRequest solicitudRequest);

    void eliminarSolicitud(Long idSolicitud);

    List<SolicitudModel> obtenerSolicitudesPorUsuario(Long usuarioId);

}
