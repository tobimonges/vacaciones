package bootcamp.vacaciones.exceptions;

public class EmailInvalidoException extends RuntimeException {
    
    public EmailInvalidoException(String mensaje) {
        super(mensaje);
    }
    
    public EmailInvalidoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
} 