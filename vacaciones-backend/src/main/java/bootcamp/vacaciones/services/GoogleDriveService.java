package bootcamp.vacaciones.services;

import bootcamp.vacaciones.config.GoogleDriveConfig;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;


import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Collections;

@Service
public class GoogleDriveService {

    private final Drive driveService;
    private final GoogleDriveConfig googleDriveConfig;

    @Autowired
    public GoogleDriveService(GoogleDriveConfig googleDriveConfig) throws IOException {
        this.googleDriveConfig = googleDriveConfig;

        // Cargar credenciales desde el archivo
        InputStream credentialsStream = getClass().getClassLoader().getResourceAsStream(googleDriveConfig.getCredentialsPath());
        GoogleCredential credential = GoogleCredential
                .fromStream(credentialsStream)
                .createScoped(Collections.singletonList(DriveScopes.DRIVE));


        this.driveService = new Drive.Builder(
                credential.getTransport(),
                credential.getJsonFactory(),
                credential)
                .setApplicationName("VacacionesApp")
                .build();
    }

    @Async
    public String subirArchivo(String nombreArchivo, String tipoMime, InputStream archivoStream) throws IOException {
        File archivoMetadata = new File();
        archivoMetadata.setName(nombreArchivo);
        archivoMetadata.setParents(Collections.singletonList(googleDriveConfig.getRootFolderId()));

        // Crea un archivo temporal para copiar el contenido del InputStream
        java.io.File archivoTemporal = java.io.File.createTempFile("temp", null);
        try (java.io.FileOutputStream outputStream = new java.io.FileOutputStream(archivoTemporal)) {
            archivoStream.transferTo(outputStream);
        }

        // Convierte el archivo temporal a FileContent para Google Drive
        FileContent contenidoArchivo = new FileContent(tipoMime, archivoTemporal);

        File archivo = driveService.files().create(archivoMetadata, contenidoArchivo)
                .setFields("id, webViewLink")
                .execute();

        // Elimina el archivo temporal después de la subida
        archivoTemporal.delete();

        return archivo.getWebViewLink();
    }


    public String getRootFolderId() {
        return googleDriveConfig.getRootFolderId();
    }



    public boolean esTipoPermitido(String tipoMime) {
        return tipoMime.equals("application/pdf") ||
                tipoMime.startsWith("image/");
    }

}
