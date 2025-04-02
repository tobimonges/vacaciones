package bootcamp.vacaciones.models;

import jakarta.persistence.*;

@Entity
@Table(name = "equipos")
public class EquipoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "id_equipo")
    private Long id;

    @Column(nullable = false, name = "nombre")
    private String nombre;

    @Column(name = "lider_id")
    private Long liderId;

    public EquipoModel() {
    }

    public EquipoModel(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Long getLiderId() {
        return liderId;
    }

    public void setLiderId(Long liderId) {
        this.liderId = liderId;
    }
}
