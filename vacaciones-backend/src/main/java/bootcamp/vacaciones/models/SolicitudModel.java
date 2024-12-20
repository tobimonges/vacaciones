package com.registro.CRUD.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "solicitudes")
public class SolicitudModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false) // Ensuring the ID is unique and not null
    private Integer id_solicitud;

    @Column(nullable = false)
    private Date fecha_inicio;

    @Column(nullable = false)
    private Date fecha_fin;

    @Column(nullable = false)
    private Boolean estado;

    @Column(nullable = false)
    private Integer id_usuario;

    // Getters and Setters
    public Integer getId_solicitud() {

        return id_solicitud;
    }

    public void setId_solicitud(Integer id_solicitud) {

        this.id_solicitud = id_solicitud;
    }

    public Date getFecha_inicio() {

        return fecha_inicio;
    }

    public void setFecha_inicio(Date fecha_inicio) {

        this.fecha_inicio = fecha_inicio;
    }

    public Date getFecha_fin() {

        return fecha_fin;
    }

    public void setFecha_fin(Date fecha_fin) {

        this.fecha_fin = fecha_fin;
    }

    public Boolean getEstado() {

        return estado;
    }

    public void setEstado(Boolean estado) {

        this.estado = estado;
    }

    public Integer getId_usuario() {

        return id_usuario;
    }

    public void setId_usuario(Integer id_usuario) {

        this.id_usuario = id_usuario;
    }
}
