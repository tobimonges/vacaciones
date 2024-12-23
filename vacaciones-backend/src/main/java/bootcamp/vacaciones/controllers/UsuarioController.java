package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.UsuarioModel;
import bootcamp.vacaciones.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController

public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;
    @GetMapping("/usuarios")
    public List<UsuarioModel> getUsuario(){
        return usuarioService.getUsuario();
    }



}
