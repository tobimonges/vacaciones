package bootcamp.vacaciones.utils;

import org.springframework.stereotype.Component;

@Component
public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    
    public boolean isValid(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return false;
        }
        
        // Debe contener al menos una mayúscula
        boolean hasUpperCase = password.matches(".*[A-Z].*");
        // Debe contener al menos una minúscula
        boolean hasLowerCase = password.matches(".*[a-z].*");
        // Debe contener al menos un número
        boolean hasNumber = password.matches(".*\\d.*");
        // Debe contener al menos un carácter especial
        boolean hasSpecialChar = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*");
        
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }
    
    public String getValidationMessage() {
        return "La contraseña debe tener al menos " + MIN_LENGTH + " caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.";
    }
} 