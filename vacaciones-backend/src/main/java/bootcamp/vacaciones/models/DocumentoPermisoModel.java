package bootcamp.vacaciones.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documentos_permisos")
public class DocumentoPermisoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDocumento;

    @Column(nullable = false)
    private Long idSolicitud;

    @Column(nullable = false)
    private String urlDocumento;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaSubida = LocalDateTime.now();

    // Getters y setters
    public Long getIdDocumento() {
        return idDocumento;
    }

    public void setIdDocumento(Long idDocumento) {
        this.idDocumento = idDocumento;
    }

    public Long getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public String getUrlDocumento() {
        return urlDocumento;
    }

    public void setUrlDocumento(String urlDocumento) {
        this.urlDocumento = urlDocumento;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }

    public void setFechaSubida(LocalDateTime fechaSubida) {
        this.fechaSubida = fechaSubida;
    }
}
