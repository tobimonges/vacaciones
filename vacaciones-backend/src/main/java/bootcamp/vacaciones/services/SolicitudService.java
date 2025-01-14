package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.SolicitudRequest;
import bootcamp.vacaciones.repositories.SolicitudRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.utils.CalendarioUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SolicitudService implements ISolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    private final EmailService emailService;

    @Autowired
    public SolicitudService(SolicitudRepository solicitudRepository, UsuarioRepository usuarioRepository, EmailService emailService) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
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

        // Validar conflictos de fechas
        List<SolicitudModel> solicitudesConflicto = solicitudRepository.findConflictingSolicitudes(
                idUsuario, solicitudRequest.getFechaInicio(), solicitudRequest.getFechaFin()
        );

        if (!solicitudesConflicto.isEmpty()) {
            throw new IllegalArgumentException("Ya existe una solicitud en conflicto con las fechas proporcionadas.");
        }

        // Calcular días hábiles
        int diasHabiles = calcularDiasHabiles(
                solicitudRequest.getFechaInicio(),
                solicitudRequest.getFechaFin()
        );

        SolicitudModel nuevaSolicitud = new SolicitudModel();
        nuevaSolicitud.setUsuario(usuario);
        nuevaSolicitud.setLider(lider);
        nuevaSolicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        nuevaSolicitud.setFechaFin(solicitudRequest.getFechaFin());
        nuevaSolicitud.setCantidadDias(diasHabiles);
        nuevaSolicitud.setEstado(false); // Por defecto, pendiente
        nuevaSolicitud.setNumeroAprobaciones(solicitudRequest.getNumeroAprobaciones() != null
                ? solicitudRequest.getNumeroAprobaciones()
                : 0); // Si no está presente, inicializa con 0
        nuevaSolicitud.setRechazado(false);
        nuevaSolicitud.setComentario(solicitudRequest.getComentario());

        // Notificar al líder
        emailService.enviarCorreo(
                lider.getCorreo(),
                "Nueva Solicitud de Vacaciones",
                "<p>El usuario " + usuario.getNombre() + " ha creado una solicitud de vacaciones para las fechas " +
                        nuevaSolicitud.getFechaInicio() + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
        );

        // Notificar a los usuarios con rol "TH"
        List<UsuarioModel> usuariosTh = usuarioRepository.findByRolNombre("TH");
        for (UsuarioModel thUsuario : usuariosTh) {
            emailService.enviarCorreo(
                    thUsuario.getCorreo(),
                    "Nueva Solicitud de Vacaciones",
                    "<p>El usuario " + usuario.getNombre() + " ha creado una solicitud de vacaciones para las fechas " +
                            nuevaSolicitud.getFechaInicio() + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
            );
        }

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

        int diasHabiles = calcularDiasHabiles(
                solicitudRequest.getFechaInicio(),
                solicitudRequest.getFechaFin()
        );

        // Actualizar los campos de la solicitud
        solicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        solicitud.setFechaFin(solicitudRequest.getFechaFin());
        solicitud.setCantidadDias(diasHabiles);


        // Guardar y devolver la solicitud actualizada
        return solicitudRepository.save(solicitud);
    }

    public SolicitudModel aprobarSolicitud(Long solicitudId, Long usuarioId) {
        SolicitudModel solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que el usuario que aprueba no sea el mismo que creó la solicitud
        if (solicitud.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("El usuario no puede aprobar su propia solicitud.");
        }

        if (solicitud.getNumeroAprobaciones() == 0) {
            validarLider(usuario, solicitud);
            solicitud.setNumeroAprobaciones(1);
            solicitud.setRechazado(false);

            emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Aprobada por Líder",
                    "<p>Tu solicitud ha sido aprobada por el líder.</p>"
            );
        } else if (solicitud.getNumeroAprobaciones() == 1) {
            validarRolTh(usuario);
            solicitud.setNumeroAprobaciones(2);
            solicitud.setEstado(true);
            solicitud.setRechazado(false);

            emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Completamente Aprobada",
                    "<p>Tu solicitud ha sido completamente aprobada.</p>"
            );

            actualizarDiasVacaciones(solicitud);

            // Notificar a todos los usuarios con rol "TH"
            List<UsuarioModel> usuariosTh = usuarioRepository.findByRolNombre("TH");
            for (UsuarioModel thUsuario : usuariosTh) {
                emailService.enviarCorreo(
                        thUsuario.getCorreo(),
                        "Aprobación de Solicitud",
                        "<p>La solicitud del usuario <b>" + solicitud.getUsuario().getNombre() + "</b> para las fechas " +
                                solicitud.getFechaInicio() + " a " + solicitud.getFechaFin() + " ha sido aprobada por completo.</p>"
                );
            }
        } else {
            throw new RuntimeException("La solicitud ya está completamente aprobada.");
        }

        return solicitudRepository.save(solicitud);
    }

    private void validarLider(UsuarioModel usuario, SolicitudModel solicitud) {
        if (!solicitud.getLider().getId().equals(usuario.getId())) {
            throw new RuntimeException("Solo el líder asignado puede aprobar esta solicitud.");
        }
    }

    private void validarRolTh(UsuarioModel usuario) {
        if (!"TH".equals(usuario.getRol().getNombre())) {
            throw new RuntimeException("Solo el rol TH puede aprobar en esta etapa.");
        }
    }

    private void actualizarDiasVacaciones(SolicitudModel solicitud) {
        int diasSolicitados = solicitud.getCantidadDias();
        UsuarioModel usuarioRelacionado = solicitud.getUsuario();
        int diasRestantes = usuarioRelacionado.getDiasVacaciones() - diasSolicitados;

        if (diasRestantes < 0) {
            throw new RuntimeException("No hay suficientes días de vacaciones disponibles.");
        }

        usuarioRelacionado.setDiasVacaciones(diasRestantes);
        usuarioRepository.save(usuarioRelacionado);
    }



    public SolicitudModel rechazarSolicitudPorLiderOTh(Long solicitudId, Long usuarioId) {
        SolicitudModel solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar si el usuario es líder asignado o tiene rol TH
        if (solicitud.getNumeroAprobaciones() == 0 && solicitud.getLider().getId().equals(usuario.getId())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
            emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el líder asignado.</p>"
            );
        } else if (solicitud.getNumeroAprobaciones() == 1 && solicitud.getLider().getId().equals(usuario.getId())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
            emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el líder asignado.</p>"
            );
        } else if (solicitud.getNumeroAprobaciones() == 1 && "TH".equals(usuario.getRol().getNombre())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
            emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el área de Talento Humano (TH).</p>"
            );
        } else if (solicitud.getNumeroAprobaciones() == 2 && "TH".equals(usuario.getRol().getNombre())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
            emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el área de Talento Humano (TH).</p>"
            );
        } else {
            throw new RuntimeException("No tienes permiso suficiente para rechazar esta solicitud.");
        }

        return solicitudRepository.save(solicitud); // Retorna la solicitud actualizada
    }

    public SolicitudModel rechazarSolicitudPorOperador(Long solicitudId, Long usuarioId, String comentario) {
        SolicitudModel solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!"OPERACIONES".equals(usuario.getRol().getNombre())) {
            throw new RuntimeException("Solo un usuario con rol OPERACIONES puede rechazar con un motivo.");
        }

        if (comentario == null || comentario.isEmpty()) {
            throw new RuntimeException("El comentario es obligatorio para rechazar una solicitud.");
        }

        if (solicitud.getEstado() && solicitud.getNumeroAprobaciones() == 2) {
            UsuarioModel usuarioRelacionado = solicitud.getUsuario();
            usuarioRelacionado.setDiasVacaciones(
                    usuarioRelacionado.getDiasVacaciones() + solicitud.getCantidadDias()
            );
            usuarioRepository.save(usuarioRelacionado);
        }

        solicitud.setEstado(false);
        solicitud.setRechazado(true); // Aquí está el problema: siempre se marca como true
        solicitud.setComentario(comentario);
        solicitud.setNumeroAprobaciones(0);

        emailService.enviarCorreo(
                solicitud.getUsuario().getCorreo(),
                "Solicitud Rechazada",
                "<p>Tu solicitud de vacaciones ha sido rechazada por el área de Operaciones. <br> Motivo: " + comentario + "</p>"
        );

        return solicitudRepository.save(solicitud); // Retorna la solicitud actualizada
    }

    // Obtener todos los feriados
    public List<Map<String, String>> obtenerFeriados() {
        return CalendarioUtil.obtenerFeriados();
    }

    // Obtener el cumpleaños de un usuario específico
    public Map<String, String> obtenerCumpleanoPorIdUsuario(Long idUsuario) {
        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return CalendarioUtil.obtenerCumpleanosPorUsuario(usuario);
    }

    // Obtener todos los eventos (feriados y cumpleaños)
    public List<Map<String, String>> obtenerTodosLosEventos() {
        List<UsuarioModel> usuarios = usuarioRepository.findAll();
        List<Map<String, String>> feriados = CalendarioUtil.obtenerFeriados();
        List<Map<String, String>> cumpleanos = CalendarioUtil.obtenerCumpleanos(usuarios);

        List<Map<String, String>> eventos = new ArrayList<>();
        eventos.addAll(feriados);
        eventos.addAll(cumpleanos);

        return eventos;
    }


    public int calcularDiasHabiles(LocalDate fechaInicio, LocalDate fechaFin) {
        // Obtener feriados y cumpleaños
        List<Map<String, String>> feriados = CalendarioUtil.obtenerFeriados();
        List<Map<String, String>> cumpleanos = CalendarioUtil.obtenerCumpleanos(usuarioRepository.findAll());
        Set<LocalDate> fechasEspeciales = feriados.stream()
                .map(evento -> LocalDate.parse(evento.get("fecha")))
                .collect(Collectors.toSet());

        fechasEspeciales.addAll(cumpleanos.stream()
                .map(evento -> LocalDate.parse(evento.get("fecha")))
                .collect(Collectors.toSet()));

        // Calcular días hábiles
        int diasHabiles = 0;
        for (LocalDate fecha = fechaInicio; !fecha.isAfter(fechaFin); fecha = fecha.plusDays(1)) {
            if (fecha.getDayOfWeek() != DayOfWeek.SATURDAY &&
                    fecha.getDayOfWeek() != DayOfWeek.SUNDAY &&
                    !fechasEspeciales.contains(fecha)) {
                diasHabiles++;
            }
        }
        return diasHabiles;
    }


}





    

    
    



    




