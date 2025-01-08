package bootcamp.vacaciones.controllers;

import bootcamp.vacaciones.models.RolModel;
import bootcamp.vacaciones.services.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vacaciones/roles")
public class RolController {

    private final RolService rolService;

    @Autowired
    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping("/listar-roles")
    public List<RolModel> listarRoles() {
        return rolService.listarRoles();
    }
}
