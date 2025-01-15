package bootcamp.vacaciones.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GoogleDriveConfig {

    @Value("${google.drive.credentials.path}")
    private String credentialsPath;

    @Value("${google.drive.folder.root}")
    private String rootFolderId;


    public String getCredentialsPath() {
        return credentialsPath;
    }

    public String getRootFolderId() {
        return rootFolderId;
    }

}
