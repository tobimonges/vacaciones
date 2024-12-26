package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.services.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacaciones")

@CrossOrigin(value = "http://localhost:3000") //para recibir peticiones del front
public class UsuarioController {
    @Autowired
    private IUsuarioService usuarioService;

    @GetMapping("/usuarios")
    public List<UsuarioModel> obtenerUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @PostMapping("/usuarios")
    public UsuarioModel guardarUsuario(@RequestBody UsuarioModel usuario) {
        return usuarioService.guardarUsuario(usuario);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioModel> obtenerUsuarioPorId(@PathVariable("id") Long id) {
        UsuarioModel usuario = usuarioService.buscarUsuarioPorId(id);
        if (usuario == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.ok(usuario);
        }
    }

    @PutMapping("/usuarios/{id}")
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

    @DeleteMapping("/usuarios/{id}")
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
