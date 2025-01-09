package bootcamp.vacaciones.models;

import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name="usuarios")
public class UsuarioModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;
    private String nombre;
    private String apellido;

    @Column(nullable = false,unique = true, name = "nro_cedula")
    private int nroCedula;
    @Column(nullable = false,unique = true, name = "correo")
    private String correo;

    private String contrasena;

    private String telefono;

    @Column(name="fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "antiguedad", columnDefinition = "INTERVAL", insertable = false, updatable = false)
    private String antiguedad;
    @Column(name="dias_vacaciones")
    private int diasVacaciones;

    private boolean estado;

    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    private RolModel rol;

    @ManyToOne
    @JoinColumn(name="id_equipo", nullable = true)
    private EquipoModel equipo;

    @ManyToOne
    @JoinColumn(name="id_cargo", nullable = true)
    private CargoModel cargo;


    public UsuarioModel() {
    }
    public UsuarioModel(Long id, String nombre, String apellido, int nroCedula, String correo, String contrasena, String telefono, LocalDate fechaIngreso, String antiguedad, int diasVacaciones, boolean estado, RolModel rol, EquipoModel equipo, CargoModel cargo) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.nroCedula = nroCedula;
        this.correo = correo;
        this.contrasena = contrasena;
        this.telefono = telefono;
        this.fechaIngreso = fechaIngreso;
        this.antiguedad = antiguedad;
        this.diasVacaciones = diasVacaciones;
        this.estado = estado;
        this.rol = rol;
        this.equipo = equipo;
        this.cargo = cargo;
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

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
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

    public String getAntiguedad() {
        return antiguedad;
    }

    public void setAntiguedad(String antiguedad) {
        this.antiguedad = antiguedad;
    }

    public int getDiasVacaciones() {
        return diasVacaciones;
    }

    public void setDiasVacaciones(int diasVacaciones) {
        this.diasVacaciones = diasVacaciones;
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