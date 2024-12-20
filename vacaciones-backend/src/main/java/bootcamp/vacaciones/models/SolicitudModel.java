package bootcamp.vacaciones.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "solicitud")
public class SolicitudModel {
    @Id
    GeneratedValue(strategy = GenerationType.IDENTITY);
    @Column(unique = true, nullable = false);
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioModel usuario;


}
