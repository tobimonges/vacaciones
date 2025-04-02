# Sistema de Gestión de Vacaciones - Backend

Este es el backend del sistema de gestión de vacaciones, desarrollado con Spring Boot.

## Requisitos Previos

- Java 21 o superior
- Maven 3.6 o superior
- PostgreSQL 12 o superior
- Cuenta de Google Drive (para almacenamiento de documentos)
- Cuenta de Gmail (para envío de correos)

## Configuración del Entorno

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd vacaciones-backend
```

2. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configura las variables de entorno en el archivo `.env`:
   - Actualiza las URLs según tu entorno
   - Configura las credenciales de la base de datos
   - Configura las credenciales de Gmail
   - Configura las credenciales de Google Drive
   - Genera una clave secreta segura para JWT

4. Configura la base de datos:
   - Crea una base de datos PostgreSQL
   - Ejecuta los scripts de migración (si existen)

5. Configura Google Drive:
   - Crea un proyecto en Google Cloud Console
   - Habilita la API de Google Drive
   - Crea una cuenta de servicio y descarga el archivo de credenciales
   - Coloca el archivo de credenciales en la raíz del proyecto como `credentials.json`

## Construcción y Ejecución

1. Construye el proyecto:
```bash
mvn clean install
```

2. Ejecuta la aplicación:
```bash
mvn spring:boot run
```

O alternativamente:
```bash
java -jar target/vacaciones-0.0.1-SNAPSHOT.jar
```

## Variables de Entorno

### Configuración de la Aplicación
- `FRONTEND_URL`: URL del frontend (default: http://localhost:5173)
- `BASE_URL`: URL base del backend (default: http://localhost:8080)
- `RESET_PASSWORD_URL`: URL para reset de contraseña
- `RESET_PASSWORD_REQUIRES_CHANGE_URL`: URL para cambio de contraseña requerido

### Base de Datos
- `DB_URL`: URL de conexión a PostgreSQL
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos

### Correo Electrónico
- `MAIL_HOST`: Servidor SMTP
- `MAIL_PORT`: Puerto SMTP
- `MAIL_USERNAME`: Usuario de correo
- `MAIL_PASSWORD`: Contraseña de aplicación de Gmail

### JWT
- `JWT_SECRET`: Clave secreta para firmar tokens
- `JWT_EXPIRATION_RESET_PASSWORD`: Tiempo de expiración para tokens de reset (minutos)
- `JWT_EXPIRATION_LOGIN`: Tiempo de expiración para tokens de login (minutos)

### Google Drive
- `GOOGLE_DRIVE_CREDENTIALS_PATH`: Ruta al archivo de credenciales
- `GOOGLE_DRIVE_FOLDER_ROOT`: ID de la carpeta raíz en Google Drive

### Servidor
- `PORT`: Puerto del servidor (default: 8080)
- `CONTEXT_PATH`: Ruta base de la API (default: /api)

### Seguridad
- `SECURITY_USERNAME`: Usuario de seguridad
- `SECURITY_PASSWORD`: Contraseña de seguridad

### Logging
- `LOG_LEVEL`: Nivel de logging general
- `APP_LOG_LEVEL`: Nivel de logging de la aplicación

### Caché
- `CACHE_TYPE`: Tipo de caché
- `CAFFEINE_SPEC`: Especificación de Caffeine

### Rate Limiting
- `RATE_LIMIT_ENABLED`: Habilita/deshabilita rate limiting
- `RATE_LIMIT_REQUESTS_PER_MINUTE`: Límite de solicitudes por minuto

### CORS
- `CORS_ALLOWED_ORIGINS`: Orígenes permitidos
- `CORS_ALLOWED_METHODS`: Métodos HTTP permitidos
- `CORS_ALLOWED_HEADERS`: Headers permitidos
- `CORS_ALLOW_CREDENTIALS`: Permite credenciales

## Despliegue

Para desplegar en un servidor:

1. Construye el proyecto:
```bash
mvn clean package -DskipTests
```

2. Configura las variables de entorno en el servidor:
   - Usa el archivo `.env` como referencia
   - Asegúrate de que todas las variables estén configuradas correctamente

3. Copia el archivo JAR y las dependencias al servidor:
```bash
scp target/vacaciones-0.0.1-SNAPSHOT.jar usuario@servidor:/ruta/destino/
```

4. Ejecuta la aplicación en el servidor:
```bash
java -jar vacaciones-0.0.1-SNAPSHOT.jar
```

## Seguridad

- Nunca compartas o subas al repositorio el archivo `.env`
- Mantén actualizadas las dependencias
- Usa contraseñas fuertes
- Configura correctamente CORS
- Habilita HTTPS en producción

## Soporte

Para reportar problemas o solicitar ayuda, por favor crea un issue en el repositorio. 