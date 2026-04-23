package com.agendaempresa.backend.config;

import com.agendaempresa.backend.model.User;
import com.agendaempresa.backend.model.UserRole;
import com.agendaempresa.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDefaultUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String defaultEmail = "teste@agendaempresa.com";

            if (userRepository.findByEmail(defaultEmail).isEmpty()) {
                User user = new User();
                user.setName("Usuário Teste");
                user.setEmail(defaultEmail);
                user.setPasswordHash(passwordEncoder.encode("123456"));
                user.setRole(UserRole.USER);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());

                userRepository.save(user);
            }
        };
    }
}