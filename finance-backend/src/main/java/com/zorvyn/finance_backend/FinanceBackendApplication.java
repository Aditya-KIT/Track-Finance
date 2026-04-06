package com.zorvyn.finance_backend;

import com.zorvyn.finance_backend.entity.ERole;
import com.zorvyn.finance_backend.entity.Role;
import com.zorvyn.finance_backend.entity.User;
import com.zorvyn.finance_backend.repository.RoleRepository;
import com.zorvyn.finance_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class FinanceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (roleRepository.count() == 0) {
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
                roleRepository.save(new Role(ERole.ROLE_ANALYST));
                roleRepository.save(new Role(ERole.ROLE_VIEWER));
            }

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User("admin", "admin@finance.com", passwordEncoder.encode("admin123"));
                Set<Role> roles = new HashSet<>();
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(adminRole);
                admin.setRoles(roles);
                admin.setActive(true);
                userRepository.save(admin);
            }
        };
    }
}
