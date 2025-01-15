package bootcamp.vacaciones.models;

import jakarta.persistence.*;

@Entity
@Table(name = "cargos")
public class CargoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "id_cargo")
    private Long id;

    @Column(nullable = false, name = "nombre")
    private String nombre;

    public CargoModel() {
    }

    public CargoModel(Long id, String nombre) {
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
}
