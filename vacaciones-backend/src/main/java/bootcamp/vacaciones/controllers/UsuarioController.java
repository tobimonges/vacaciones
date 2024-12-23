package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioModel>> getUsuario(){
        return ResponseEntity.ok(usuarioService.getUsuario());
    }

    @PostMapping
    public ResponseEntity<UsuarioModel> CrearUSuario(@RequestBody UsuarioModel usuario){
        UsuarioModel nuevoUSuario = usuarioService.crearUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUSuario);
    }


}
