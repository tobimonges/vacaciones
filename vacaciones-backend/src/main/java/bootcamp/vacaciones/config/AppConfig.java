package bootcamp.vacaciones.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:application.properties")
public class AppConfig {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.reset-password-url}")
    private String resetPasswordUrl;

    @Value("${app.reset-password-requires-change-url}")
    private String resetPasswordRequiresChangeUrl;

    @Value("${spring.mail.username}")
    private String mailUsername;

    @Value("${spring.mail.password}")
    private String mailPassword;

    @Value("${spring.mail.host}")
    private String mailHost;

    @Value("${spring.mail.port}")
    private String mailPort;

    @Value("${google.drive.credentials.path}")
    private String googleDriveCredentialsPath;

    @Value("${google.drive.folder.root}")
    private String googleDriveRootFolder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-reset-password}")
    private String jwtExpirationResetPassword;

    @Value("${jwt.expiration-login}")
    private String jwtExpirationLogin;

    // Getters
    public String getFrontendUrl() {
        return frontendUrl;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getResetPasswordUrl() {
        return resetPasswordUrl;
    }

    public String getResetPasswordRequiresChangeUrl() {
        return resetPasswordRequiresChangeUrl;
    }

    public String getMailUsername() {
        return mailUsername;
    }

    public String getMailPassword() {
        return mailPassword;
    }

    public String getMailHost() {
        return mailHost;
    }

    public String getMailPort() {
        return mailPort;
    }

    public String getGoogleDriveCredentialsPath() {
        return googleDriveCredentialsPath;
    }

    public String getGoogleDriveRootFolder() {
        return googleDriveRootFolder;
    }

    public String getJwtSecret() {
        return jwtSecret;
    }

    public String getJwtExpirationResetPassword() {
        return jwtExpirationResetPassword;
    }

    public String getJwtExpirationLogin() {
        return jwtExpirationLogin;
    }
} 