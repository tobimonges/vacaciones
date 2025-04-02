package bootcamp.vacaciones.exceptions;

public class RolNoEncontradoException extends RuntimeException {
    
    public RolNoEncontradoException(String mensaje) {
        super(mensaje);
    }
    
    public RolNoEncontradoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
} 