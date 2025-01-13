package bootcamp.vacaciones.payload;

import java.time.LocalDate;

public class SolicitudRequest {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long liderId; // ID del líder seleccionado
    private Integer cantidadDias;
    private String comentario;
    private Integer numeroAprobaciones;

    // Getters y Setters
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Long getLiderId() {
        return liderId;
    }

    public void setLiderId(Long liderId) {
        this.liderId = liderId;
    }

    public Integer getCantidadDias() {
        return cantidadDias;
    }

    public void setCantidadDias(Integer cantidadDias) {
        this.cantidadDias = cantidadDias;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public Integer getNumeroAprobaciones() {
        return numeroAprobaciones;
    }

    public void setNumeroAprobaciones(Integer numeroAprobaciones) {
        this.numeroAprobaciones = numeroAprobaciones;
    }
}
