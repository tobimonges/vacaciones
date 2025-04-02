package bootcamp.vacaciones.services;

import com.google.api.client.http.ByteArrayContent;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class GoogleDriveService implements IGoogleDriveService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleDriveService.class);
    private static final List<String> TIPOS_PERMITIDOS = Arrays.asList(
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Value("${google.drive.credentials.path}")
    private String credentialsPath;

    @Value("${google.drive.folder.root}")
    private String rootFolderId;

    private Drive driveService;

    private Drive getDriveService() throws IOException {
        if (driveService == null) {
            HttpTransport httpTransport = new NetHttpTransport();
            JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(credentialsPath.getBytes())
            ).createScoped(Arrays.asList(DriveScopes.DRIVE_FILE));

            driveService = new Drive.Builder(httpTransport, jsonFactory, new HttpCredentialsAdapter(credentials))
                .setApplicationName("Vacaciones App")
                .build();
        }
        return driveService;
    }

    @Override
    public boolean esTipoPermitido(String contentType) {
        return TIPOS_PERMITIDOS.contains(contentType);
    }

    @Override
    public boolean esTamañoPermitido(long fileSize) {
        return fileSize <= MAX_FILE_SIZE;
    }

    @Override
    public String subirArchivo(MultipartFile archivo, String nombreArchivo) throws IOException {
        if (!esTipoPermitido(archivo.getContentType())) {
            throw new IllegalArgumentException("Tipo de archivo no permitido");
        }

        if (!esTamañoPermitido(archivo.getSize())) {
            throw new IllegalArgumentException("El archivo excede el tamaño máximo permitido");
        }

        com.google.api.services.drive.model.File fileMetadata = new com.google.api.services.drive.model.File()
            .setName(nombreArchivo)
            .setParents(Arrays.asList(rootFolderId));

        ByteArrayContent mediaContent = new ByteArrayContent(
            archivo.getContentType(),
            archivo.getBytes()
        );

        com.google.api.services.drive.model.File file = getDriveService().files()
            .create(fileMetadata, mediaContent)
            .setFields("id")
            .execute();

        logger.info("Archivo subido exitosamente con ID: {}", file.getId());
        return file.getId();
    }

    @Override
    public byte[] descargarArchivo(String fileId) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        getDriveService().files().get(fileId)
            .executeMediaAndDownloadTo(outputStream);
        return outputStream.toByteArray();
    }

    @Override
    public void eliminarArchivo(String fileId) throws IOException {
        getDriveService().files()
            .delete(fileId)
            .execute();
        logger.info("Archivo eliminado exitosamente con ID: {}", fileId);
    }

    @Override
    public String obtenerLinkArchivo(String fileId) throws IOException {
        com.google.api.services.drive.model.File file = getDriveService().files()
            .get(fileId)
            .setFields("webViewLink")
            .execute();
        return file.getWebViewLink();
    }

    @Override
    public boolean existeArchivo(String fileId) throws IOException {
        try {
            getDriveService().files()
                .get(fileId)
                .execute();
            return true;
        } catch (IOException e) {
            if (e.getMessage().contains("404")) {
                return false;
            }
            throw e;
        }
    }

    @Override
    public String obtenerNombreArchivo(String fileId) throws IOException {
        com.google.api.services.drive.model.File file = getDriveService().files()
            .get(fileId)
            .setFields("name")
            .execute();
        return file.getName();
    }

    @Override
    public long obtenerTamañoArchivo(String fileId) throws IOException {
        com.google.api.services.drive.model.File file = getDriveService().files()
            .get(fileId)
            .setFields("size")
            .execute();
        return file.getSize();
    }

    @Override
    public String obtenerTipoMIME(String fileId) throws IOException {
        com.google.api.services.drive.model.File file = getDriveService().files()
            .get(fileId)
            .setFields("mimeType")
            .execute();
        return file.getMimeType();
    }
}
