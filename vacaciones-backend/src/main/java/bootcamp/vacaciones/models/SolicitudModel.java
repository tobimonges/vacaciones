package bootcamp.vacaciones.models;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "solicitudes")
public class SolicitudModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "id_solicitud")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private UsuarioModel usuario;

    @Column(nullable = false,name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(nullable = false, name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(nullable = false)
    private Boolean estado;

    @Column(nullable=true, name="numero_aprobaciones")
    private Integer numeroAprobaciones;

    @Column(nullable = true, name="cantidad_dias")
    private Integer cantidadDias;

    @Column(nullable = true)
    private String comentario;

    @Column(nullable = false)
    private Boolean rechazado;

    @ManyToOne
    @JoinColumn(name = "id_lider", nullable = false)
    private UsuarioModel lider; // Relación con el líder


    public SolicitudModel() {
    }


    public SolicitudModel(Long id, UsuarioModel usuario, LocalDate fechaInicio, LocalDate fechaFin, Boolean estado, Integer numeroAprobaciones, Integer cantidadDias,
                          String comentario, Boolean rechazado, UsuarioModel lider) {
        this.id = id;
        this.usuario = usuario;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
        this.numeroAprobaciones = numeroAprobaciones;
        this.cantidadDias = cantidadDias;
        this.comentario = comentario;
        this.rechazado = rechazado;
        this.lider = lider;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UsuarioModel getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioModel usuario) {
        this.usuario = usuario;
    }

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

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public Integer getNumeroAprobaciones() {
        return numeroAprobaciones;
    }

    public void setNumeroAprobaciones(Integer numeroAprobaciones) {
        this.numeroAprobaciones = numeroAprobaciones;
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

    public Boolean getRechazado() {
        return rechazado;
    }

    public void setRechazado(Boolean rechazado) {
        this.rechazado = rechazado;
    }

    public UsuarioModel getLider() {
        return lider;
    }

    public void setLider(UsuarioModel lider) {
        this.lider = lider;
    }

}

