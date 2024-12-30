package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;

import java.util.List;

public interface ISolicitudService {

    List<SolicitudModel> listarSolicitudes();

    SolicitudModel buscarSolicitudPorId(Long idSolicitud);

    SolicitudModel guardarSolicitud(Long idUsuario, SolicitudModel solicitud);

    void eliminarSolicitud(Long idSolicitud);

    List<SolicitudModel> obtenerSolicitudesPorUsuario(Long usuarioId);

}
