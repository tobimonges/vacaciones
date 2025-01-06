package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.SolicitudRequest;
import bootcamp.vacaciones.repositories.SolicitudRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudService implements ISolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public SolicitudService(SolicitudRepository solicitudRepository, UsuarioRepository usuarioRepository) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<SolicitudModel> listarSolicitudes() {
        return solicitudRepository.findAll();
    }


    @Override
    public SolicitudModel guardarSolicitud(Long idUsuario, SolicitudModel solicitud) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }


        // Validar que la fecha no coincida con otra solicitud
        // ...
        solicitud.setUsuario(usuarioRepository.findById(idUsuario).orElseThrow());
        solicitud.setNumeroAprobaciones(0); // Ninguna aprobación inicial
        solicitud.setRechazado(false);

        return solicitudRepository.save(solicitud);
    }


    @Override
    public SolicitudModel buscarSolicitudPorId(Long idSolicitud) {
        return solicitudRepository.findById(idSolicitud).orElse(null);
    }


    @Override
    public void eliminarSolicitud(Long idSolicitud) {
        SolicitudModel solicitud = solicitudRepository.findById(idSolicitud).orElse(null);
        if (solicitud != null) {
            solicitudRepository.delete(solicitud);
        } else {
            throw new IllegalArgumentException("Solicitud no encontrada");
        }
    }

    @Override
    public List<SolicitudModel> obtenerSolicitudesPorUsuario(Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new IllegalArgumentException("El usuario con ID " + usuarioId + " no fue encontrado.");
        }
        return solicitudRepository.findByUsuarioId(usuarioId);
    }
    @Override
    public SolicitudModel procesarSolicitudConDTO(Long idUsuario, SolicitudRequest solicitudRequest) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        UsuarioModel lider = null;
        if (solicitudRequest.getLiderId() != null) {
            lider = usuarioRepository.findById(solicitudRequest.getLiderId())
                    .orElseThrow(() -> new IllegalArgumentException("Líder no encontrado"));
        }

        SolicitudModel nuevaSolicitud = new SolicitudModel();
        nuevaSolicitud.setUsuario(usuario);
        nuevaSolicitud.setLider(lider);
        nuevaSolicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        nuevaSolicitud.setFechaFin(solicitudRequest.getFechaFin());
        nuevaSolicitud.setCantidadDias(solicitudRequest.getCantidadDias());
        nuevaSolicitud.setEstado(false); // Por defecto, pendiente
        nuevaSolicitud.setNumeroAprobaciones(0); // Sin aprobaciones iniciales
        nuevaSolicitud.setRechazado(false); // Por defecto, no rechazada
        nuevaSolicitud.setComentario(solicitudRequest.getComentario());

        return solicitudRepository.save(nuevaSolicitud);
    }
    @Override
    public SolicitudModel actualizarSolicitudConDTO(Long idSolicitud, SolicitudRequest solicitudRequest) {
        // Validar que la solicitud existe
        SolicitudModel solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        // Validar y buscar el líder si está presente en la solicitud
        UsuarioModel lider = null;
        if (solicitudRequest.getLiderId() != null) {
            lider = usuarioRepository.findById(solicitudRequest.getLiderId())
                    .orElseThrow(() -> new IllegalArgumentException("Líder no encontrado"));
        }

        // Actualizar los campos de la solicitud
        solicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        solicitud.setFechaFin(solicitudRequest.getFechaFin());

        // Guardar y devolver la solicitud actualizada
        return solicitudRepository.save(solicitud);
    }

}





    

    
    



    




