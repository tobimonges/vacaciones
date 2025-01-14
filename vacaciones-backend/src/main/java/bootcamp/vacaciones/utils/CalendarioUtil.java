package bootcamp.vacaciones.utils;

import bootcamp.vacaciones.models.UsuarioModel;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CalendarioUtil {
    public static List<Map<String, String>> obtenerFeriados() {
        return List.of(
                Map.of("fecha", "2025-01-01", "descripcion", "Año Nuevo"),
                Map.of("fecha", "2025-03-02", "descripcion", "Día de los Héroes"),
                Map.of("fecha", "2025-04-17", "descripcion", "Jueves Santo"),
                Map.of("fecha", "2025-04-18", "descripcion", "Viernes Santo"),
                Map.of("fecha", "2025-05-01", "descripcion", "Día del Trabajador"),
                Map.of("fecha", "2025-05-14", "descripcion", "Día de la Independencia"),
                Map.of("fecha", "2025-06-12", "descripcion", "Día de la Paz del Chaco"),
                Map.of("fecha", "2025-08-15", "descripcion", "Fundación de Asunción"),
                Map.of("fecha", "2025-09-29", "descripcion", "Victoria de Boquerón"),
                Map.of("fecha", "2025-12-08", "descripcion", "Día de la Virgen de Caacupé"),
                Map.of("fecha", "2025-12-25", "descripcion", "Navidad")
        );
    }

    // Obtener el cumpleaños de un usuario específico
    public static Map<String, String> obtenerCumpleanosPorUsuario(UsuarioModel usuario) {
        if (usuario.getFechaNacimiento() == null) {
            throw new IllegalArgumentException("El usuario no tiene una fecha de nacimiento registrada.");
        }

        LocalDate fechaNacimiento = usuario.getFechaNacimiento();
        LocalDate fechaCumpleanos = LocalDate.of(
                LocalDate.now().getYear(),
                fechaNacimiento.getMonth(),
                fechaNacimiento.getDayOfMonth()
        );

        return Map.of(
                "fecha", fechaCumpleanos.toString(),
                "descripcion", "Cumpleaños de " + usuario.getNombre() + " " + usuario.getApellido()
        );
    }

    // Obtener todos los cumpleaños
    public static List<Map<String, String>> obtenerCumpleanos(List<UsuarioModel> usuarios) {
        List<Map<String, String>> cumpleanos = new ArrayList<>();
        usuarios.forEach(usuario -> {
            if (usuario.getFechaNacimiento() != null) {
                LocalDate fechaNacimiento = usuario.getFechaNacimiento();
                LocalDate fechaCumple = LocalDate.of(
                        LocalDate.now().getYear(),
                        fechaNacimiento.getMonth(),
                        fechaNacimiento.getDayOfMonth()
                );
                cumpleanos.add(Map.of(
                        "fecha", fechaCumple.toString(),
                        "descripcion", "Cumpleaños de " + usuario.getNombre() + " " + usuario.getApellido()
                ));
            }
        });
        return cumpleanos;
    }
}
