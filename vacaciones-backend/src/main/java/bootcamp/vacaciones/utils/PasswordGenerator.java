package bootcamp.vacaciones.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Contraseña original: " + rawPassword);
        System.out.println("Contraseña encriptada: " + encodedPassword);
    }
} 