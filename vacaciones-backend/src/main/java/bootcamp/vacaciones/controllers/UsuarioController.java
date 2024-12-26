package bootcamp.vacaciones.controllers;

//import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.RolRepository;
import bootcamp.vacaciones.services.IUsuarioService;
import bootcamp.vacaciones.services.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/vacaciones")

@CrossOrigin(value = "http://localhost:3000") //para recibir peticiones del front
public class UsuarioController {
    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private RolRepository rolRepository;

    @GetMapping("/listar/usuarios")
    public List<UsuarioModel> obtenerUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/buscar")
    public ResponseEntity<Optional<UsuarioModel>> obtenerUsuarioPorCedula(@RequestParam("nroCedula") int nroCedula){
        Optional<UsuarioModel> usuario = Optional.ofNullable(usuarioService.buscarUsuarioPorCedula(nroCedula));
        return usuario.isPresent()
                ? ResponseEntity.ok(usuario)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Optional.empty());
    }

    @GetMapping("/dias/disponibles")
    public ResponseEntity<Integer> obtenerDiasDisponibles(@RequestParam("nroCedula") int nroCedula) {
        int diasVacaciones = usuarioService.obtenerDiasVacacionesPorCedula(nroCedula);
        return ResponseEntity.ok(diasVacaciones);
    }

    @PostMapping("/crea/usuarios")
    public UsuarioModel guardarUsuario(@RequestBody UsuarioModel usuario) {
        RolModel rol = rolRepository.findById(usuario.getRol().getId())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));
        usuario.setRol(rol);
        return usuarioService.guardarUsuario(usuario);
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<UsuarioModel> obtenerUsuarioPorId(@PathVariable("id") Long id) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.ok(usuario);
        }
    }

    @PutMapping("/modificar/{id}")
    public ResponseEntity<UsuarioModel> actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioModel usuarioRecibido) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            usuario.setNombre(usuarioRecibido.getNombre());
            usuario.setApellido(usuarioRecibido.getApellido());
            usuario.setCorreo(usuarioRecibido.getCorreo());
            usuario.setContrasena(usuarioRecibido.getContrasena());
            usuarioService.guardarUsuario(usuario);
            return ResponseEntity.ok(usuario);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<UsuarioModel> eliminarUsuario(@PathVariable Long id) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            usuarioService.eliminarUsuario(usuario);
            return ResponseEntity.ok(usuario);
        }
    }

}
