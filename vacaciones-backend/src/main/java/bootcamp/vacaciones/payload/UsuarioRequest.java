package bootcamp.vacaciones.payload;

import bootcamp.vacaciones.models.CargoModel;
import bootcamp.vacaciones.models.EquipoModel;
import bootcamp.vacaciones.models.RolModel;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class UsuarioRequest {

    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede tener más de 50 caracteres")
    private String nombre;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El apellido no puede tener más de 50 caracteres")
    private String apellido;

    @NotNull(message = "La cédula es obligatoria")
    private int nroCedula;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato válido")
    private String correo;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
            regexp = "^[0-9]{9,15}$",
            message = "El teléfono debe contener entre 9 y 15 dígitos"
            )
    private String telefono;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fechaIngreso;
    private String contrasena;
    private boolean estado;
    private RolModel rol;
    private EquipoModel equipo;
    private CargoModel cargo;

    // Getters y Setters
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

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public int getNroCedula() {
        return nroCedula;
    }

    public void setNroCedula(int nroCedula) {
        this.nroCedula = nroCedula;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public LocalDate getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDate fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public boolean isEstado() {
        return estado;
    }

    public void setEstado(boolean estado) {
        this.estado = estado;
    }

    public RolModel getRol() {
        return rol;
    }

    public void setRol(RolModel rol) {
        this.rol = rol;
    }

    public EquipoModel getEquipo() {
        return equipo;
    }

    public void setEquipo(EquipoModel equipo) {
        this.equipo = equipo;
    }

    public CargoModel getCargo() {
        return cargo;
    }

    public void setCargo(CargoModel cargo) {
        this.cargo = cargo;
    }
}
