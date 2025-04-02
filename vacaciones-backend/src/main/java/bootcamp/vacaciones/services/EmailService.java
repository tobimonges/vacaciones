package bootcamp.vacaciones.services;

import bootcamp.vacaciones.exceptions.EmailInvalidoException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.regex.Pattern;

@Service
public class EmailService implements IEmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    @Override
    public void enviarCorreo(String destinatario, String asunto, String contenido) throws MessagingException {
        validarEmail(destinatario);

        MimeMessage mensaje = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

        helper.setFrom(remitente);
        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(contenido, true);

        mailSender.send(mensaje);
        logger.info("Correo enviado exitosamente a: {}", destinatario);
    }

    @Override
    public void enviarCorreoHTML(String destinatario, String asunto, String contenidoHTML) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            
            helper.setFrom(remitente);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(contenidoHTML, true);
            
            mailSender.send(mensaje);
            logger.info("Correo HTML enviado exitosamente a: {}", destinatario);
        } catch (MessagingException e) {
            logger.error("Error al enviar correo HTML a {}: {}", destinatario, e.getMessage());
            throw new RuntimeException("Error al enviar el correo HTML", e);
        }
    }

    @Override
    public boolean esCorreoValido(String correo) {
        return correo != null && EMAIL_PATTERN.matcher(correo).matches();
    }

    @Override
    public void enviarCorreoConAdjunto(String destinatario, String asunto, String contenido, String nombreArchivo, byte[] archivo) throws MessagingException {
        validarEmail(destinatario);

        MimeMessage mensaje = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

        helper.setFrom(remitente);
        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(contenido, true);

        ByteArrayDataSource dataSource = new ByteArrayDataSource(archivo, "application/octet-stream");
        helper.addAttachment(nombreArchivo, dataSource);

        mailSender.send(mensaje);
        logger.info("Correo con adjunto enviado exitosamente a: {}", destinatario);
    }

    @Override
    public void enviarCorreoMultiplesDestinatarios(String[] destinatarios, String asunto, String contenido) throws MessagingException {
        for (String destinatario : destinatarios) {
            validarEmail(destinatario);
        }

        MimeMessage mensaje = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

        helper.setFrom(remitente);
        helper.setTo(destinatarios);
        helper.setSubject(asunto);
        helper.setText(contenido, true);

        mailSender.send(mensaje);
        logger.info("Correo enviado exitosamente a múltiples destinatarios: {}", Arrays.toString(destinatarios));
    }

    @Override
    public void enviarCorreoDeConfirmacion(String destinatario, String token) {
        String asunto = "Confirmación de cuenta";
        String contenido = String.format(
            "<p>Gracias por registrarte. Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:</p>" +
            "<a href='%s/confirmar-cuenta?token=%s'>Confirmar cuenta</a>",
            System.getProperty("app.base-url"), token
        );
        enviarCorreoHTML(destinatario, asunto, contenido);
    }

    @Override
    public void enviarCorreoDeNotificacion(String destinatario, String mensaje) {
        String asunto = "Notificación del sistema";
        String contenido = String.format(
            "<p>Has recibido una nueva notificación:</p>" +
            "<p>%s</p>",
            mensaje
        );
        enviarCorreoHTML(destinatario, asunto, contenido);
    }

    private void validarEmail(String email) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            logger.error("Dirección de correo inválida: {}", email);
            throw new EmailInvalidoException("Dirección de correo inválida: " + email);
        }
    }
}
