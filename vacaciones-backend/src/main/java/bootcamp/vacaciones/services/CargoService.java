package bootcamp.vacaciones.services;

import bootcamp.vacaciones.models.CargoModel;
import bootcamp.vacaciones.repositories.CargoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CargoService {

    @Autowired
    private final CargoRepository cargoRepository;

    public CargoService(CargoRepository cargoRepository) {
        this.cargoRepository = cargoRepository;
    }

    public CargoModel obtenerCargoPorId(Long id) {
        Optional<CargoModel> cargo = cargoRepository.findById(id);
        return cargo.orElse(null);
    }

    public CargoModel creaCargo(CargoModel cargo) {
        return cargoRepository.save(cargo);
    }

    public List<CargoModel> listarCargos() {
        return cargoRepository.findAll();
    }

    public CargoModel actualizaCargo(Long id, CargoModel updatedCargo) {
        Optional<CargoModel> existingCargo = cargoRepository.findById(id);
        if (existingCargo.isPresent()) {
            CargoModel cargo = existingCargo.get();
            cargo.setName(updatedCargo.getName());
            return cargoRepository.save(cargo);
        }
        return null;
    }

    public boolean deleteCargo(Long id) {
        if (cargoRepository.existsById(id)) {
            cargoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}