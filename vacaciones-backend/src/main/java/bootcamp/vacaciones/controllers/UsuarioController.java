package bootcamp.vacaciones.controllers;


import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.repositories.RolRepository;
import bootcamp.vacaciones.repositories.UsuarioRepository;
import bootcamp.vacaciones.services.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vacaciones")

@CrossOrigin(value = "http://localhost:5173") //para recibir peticiones del front
public class UsuarioController {
    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;


    @GetMapping("/listarusuarios")
    public List<UsuarioModel> obtenerUsuarios() {
        return usuarioService.listarUsuarios();
    }


    @GetMapping("/buscarcedula/{nroCedula}")
    public ResponseEntity<Optional<UsuarioModel>> obtenerUsuarioPorCedula(@PathVariable("nroCedula")  int nroCedula){
        Optional<UsuarioModel> usuario = Optional.ofNullable(usuarioService.buscarUsuarioPorCedula(nroCedula));
        return usuario.isPresent()
                ? ResponseEntity.ok(usuario)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Optional.empty());
    }

    @GetMapping("/lideres")
    public ResponseEntity<List<UsuarioModel>> listarLideres() {
        List<UsuarioModel> lideres = usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getRol().getNombre().equalsIgnoreCase("LIDER"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lideres);
    }
    @GetMapping("/diasdisponiblesid/{idUsuario}")
    public ResponseEntity<Integer> obtenerDiasDisponiblesPorId(@PathVariable("idUsuario") Long idUsuario) {
        int diasVacaciones = usuarioService.obtenerDiasVacacionesPorIdUsuario(idUsuario);
        return ResponseEntity.ok(diasVacaciones);
    }

    @GetMapping("/diasdisponiblescedula/{nroCedula}")
    public ResponseEntity<Integer> obtenerDiasDisponibles(@PathVariable("nroCedula") int nroCedula) {
        int diasVacaciones = usuarioService.obtenerDiasVacacionesPorCedula(nroCedula);
        return ResponseEntity.ok(diasVacaciones);
    }

    @PostMapping("/crea/usuarios")
    public ResponseEntity<?> guardarUsuario(@RequestBody UsuarioModel usuario) {
        try {
            UsuarioModel nuevoUsuario = usuarioService.guardarUsuario(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/buscarid/{id}")
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
