package bootcamp.vacaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class VacacionesApplication {

	public static void main(String[] args) {
		SpringApplication.run(VacacionesApplication.class, args);
	}

}
