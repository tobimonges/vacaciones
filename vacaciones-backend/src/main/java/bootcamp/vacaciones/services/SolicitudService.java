package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.SolicitudModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.payload.SolicitudRequest;
import bootcamp.vacaciones.repositories.SolicitudRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.utils.CalendarioUtil;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.LoggerFactory;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SolicitudService implements ISolicitudService {

    private static final Logger logger = LoggerFactory.getLogger(SolicitudService.class);
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    private final EmailService emailService;
    private final UsuarioService usuarioService;

    @Autowired
    public SolicitudService(SolicitudRepository solicitudRepository, UsuarioRepository usuarioRepository, EmailService emailService, UsuarioService usuarioService) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.usuarioService = usuarioService;
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

        String nombreRol = usuario.getRol().getNombre();
        UsuarioModel lider = null;

        // Validación para que el rol diferente a DIRECTORIO no pueda ingresar un líder nulo
        if (!"DIRECTORIO".equals(nombreRol) && solicitudRequest.getLiderId() == null) {
            throw new IllegalArgumentException("El líder no puede ser nulo para este rol.");
        }

        if (solicitudRequest.getLiderId() != null) {
            lider = usuarioRepository.findById(solicitudRequest.getLiderId())
                    .orElseThrow(() -> new IllegalArgumentException("Líder no encontrado"));

            if (lider.getId().equals(idUsuario)) {
                throw new IllegalArgumentException("El usuario no puede seleccionarse a sí mismo como líder.");
            }

            switch (nombreRol) {
                case "FUNCIONARIO_FABRICA":
                    if (!esLiderValido(lider, new String[]{"LIDER", "OPERACIONES", "DIRECTORIO"})) {
                        throw new IllegalArgumentException("El líder seleccionado debe tener el rol de LIDER, OPERACIONES o DIRECTORIO.");
                    }
                    break;

                case "FUNCIONARIO_TERCERIZADO":
                    if (!esLiderValido(lider, new String[]{"OPERACIONES", "DIRECTORIO"})) {
                        throw new IllegalArgumentException("El líder seleccionado debe tener el rol de OPERACIONES o DIRECTORIO.");
                    }
                    break;

                case "TH":
                    if (!esLiderValido(lider, new String[]{"OPERACIONES", "DIRECTORIO"})) {
                        throw new IllegalArgumentException("El líder seleccionado debe tener el rol de OPERACIONES o DIRECTORIO.");
                    }
                    break;

                case "OPERACIONES":
                    if (!esLiderValido(lider, new String[]{"DIRECTORIO"})) {
                        throw new IllegalArgumentException("El líder seleccionado debe tener el rol de DIRECTORIO.");
                    }
                    break;

                case "LIDER":
                    if (!esLiderValido(lider, new String[]{"OPERACIONES", "DIRECTORIO"})) {
                        throw new IllegalArgumentException("El líder seleccionado debe tener el rol de OPERACIONES o DIRECTORIO.");
                    }
                    break;

                case "DIRECTORIO":
                    // El rol DIRECTORIO no selecciona un líder
                    throw new IllegalArgumentException("El rol DIRECTORIO no selecciona un líder.");

                default:
                    throw new IllegalArgumentException("Rol no soportado para la creación de solicitudes.");
            }
        }

        // Validación para que los días solicitados no excedan los días disponibles
        int diasDisponibles = usuario.getDiasVacaciones();
        if (solicitudRequest.getCantidadDias() > diasDisponibles) {
            throw new IllegalArgumentException("No tienes suficientes días de vacaciones disponibles.");
        }

        List<SolicitudModel> solicitudesConflicto = solicitudRepository.findConflictingSolicitudes(
                idUsuario, solicitudRequest.getFechaInicio(), solicitudRequest.getFechaFin()
        );

        if (!solicitudesConflicto.isEmpty()) {
            throw new IllegalArgumentException("Ya existe una solicitud en conflicto con las fechas proporcionadas.");
        }

        int diasHabiles = calcularDiasHabiles(
                solicitudRequest.getFechaInicio(),
                solicitudRequest.getFechaFin(),
                usuario.getId()
        );

        // Crear la solicitud
        SolicitudModel nuevaSolicitud = new SolicitudModel();
        nuevaSolicitud.setUsuario(usuario);
        nuevaSolicitud.setLider(lider);
        nuevaSolicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        nuevaSolicitud.setFechaFin(solicitudRequest.getFechaFin());
        nuevaSolicitud.setCantidadDias(diasHabiles);
        nuevaSolicitud.setEstado(false);
        nuevaSolicitud.setNumeroAprobaciones(0);  // Aseguramos que se guarde con numeroAprobaciones = 0 por defecto
        nuevaSolicitud.setRechazado(false);
        nuevaSolicitud.setComentario(solicitudRequest.getComentario());

        // Si el rol es DIRECTORIO, la solicitud se aprueba automáticamente con numeroAprobaciones = 2
        if ("DIRECTORIO".equals(nombreRol)) {
            nuevaSolicitud.setNumeroAprobaciones(2);
            nuevaSolicitud.setEstado(true);  // Solicitud aprobada automáticamente
            actualizarDiasVacaciones(nuevaSolicitud);  // Actualizamos los días de vacaciones
        }

        // Notificaciones según el rol
//        switch (nombreRol) {
//            case "FUNCIONARIO_FABRICA":
//                // Notificar al líder seleccionado
//                emailService.enviarCorreo(
//                        lider.getCorreo(),
//                        "Nueva Solicitud de Vacaciones (Líder)",
//                        "<p>Se le ha asignado una nueva solicitud de vacaciones del usuario " + usuario.getNombre() + " " + usuario.getApellido() +
//                                "<p>Fechas: " + nuevaSolicitud.getFechaInicio() + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
//                );
//                break;
//
//            case "OPERACIONES":
//                // Notificar al líder de Operaciones seleccionado
//                emailService.enviarCorreo(
//                        lider.getCorreo(),
//                        "Nueva Solicitud de Vacaciones (Operaciones)",
//                        "<p>Se le ha asignado una nueva solicitud de vacaciones del usuario " + usuario.getNombre() + " " + usuario.getApellido() +  ".</p>" +
//                                "<p>Fechas: " + nuevaSolicitud.getFechaInicio() + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
//                );
//                break;
//
//            case "FUNCIONARIO_TERCERIZADO":
//            case "LIDER":
//                // Notificar al líder seleccionado en lugar de a TH
//                emailService.enviarCorreo(
//                        lider.getCorreo(),
//                        "Nueva Solicitud de Vacaciones (Líder)",
//                        "<p>El usuario " + usuario.getNombre() + " " + usuario.getApellido() + " ha creado una solicitud de vacaciones para las fechas " +
//                                nuevaSolicitud.getFechaInicio() + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
//                );
//                break;
//
//            case "TH":
//                // Enviar notificación a los TH (esto debería ser un caso separado si es que los TH crean solicitudes)
//                List<UsuarioModel> usuariosTh = usuarioRepository.findByRolNombre("TH");
//                for (UsuarioModel thUsuario : usuariosTh) {
//                    emailService.enviarCorreo(
//                            thUsuario.getCorreo(),
//                            "Nueva Solicitud de Vacaciones",
//                            "<p>El usuario " + usuario.getNombre() + " " + usuario.getApellido() + " ha creado una solicitud de vacaciones para las fechas " +
//                                    nuevaSolicitud.getFechaInicio() + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
//                    );
//                }
//                break;
//
//            case "DIRECTORIO":
//                // Enviamos correos de notificación para DIRECTORIO (ya aprobada)
//                List<UsuarioModel> usuariosTh2 = usuarioRepository.findByRolNombre("TH");
//                for (UsuarioModel thUsuario : usuariosTh2) {
//                    emailService.enviarCorreo(
//                            thUsuario.getCorreo(),
//                            "Solicitud de Vacaciones Aprobada (DIRECTORIO)",
//                            "<p>El usuario " + usuario.getNombre() + " " + usuario.getApellido()
//                                    + " (DIRECTORIO) ha creado y aprobado su solicitud de vacaciones automáticamente.</p>" +
//                                    "<p>Fechas: " + nuevaSolicitud.getFechaInicio()
//                                    + " a " + nuevaSolicitud.getFechaFin() + ".</p>"
//                    );
//                }
//
//                // (Opcional) Notificar también al propio DIRECTORIO
//                emailService.enviarCorreo(
//                        usuario.getCorreo(),
//                        "Solicitud de Vacaciones Aprobada (DIRECTORIO)",
//                        "<p>Tu solicitud de vacaciones ha sido aprobada automáticamente.</p>"
//                );
//                break;
//        }

        return solicitudRepository.save(nuevaSolicitud);
    }


    public boolean esLiderValido(UsuarioModel lider, String[] rolesPermitidos) {
        for (String rol : rolesPermitidos) {
            if (lider.getRol().getNombre().equals(rol)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public SolicitudModel actualizarSolicitudConDTO(Long idSolicitud, SolicitudRequest solicitudRequest) {
        SolicitudModel solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        UsuarioModel lider = null;
        if (solicitudRequest.getLiderId() != null) {
            lider = usuarioRepository.findById(solicitudRequest.getLiderId())
                    .orElseThrow(() -> new IllegalArgumentException("Líder no encontrado"));
        }

        UsuarioModel usuario = solicitud.getUsuario();
        if (usuario == null) {
            throw new IllegalArgumentException("El usuario asociado a la solicitud no fue encontrado.");
        }

        //se hace el calculo de los dias solicitados
        int diasHabiles = calcularDiasHabiles(
                solicitudRequest.getFechaInicio(),
                solicitudRequest.getFechaFin(),
                usuario.getId()
        );

        solicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        solicitud.setFechaFin(solicitudRequest.getFechaFin());
        solicitud.setCantidadDias(diasHabiles);



        return solicitudRepository.save(solicitud);
    }

    public SolicitudModel aprobarSolicitud(Long solicitudId, Long usuarioQueApruebaId) {
        logger.info("Iniciando el proceso de aprobación de solicitud con ID: {} por el usuario con ID: {}", solicitudId, usuarioQueApruebaId);

        // 1. Recuperar la solicitud y el usuario que aprueba
        SolicitudModel solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> {
                    logger.error("Solicitud con ID: {} no encontrada.", solicitudId);
                    return new IllegalArgumentException("Solicitud no encontrada");
                });

        UsuarioModel usuarioQueAprueba = usuarioRepository.findById(usuarioQueApruebaId)
                .orElseThrow(() -> {
                    logger.error("Usuario con ID: {} no encontrado.", usuarioQueApruebaId);
                    return new IllegalArgumentException("Usuario no encontrado");
                });

        // 2. Evitar que alguien apruebe su propia solicitud
        if (solicitud.getUsuario().getId().equals(usuarioQueApruebaId)) {
            logger.error("El usuario con ID: {} está intentando aprobar su propia solicitud con ID: {}", usuarioQueApruebaId, solicitudId);
            throw new IllegalArgumentException("El usuario no puede aprobar su propia solicitud.");
        }

        logger.info("Validación de aprobación: El usuario con ID: {} está intentando aprobar la solicitud con ID: {}", usuarioQueApruebaId, solicitudId);

        // 3. Verificar si el solicitante es DIRECTORIO
        String rolSolicitante = solicitud.getUsuario().getRol().getNombre();
        if ("DIRECTORIO".equals(rolSolicitante)) {
            // El rol DIRECTORIO ya aprueba la solicitud en el momento de la creación
            logger.info("El solicitante con ID: {} es DIRECTORIO, la solicitud ya está aprobada.", solicitud.getUsuario().getId());
        } else {
            // 4. Flujo normal de dos pasos si no es DIRECTORIO
            if (solicitud.getNumeroAprobaciones() == 0) {
                // Paso 1: Debe aprobar el líder asignado
                logger.info("Paso 1: La solicitud con ID: {} requiere la aprobación del líder con ID: {}", solicitudId, usuarioQueApruebaId);
                validarLider(usuarioQueAprueba, solicitud);
                solicitud.setNumeroAprobaciones(1);
                solicitud.setRechazado(false);

//                // Notificamos al solicitante que su solicitud fue aprobada por el líder
//                notificarUsuario(
//                        solicitud.getUsuario().getCorreo(),
//                        "Solicitud Aprobada por Líder",
//                        "<p>Tu solicitud ha sido aprobada por tu líder.</p>" +
//                                "<p>Ahora está pendiente la aprobación de TH.</p>"
//                );
//
//                // Notificamos a los usuarios TH que hay una solicitud pendiente de su aprobación
//                notificarTH(
//                        "Solicitud Pendiente de Aprobación (TH)",
//                        "La solicitud del usuario " + solicitud.getUsuario().getNombre() +
//                                " está pendiente de aprobación por parte de TH."
//                );
            } else if (solicitud.getNumeroAprobaciones() == 1) {
                // Paso 2: Debe aprobar un usuario con rol TH
                logger.info("Paso 2: La solicitud con ID: {} requiere la aprobación de TH.", solicitudId);
                validarRolTh(usuarioQueAprueba);
                solicitud.setNumeroAprobaciones(2);
                solicitud.setEstado(true);
                solicitud.setRechazado(false);

//                // Notificar al solicitante que su solicitud fue completamente aprobada
//                notificarUsuario(
//                        solicitud.getUsuario().getCorreo(),
//                        "Solicitud Completamente Aprobada",
//                        "<p>Tu solicitud ha sido aprobada por TH y se encuentra activa.</p>"
//                );

                // Actualizar los días de vacaciones ya que la solicitud ha sido aprobada
                logger.info("La solicitud con ID: {} ha sido aprobada, actualizando los días de vacaciones.", solicitudId);
                actualizarDiasVacaciones(solicitud);
            } else {
                logger.error("La solicitud con ID: {} ya está completamente aprobada.", solicitudId);
                throw new IllegalArgumentException("La solicitud ya está completamente aprobada.");
            }
        }

        // Guardamos los cambios en la base de datos
        logger.info("Guardando los cambios de la solicitud con ID: {}", solicitudId);
        return solicitudRepository.save(solicitud);
    }

    // Método auxiliar para validar que el usuario sea el líder asignado
    private void validarLider(UsuarioModel usuarioQueAprueba, SolicitudModel solicitud) {
        if (solicitud.getLider() == null) {
            logger.error("La solicitud con ID: {} no tiene líder asignado.", solicitud.getId());
            throw new IllegalArgumentException("Esta solicitud no tiene líder asignado, no puede aprobarse.");
        }
        if (!solicitud.getLider().getId().equals(usuarioQueAprueba.getId())) {
            logger.error("El usuario con ID: {} no es el líder de la solicitud con ID: {}", usuarioQueAprueba.getId(), solicitud.getId());
            throw new IllegalArgumentException("Solo el líder asignado puede aprobar esta solicitud en el primer paso.");
        }
    }

    // Método auxiliar para validar que sea un TH
    private void validarRolTh(UsuarioModel usuarioQueAprueba) {
        if (!"TH".equals(usuarioQueAprueba.getRol().getNombre())) {
            logger.error("El usuario con ID: {} no tiene el rol de TH para aprobar esta solicitud.", usuarioQueAprueba.getId());
            throw new IllegalArgumentException("Solo un usuario con rol TH puede aprobar en esta etapa.");
        }
    }

    // Método para notificar a todos los TH
    private void notificarTH(String asunto, String mensaje) {
        List<UsuarioModel> usuariosTh = usuarioRepository.findByRolNombre("TH");
        for (UsuarioModel thUsuario : usuariosTh) {
            try {
                emailService.enviarCorreo(thUsuario.getCorreo(), asunto, mensaje);
            } catch (Exception e) {
                logger.error("Error al enviar correo a TH con email {}: {}", thUsuario.getCorreo(), e.getMessage());
            }
        }
    }

    // Método para notificar al solicitante (o a un usuario en particular)
    private void notificarUsuario(String correoDestino, String asunto, String mensajeHtml) {
        try {
            emailService.enviarCorreo(correoDestino, asunto, mensajeHtml);
        } catch (Exception e) {
            logger.error("Error al enviar correo al usuario {}: {}", correoDestino, e.getMessage());
        }
    }

    private void actualizarDiasVacaciones(SolicitudModel solicitud) {
        UsuarioModel usuario = solicitud.getUsuario();

        int diasRestantesSolicitados = solicitud.getCantidadDias();

        if (usuario.getDiasVacacionesRestante() >= diasRestantesSolicitados) {
            usuario.setDiasVacacionesRestante(usuario.getDiasVacacionesRestante() - diasRestantesSolicitados);
            diasRestantesSolicitados = 0;
        } else {
            diasRestantesSolicitados -= usuario.getDiasVacacionesRestante();
            usuario.setDiasVacacionesRestante(0);
        }

        if (diasRestantesSolicitados > 0) {
            if (usuario.getDiasVacaciones() >= diasRestantesSolicitados) {
                usuario.setDiasVacaciones(usuario.getDiasVacaciones() - diasRestantesSolicitados);
                diasRestantesSolicitados = 0;
            } else {
                throw new IllegalArgumentException("No hay suficientes días de vacaciones disponibles.");
            }
        }
        usuarioRepository.save(usuario);;
    }

    private void actualizarDiasVacacionesRechazado(SolicitudModel solicitud) {
        UsuarioModel usuario = solicitud.getUsuario();
        int diasRecuperados = solicitud.getCantidadDias();

        int years = usuarioRepository.obtenerYears(usuario.getId());
        int maxDiasVacaciones = usuarioService.calcularDiasVacaciones(years);

        if (usuario.getDiasVacaciones() + diasRecuperados <= maxDiasVacaciones) {
            usuario.setDiasVacaciones(usuario.getDiasVacaciones() + diasRecuperados);
        } else {
            int sobrante = (usuario.getDiasVacaciones() + diasRecuperados) - maxDiasVacaciones;
            usuario.setDiasVacaciones(maxDiasVacaciones);
            usuario.setDiasVacacionesRestante(usuario.getDiasVacacionesRestante() + sobrante);
        }

        usuarioRepository.save(usuario);
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
         /*   emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el líder asignado.</p>"
            );*/
        } else if (solicitud.getNumeroAprobaciones() == 1 && solicitud.getLider().getId().equals(usuario.getId())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
           /* emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el líder asignado.</p>"
            );*/
        } else if (solicitud.getNumeroAprobaciones() == 1 && "TH".equals(usuario.getRol().getNombre())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
            /*emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el área de Talento Humano (TH).</p>"
            );*/
        } else if (solicitud.getNumeroAprobaciones() == 2 && "TH".equals(usuario.getRol().getNombre())) {
            solicitud.setEstado(false);
            solicitud.setRechazado(true);
            solicitud.setNumeroAprobaciones(0);
            /*emailService.enviarCorreo(
                    solicitud.getUsuario().getCorreo(),
                    "Solicitud Rechazada",
                    "<p>Tu solicitud de vacaciones ha sido rechazada por el área de Talento Humano (TH).</p>"
            );*/
            actualizarDiasVacacionesRechazado(solicitud);

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
        //


        solicitud.setEstado(false);
        solicitud.setRechazado(true); // Aquí está el problema: siempre se marca como true
        solicitud.setComentario(comentario);
        solicitud.setNumeroAprobaciones(0);

        /*emailService.enviarCorreo(
                solicitud.getUsuario().getCorreo(),
                "Solicitud Rechazada",
                "<p>Tu solicitud de vacaciones ha sido rechazada por el área de Operaciones. <br> Motivo: " + comentario + "</p>"
        );*/
        actualizarDiasVacacionesRechazado(solicitud);
        return solicitudRepository.save(solicitud); // Retorna la solicitud actualizada
    }

    public List<Map<String, String>> obtenerFeriados() {
        return CalendarioUtil.obtenerFeriados();
    }

    public Map<String, String> obtenerCumpleanoPorIdUsuario(Long idUsuario) {
        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return CalendarioUtil.obtenerCumpleanosPorUsuario(usuario);
    }

    public List<Map<String, String>> obtenerTodosLosEventos() {
        List<UsuarioModel> usuarios = usuarioRepository.findAll();
        List<Map<String, String>> feriados = CalendarioUtil.obtenerFeriados();
        List<Map<String, String>> cumpleanos = CalendarioUtil.obtenerCumpleanos(usuarios);
        List<Map<String, String>> eventos = new ArrayList<>();
        eventos.addAll(feriados);
        eventos.addAll(cumpleanos);
        return eventos;
    }


    public int calcularDiasHabiles(LocalDate fechaInicio, LocalDate fechaFin, Long idUsuario) {
        if (fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior o igual a la fecha de fin.");
        }

        // Obtener feriados y cumpleaños
        List<Map<String, String>> feriados = CalendarioUtil.obtenerFeriados();
        List<Map<String, String>> cumpleanos = CalendarioUtil.obtenerCumpleanos(usuarioRepository.findAll());
        Set<LocalDate> fechasEspeciales = feriados.stream()
                .map(evento -> LocalDate.parse(evento.get("fecha")))
                .collect(Collectors.toSet());

        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        if (usuario.getFechaNacimiento() != null) {
            LocalDate fechaCumpleanos = LocalDate.of(
                    LocalDate.now().getYear(),
                    usuario.getFechaNacimiento().getMonth(),
                    usuario.getFechaNacimiento().getDayOfMonth()
            );
            fechasEspeciales.add(fechaCumpleanos);
        }

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










    

    
    



    




