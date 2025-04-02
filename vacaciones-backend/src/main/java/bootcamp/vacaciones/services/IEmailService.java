package bootcamp.vacaciones.services;

import jakarta.mail.MessagingException;

public interface IEmailService {
    void enviarCorreo(String destinatario, String asunto, String contenido) throws MessagingException;
    void enviarCorreoHTML(String destinatario, String asunto, String contenidoHTML);
    boolean esCorreoValido(String correo);
    void enviarCorreoConAdjunto(String destinatario, String asunto, String contenido, String nombreArchivo, byte[] archivo) throws MessagingException;
    void enviarCorreoMultiplesDestinatarios(String[] destinatarios, String asunto, String contenido) throws MessagingException;
    void enviarCorreoDeConfirmacion(String destinatario, String token);
    void enviarCorreoDeNotificacion(String destinatario, String mensaje);
} 