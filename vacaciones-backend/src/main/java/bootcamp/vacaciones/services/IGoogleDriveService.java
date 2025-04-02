package bootcamp.vacaciones.services;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface IGoogleDriveService {
    boolean esTipoPermitido(String contentType);
    boolean esTamañoPermitido(long fileSize);
    String subirArchivo(MultipartFile archivo, String nombreArchivo) throws IOException;
    byte[] descargarArchivo(String fileId) throws IOException;
    void eliminarArchivo(String fileId) throws IOException;
    String obtenerLinkArchivo(String fileId) throws IOException;
    boolean existeArchivo(String fileId) throws IOException;
    String obtenerNombreArchivo(String fileId) throws IOException;
    long obtenerTamañoArchivo(String fileId) throws IOException;
    String obtenerTipoMIME(String fileId) throws IOException;
} 