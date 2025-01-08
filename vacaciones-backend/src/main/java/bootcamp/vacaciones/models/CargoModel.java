package bootcamp.vacaciones.models;

import jakarta.persistence.*;

@Entity
@Table(name = "cargos")
public class CargoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "id_cargo")
    private Long id;

    @Column(nullable = false, name = "name")
    private String name;

    public CargoModel() {
    }

    public CargoModel(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
