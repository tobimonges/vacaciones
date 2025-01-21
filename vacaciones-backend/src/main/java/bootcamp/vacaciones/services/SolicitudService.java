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
import java.util.*;
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

        if (!"DIRECTORIO".equals(nombreRol) && (solicitudRequest.getLiderIds() == null || solicitudRequest.getLiderIds().isEmpty())) {
            throw new IllegalArgumentException("Debe seleccionar al menos un líder para este rol.");
        }

        Set<UsuarioModel> lideres = recuperarYValidarLideres(solicitudRequest.getLiderIds(), idUsuario, nombreRol);

        // Cálculo de días hábiles basado en las fechas proporcionadas
        int cantidadDias = calcularDiasHabiles(
                solicitudRequest.getFechaInicio(),
                solicitudRequest.getFechaFin(),
                usuario.getId()
        );

        // Validar si los días calculados son mayores a los disponibles
        int diasDisponibles = usuario.getDiasVacaciones();
        if (cantidadDias > diasDisponibles) {
            throw new IllegalArgumentException("No tienes suficientes días de vacaciones disponibles.");
        }

        // Verificar si hay conflictos de fechas con otras solicitudes
        List<SolicitudModel> solicitudesConflicto = solicitudRepository.findConflictingSolicitudes(
                idUsuario, solicitudRequest.getFechaInicio(), solicitudRequest.getFechaFin()
        );
        if (!solicitudesConflicto.isEmpty()) {
            throw new IllegalArgumentException("Ya existe una solicitud en conflicto con las fechas proporcionadas.");
        }

        // Crear la nueva solicitud
        SolicitudModel nuevaSolicitud = new SolicitudModel();
        nuevaSolicitud.setUsuario(usuario);
        nuevaSolicitud.setLideres(lideres);
        nuevaSolicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        nuevaSolicitud.setFechaFin(solicitudRequest.getFechaFin());
        nuevaSolicitud.setCantidadDias(cantidadDias); // Usar días calculados
        nuevaSolicitud.setEstado(false);
        nuevaSolicitud.setNumeroAprobaciones(0);
        nuevaSolicitud.setRechazado(false);
        nuevaSolicitud.setComentario(solicitudRequest.getComentario());

        // Validaciones especiales para DIRECTORIO
        if ("DIRECTORIO".equals(nombreRol)) {
            nuevaSolicitud.setNumeroAprobaciones(2);
            nuevaSolicitud.setEstado(true);
            actualizarDiasVacaciones(nuevaSolicitud);
        }

        // Notificar según el rol
        notificarPorRol(nombreRol, lideres, usuario, nuevaSolicitud);

        return solicitudRepository.save(nuevaSolicitud);
    }


    private Set<UsuarioModel> recuperarYValidarLideres(List<Long> liderIds, Long idUsuario, String nombreRol) {
        Logger logger = LoggerFactory.getLogger(SolicitudService.class);

        logger.info("Iniciando validación de líderes...");
        logger.debug("IDs de líderes proporcionados: {}", liderIds);
        logger.debug("ID del usuario asociado: {}", idUsuario);
        logger.debug("Rol del usuario asociado: {}", nombreRol);

        Set<UsuarioModel> lideres = new HashSet<>();

        if (liderIds != null) {
            for (Long liderId : liderIds) {
                logger.info("Validando líder con ID: {}", liderId);

                // Verificar si el líder existe en la base de datos
                UsuarioModel lider = usuarioRepository.findById(liderId)
                        .orElseThrow(() -> {
                            logger.error("Líder no encontrado: ID {}", liderId);
                            return new IllegalArgumentException("Líder no encontrado: ID " + liderId);
                        });

                logger.info("Líder encontrado: {} - {}", lider.getId(), lider.getNombre());

                // Validar que el usuario no se seleccione a sí mismo como líder
                if (lider.getId().equals(idUsuario)) {
                    logger.error("El usuario con ID {} no puede seleccionarse como líder.", idUsuario);
                    throw new IllegalArgumentException("El usuario no puede seleccionarse a sí mismo como líder.");
                }

                // Validar que el líder cumple con los requisitos del rol
                logger.debug("Validando líder contra rol: {}", nombreRol);
                validarLiderPorRol(nombreRol, lider);
                logger.info("Líder con ID {} validado correctamente.", lider.getId());

                // Agregar el líder al conjunto
                lideres.add(lider);
            }
        } else {
            logger.warn("No se proporcionaron IDs de líderes para validar.");
        }

        logger.info("Validación de líderes completada. Total de líderes validados: {}", lideres.size());
        return lideres;
    }

    private void notificarPorRol(String nombreRol, Set<UsuarioModel> lideres, UsuarioModel usuario, SolicitudModel solicitud) {

        if ("DIRECTORIO".equals(nombreRol)) {
            logger.info("Enviando notificación a un usuario con rol: " + nombreRol);
            notificarDirectorio(usuario, solicitud);
            return;
        }

        for (UsuarioModel lider : lideres) {
            switch (nombreRol) {
                case "FUNCIONARIO_FABRICA":
                case "FUNCIONARIO_TERCERIZADO":
                case "TH":
                case "LIDER":
                case "GTH":
                case "OPERACIONES":

                    logger.info(nombreRol);
                    notificarLider(lider, usuario, solicitud);
                    break;

                default:
                    throw new IllegalArgumentException("Rol no soportado para notificaciones.");
            }
        }
    }

    private void notificarLider(UsuarioModel lider, UsuarioModel usuario, SolicitudModel solicitud) {
        emailService.enviarCorreo(
                lider.getCorreo(),
                "Nueva Solicitud de Vacaciones (Líder)",
                "<p>El usuario " + usuario.getNombre() + " " + usuario.getApellido() +
                        " ha creado una solicitud de vacaciones para las fechas " +
                        solicitud.getFechaInicio() + " a " + solicitud.getFechaFin() + ".</p>"
        );
    }

    private void notificarDirectorio(UsuarioModel usuario, SolicitudModel solicitud) {
        emailService.enviarCorreo(
                usuario.getCorreo(),
                "Solicitud de Vacaciones Aprobada (DIRECTORIO)",
                "<p>Tu solicitud de vacaciones ha sido aprobada automáticamente.</p>" +
                        "<p>Fechas: " + solicitud.getFechaInicio() + " a " + solicitud.getFechaFin() + ".</p>"
        );
    }

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

    private void validarLiderPorRol(String nombreRol, UsuarioModel lider) {
        switch (nombreRol) {
            case "FUNCIONARIO_FABRICA":
                if (!esLiderValido(lider, new String[]{"LIDER", "OPERACIONES", "DIRECTORIO"})) {
                    throw new IllegalArgumentException("El líder seleccionado debe tener el rol de LIDER, OPERACIONES o DIRECTORIO.");
                }
                break;

            case "FUNCIONARIO_TERCERIZADO":
            case "TH":
            case "LIDER":
                if (!esLiderValido(lider, new String[]{"OPERACIONES", "DIRECTORIO"})) {
                    throw new IllegalArgumentException("El líder seleccionado debe tener el rol de OPERACIONES o DIRECTORIO.");
                }
                break;

            case "OPERACIONES":
                if (!esLiderValido(lider, new String[]{"DIRECTORIO", "OPERACIONES"})) {
                    throw new IllegalArgumentException("El líder seleccionado debe tener el rol de OPERACIONES o DIRECTORIO.");
                }
                break;

            case "DIRECTORIO":
                throw new IllegalArgumentException("El rol DIRECTORIO no selecciona un líder.");

            case "GTH":
                if (!esLiderValido(lider, new String[]{"DIRECTORIO"})) {
                    throw new IllegalArgumentException("El líder seleccionado debe tener el rol de DIRECTORIO para usuarios GTH.");
                }
                break;

            default:
                throw new IllegalArgumentException("Rol no soportado para la creación de solicitudes.");
        }
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
        logger.info("Iniciando actualización de la solicitud con ID: {}", idSolicitud);

        // Buscar la solicitud en la base de datos
        SolicitudModel solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        logger.info("Solicitud encontrada: {}", solicitud.getId());

        UsuarioModel usuario = solicitud.getUsuario();
        if (usuario == null) {
            logger.error("El usuario asociado a la solicitud no fue encontrado.");
            throw new IllegalArgumentException("El usuario asociado a la solicitud no fue encontrado.");
        }

        logger.info("Usuario asociado a la solicitud: {} - Rol: {}", usuario.getId(), usuario.getRol().getNombre());

        // Validar líderes solo si el usuario no es DIRECTORIO
        Set<UsuarioModel> lideres = new HashSet<>();
        if (!"DIRECTORIO".equals(usuario.getRol().getNombre())) {
            logger.info("Validando líderes para un usuario no DIRECTORIO...");

            if (solicitudRequest.getLiderIds() != null && !solicitudRequest.getLiderIds().isEmpty()) {
                lideres = recuperarYValidarLideres(solicitudRequest.getLiderIds(), usuario.getId(), usuario.getRol().getNombre());
                solicitud.setLideres(lideres);
                logger.info("Líderes asignados a la solicitud: {}", lideres.stream().map(UsuarioModel::getId).toList());
            } else {
                logger.error("Debe seleccionarse al menos un líder para esta solicitud.");
                throw new IllegalArgumentException("Debe seleccionarse al menos un líder para esta solicitud.");
            }
        } else {
            logger.info("El usuario con rol DIRECTORIO no requiere líderes para la solicitud.");
            solicitud.setLideres(Collections.emptySet()); // Asignar un conjunto vacío en caso de DIRECTORIO
        }

        // Validar las fechas
        if (solicitudRequest.getFechaInicio().isAfter(solicitudRequest.getFechaFin())) {
            logger.error("La fecha de inicio no puede ser posterior a la fecha de fin.");
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin.");
        }

        int diasHabiles = calcularDiasHabiles(
                solicitudRequest.getFechaInicio(),
                solicitudRequest.getFechaFin(),
                usuario.getId()
        );

        logger.info("Días hábiles calculados: {}", diasHabiles);

        // Actualizar los datos de la solicitud
        solicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        solicitud.setFechaFin(solicitudRequest.getFechaFin());
        solicitud.setCantidadDias(diasHabiles);

        logger.info("Solicitud actualizada correctamente con ID: {}", solicitud.getId());
        return solicitudRepository.save(solicitud);
    }

    public SolicitudModel aprobarSolicitud(Long solicitudId, Long usuarioQueApruebaId) {
        logger.info("Iniciando el proceso de aprobación de solicitud con ID: {} por el usuario con ID: {}", solicitudId, usuarioQueApruebaId);

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

        if (solicitud.getUsuario().getId().equals(usuarioQueApruebaId)) {
            logger.error("El usuario con ID: {} está intentando aprobar su propia solicitud con ID: {}", usuarioQueApruebaId, solicitudId);
            throw new IllegalArgumentException("El usuario no puede aprobar su propia solicitud.");
        }

        logger.info("Validación de aprobación: El usuario con ID: {} está intentando aprobar la solicitud con ID: {}", usuarioQueApruebaId, solicitudId);

        String rolSolicitante = solicitud.getUsuario().getRol().getNombre();
        if ("DIRECTORIO".equals(rolSolicitante)) {
            logger.info("El solicitante con ID: {} es DIRECTORIO, la solicitud ya está aprobada.", solicitud.getUsuario().getId());
        } else {
            if (solicitud.getNumeroAprobaciones() == 0) {
                logger.info("Paso 1: La solicitud con ID: {} requiere la aprobación de un líder.", solicitudId);

                if (solicitud.getLideres().stream().noneMatch(lider -> lider.getId().equals(usuarioQueApruebaId))) {
                    logger.error("El usuario con ID: {} no es uno de los líderes de la solicitud con ID: {}", usuarioQueApruebaId, solicitudId);
                    throw new IllegalArgumentException("Solo un líder asignado puede aprobar esta solicitud en el primer paso.");
                }

                solicitud.setNumeroAprobaciones(1);
                solicitud.setRechazado(false);

                notificarUsuario(
                        solicitud.getUsuario().getCorreo(),
                        "Solicitud Aprobada por Líder",
                        "<p>Tu solicitud ha sido aprobada por un líder.</p>" +
                                "<p>Ahora está pendiente la aprobación de TH.</p>"
                );

                notificarTH(
                        "Solicitud Pendiente de Aprobación (TH)",
                        "La solicitud del usuario " + solicitud.getUsuario().getNombre() +
                                " está pendiente de aprobación por parte de TH."
                );
            } else if (solicitud.getNumeroAprobaciones() == 1) {
                logger.info("Paso 2: La solicitud con ID: {} requiere la aprobación de un TH.", solicitudId);

                UsuarioModel usuario = solicitud.getUsuario();

                int diasDisponibles = usuario.getDiasVacaciones();
                int cantidadDias = solicitud.getCantidadDias();

                if (diasDisponibles == 0) {
                    usuario.setDiasVacaciones(usuario.getDiasVacaciones() - cantidadDias);
                    validarRolTh(usuarioQueAprueba);
                    solicitud.setNumeroAprobaciones(2);
                    solicitud.setEstado(true);
                    solicitud.setRechazado(false);
                } else if (diasDisponibles > 0) {
                    validarRolTh(usuarioQueAprueba);
                    solicitud.setNumeroAprobaciones(2);
                    solicitud.setEstado(true);
                    solicitud.setRechazado(false);
                    actualizarDiasVacaciones(solicitud);
                } else {
                    throw new IllegalArgumentException("No es posible aprobar una solicitud anticipada una vez ya aprobada una anteriormente");
                }


                notificarUsuario(
                        solicitud.getUsuario().getCorreo(),
                        "Solicitud Completamente Aprobada",
                        "<p>Tu solicitud ha sido aprobada por TH y se encuentra activa.</p>"
                );

                logger.info("La solicitud con ID: {} ha sido aprobada, actualizando los días de vacaciones.", solicitudId);
            } else {
                logger.error("La solicitud con ID: {} ya está completamente aprobada.", solicitudId);
                throw new IllegalArgumentException("La solicitud ya está completamente aprobada.");
            }
        }

        logger.info("Guardando los cambios de la solicitud con ID: {}", solicitudId);
        return solicitudRepository.save(solicitud);
    }


    private void validarRolTh(UsuarioModel usuarioQueAprueba) {
        if (!"TH".equals(usuarioQueAprueba.getRol().getNombre())) {
            logger.error("El usuario con ID: {} no tiene el rol de TH para aprobar esta solicitud.", usuarioQueAprueba.getId());
            throw new IllegalArgumentException("Solo un usuario con rol TH puede aprobar en esta etapa.");
        }
    }


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

        logger.info("Iniciando la actualización de días de vacaciones para el usuario con ID: {}", usuario.getId());
        logger.info("Días de vacaciones restantes del usuario antes de la operación: {}", usuario.getDiasVacacionesRestante());
        logger.info("Días de vacaciones totales del usuario antes de la operación: {}", usuario.getDiasVacaciones());
        logger.info("Días solicitados en la solicitud con ID {}: {}", solicitud.getId(), diasRestantesSolicitados);

        // Descontar días de vacaciones restantes
        if (usuario.getDiasVacacionesRestante() >= diasRestantesSolicitados) {
            usuario.setDiasVacacionesRestante(usuario.getDiasVacacionesRestante() - diasRestantesSolicitados);
            logger.info("Días descontados de vacaciones restantes: {}. Nuevos días restantes: {}",
                    diasRestantesSolicitados, usuario.getDiasVacacionesRestante());
            diasRestantesSolicitados = 0;
        } else {
            diasRestantesSolicitados -= usuario.getDiasVacacionesRestante();
            logger.info("No hay suficientes días en vacaciones restantes. Reducción parcial: {}. Restantes por descontar: {}",
                    usuario.getDiasVacacionesRestante(), diasRestantesSolicitados);
            usuario.setDiasVacacionesRestante(0);
        }

        // Descontar días de vacaciones totales si quedan días por descontar
        if (diasRestantesSolicitados > 0) {
            if (usuario.getDiasVacaciones() >= diasRestantesSolicitados) {
                usuario.setDiasVacaciones(usuario.getDiasVacaciones() - diasRestantesSolicitados);
                logger.info("Días descontados de vacaciones totales: {}. Nuevos días totales restantes: {}",
                        diasRestantesSolicitados, usuario.getDiasVacaciones());
                diasRestantesSolicitados = 0;
            }
        }

        // Guardar cambios en el usuario
        usuarioRepository.save(usuario);
        logger.info("Días de vacaciones actualizados para el usuario con ID: {}. Vacaciones totales: {}, Vacaciones restantes: {}",
                usuario.getId(), usuario.getDiasVacaciones(), usuario.getDiasVacacionesRestante());
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



    public SolicitudModel rechazarSolicitud(Long solicitudId, Long usuarioId, String comentario) {
        // Obtener solicitud y usuario
        SolicitudModel solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Si la solicitud ya está rechazada, no se puede volver a rechazar
        if (Boolean.TRUE.equals(solicitud.getRechazado())) {
            throw new RuntimeException("La solicitud ya está rechazada. No puedes rechazarla nuevamente.");
        }

        // Si el usuario que creó la solicitud es DIRECTORIO, nadie puede rechazarla
        if ("DIRECTORIO".equals(solicitud.getUsuario().getRol().getNombre())) {
            throw new RuntimeException("Las solicitudes creadas por DIRECTORIO no pueden ser rechazadas.");
        }

        // Validar según el estado actual de la solicitud y el rol del usuario que rechaza
        String rolUsuario = usuario.getRol().getNombre();

        if (solicitud.getNumeroAprobaciones() == 0) {
            // Caso: Rechazo por líderes
            if (!esLiderDeSolicitud(solicitud, usuario)) {
                throw new RuntimeException("Solo un líder asignado puede rechazar esta solicitud.");
            }
            actualizarDiasVacacionesRechazado(solicitud);
            procesarRechazoSinComentario(solicitud, "Solicitud rechazada por un líder asignado.");
        } else if (solicitud.getNumeroAprobaciones() == 1) {
            // Caso: Rechazo por TH o GTH
            if (!"TH".equals(rolUsuario) && !"GTH".equals(rolUsuario)) {
                throw new RuntimeException("Solo un usuario con rol TH o GTH puede rechazar esta solicitud en esta etapa.");
            }
            actualizarDiasVacacionesRechazado(solicitud);
            procesarRechazoSinComentario(solicitud, "Solicitud rechazada por Talento Humano (TH) o GTH.");
        } else if (Boolean.TRUE.equals(solicitud.getEstado()) && solicitud.getNumeroAprobaciones() == 2) {
            // Caso: Rechazo por OPERACIONES
            if (!"OPERACIONES".equals(rolUsuario)) {
                throw new RuntimeException("Solo un usuario con rol OPERACIONES puede rechazar una solicitud aprobada.");
            }
            if (comentario == null || comentario.isEmpty()) {
                throw new RuntimeException("El comentario es obligatorio para rechazar como OPERACIONES.");
            }
            actualizarDiasVacacionesRechazado(solicitud);
            procesarRechazoConComentario(solicitud, comentario);
        } else {
            throw new RuntimeException("No tienes permiso para rechazar esta solicitud.");
        }

        // Guardar y devolver la solicitud actualizada
        return solicitudRepository.save(solicitud);
    }



    private void procesarRechazoSinComentario(SolicitudModel solicitud, String mensajeCorreo) {
        solicitud.setEstado(false);
        solicitud.setRechazado(true);
        solicitud.setNumeroAprobaciones(0);

        emailService.enviarCorreo(
                solicitud.getUsuario().getCorreo(),
                "Solicitud Rechazada",
                "<p>" + mensajeCorreo + "</p>"
        );
    }

    private void procesarRechazoConComentario(SolicitudModel solicitud, String comentario) {
        solicitud.setEstado(false);
        solicitud.setRechazado(true);
        solicitud.setNumeroAprobaciones(0);
        solicitud.setComentario(comentario);

        emailService.enviarCorreo(
                solicitud.getUsuario().getCorreo(),
                "Solicitud Rechazada",
                "<p>Tu solicitud de vacaciones ha sido rechazada. <br> Motivo: " + comentario + "</p>"
        );
    }

    private boolean esLiderDeSolicitud(SolicitudModel solicitud, UsuarioModel usuario) {
        return solicitud.getLideres().stream()
                .anyMatch(lider -> lider.getId().equals(usuario.getId()));
    }


    public List<Map<String, String>> obtenerFeriados() {
        return CalendarioUtil.obtenerFeriados();
    }

    public Map<String, String> obtenerCumpleanoPorIdUsuario(Long idUsuario) {
        UsuarioModel usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return CalendarioUtil.obtenerCumpleanosPorUsuario(usuario);
    }

    public List<Map<String, String>> obtenerTodosLosCumpleaños() {
        List<UsuarioModel> usuarios = usuarioRepository.findAll();
        List<Map<String, String>> cumpleanos = CalendarioUtil.obtenerCumpleanos(usuarios);
        List<Map<String, String>> eventos = new ArrayList<>();
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


    public SolicitudModel crearSolicitudAuxiliar(Long usuarioId, Long solicitanteId, SolicitudRequest solicitudRequest) {
        // Verificar el usuario que realiza la solicitud auxiliar
        UsuarioModel solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado"));

        String rolSolicitante = solicitante.getRol().getNombre();
        if (!"DIRECTORIO".equals(rolSolicitante) && !"OPERACIONES".equals(rolSolicitante) && !"LIDER".equals(rolSolicitante)) {
            throw new RuntimeException("Solo usuarios con rol DIRECTORIO, OPERACIONES o LIDER pueden crear solicitudes auxiliares.");
        }

        // Verificar el usuario para quien se crea la solicitud
        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario objetivo no encontrado"));

        String rolUsuario = usuario.getRol().getNombre();
        if (!"FUNCIONARIO_FABRICA".equals(rolUsuario) && !"FUNCIONARIO_TERCERIZADO".equals(rolUsuario)) {
            throw new RuntimeException("Solo se pueden crear solicitudes auxiliares para FUNCIONARIO_FABRICA o FUNCIONARIO_TERCERIZADO.");
        }

        // Calcular días hábiles basados en las fechas proporcionadas
        int cantidadDias = calcularDiasHabiles(solicitudRequest.getFechaInicio(), solicitudRequest.getFechaFin(), usuario.getId());

        // Verificar conflictos con solicitudes existentes
        List<SolicitudModel> solicitudesConflicto = solicitudRepository.findConflictingSolicitudes(
                usuarioId, solicitudRequest.getFechaInicio(), solicitudRequest.getFechaFin()
        );
        if (!solicitudesConflicto.isEmpty()) {
            throw new RuntimeException("Ya existe una solicitud en conflicto con las fechas proporcionadas.");
        }

        int diasDisponibles = usuario.getDiasVacaciones();

        if (diasDisponibles > 0) {
            if (diasDisponibles < cantidadDias) {
                throw new RuntimeException("No tienes suficientes días de vacaciones disponibles para esta solicitud.");
            }
            logger.info("Vacaciones normales solicitadas.");
        }
        else if (diasDisponibles == 0) {
            logger.info("Vacaciones anticipadas solicitadas.");
        }
        else {
            throw new RuntimeException("Estado no válido para los días de vacaciones disponibles.");
        }


        usuarioRepository.save(usuario);

        // Crear la nueva solicitud
        SolicitudModel nuevaSolicitud = new SolicitudModel();
        nuevaSolicitud.setUsuario(usuario); // Usuario para quien se crea la solicitud
        nuevaSolicitud.setLideres(Set.of(solicitante)); // El solicitante es el "líder" asignado
        nuevaSolicitud.setFechaInicio(solicitudRequest.getFechaInicio());
        nuevaSolicitud.setFechaFin(solicitudRequest.getFechaFin());
        nuevaSolicitud.setCantidadDias(cantidadDias);
        nuevaSolicitud.setEstado(false); // Pendiente de aprobación
        nuevaSolicitud.setNumeroAprobaciones(1); // Ya aprobada por el solicitante
        nuevaSolicitud.setRechazado(false);
        nuevaSolicitud.setComentario(solicitudRequest.getComentario());

        return solicitudRepository.save(nuevaSolicitud);
    }




}










    

    
    



    




