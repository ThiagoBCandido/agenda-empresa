package com.agendaempresa.backend.service;

import com.agendaempresa.backend.dto.AuthMeResponse;
import com.agendaempresa.backend.dto.auth.AuthResponse;
import com.agendaempresa.backend.dto.auth.ChangePasswordRequest;
import com.agendaempresa.backend.dto.auth.LoginRequest;
import com.agendaempresa.backend.dto.auth.RegisterRequest;
import com.agendaempresa.backend.dto.auth.UpdateProfilePhotoRequest;
import com.agendaempresa.backend.dto.auth.UpdateProfileRequest;
import com.agendaempresa.backend.exception.ResourceNotFoundException;
import com.agendaempresa.backend.model.User;
import com.agendaempresa.backend.model.UserRole;
import com.agendaempresa.backend.repository.UserRepository;
import com.agendaempresa.backend.security.CustomUserDetailsService;
import com.agendaempresa.backend.security.JwtService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.agendaempresa.backend.dto.auth.UpdateThemeRequest;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, CustomUserDetailsService userDetailsService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    public AuthMeResponse updateCurrentUserTheme(UpdateThemeRequest request) {
        User user = getAuthenticatedUser();
        user.setPreferredTheme(normalizeTheme(request.preferredTheme()));
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return toMeResponse(updatedUser);
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Já existe um usuário com esse e-mail");
        }

        LocalDateTime now = LocalDateTime.now();
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        user.setJobTitle("Colaborador");
        user.setTimeZone("America/Sao_Paulo");
        user.setNotificationsEnabled(true);
        user.setPreferredTheme("dark");
        user.setProfilePhoto(null);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(savedUser.getEmail()));
        return new AuthResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), token, "Usuário cadastrado com sucesso");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Senha inválida");
        }

        String token = jwtService.generateToken(
                userDetailsService.loadUserByUsername(user.getEmail())
        );

        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), token, "Login realizado com sucesso");
    }

    public AuthMeResponse getCurrentUser() {
        User user = getAuthenticatedUser();
        return toMeResponse(user);
    }

    public AuthResponse updateCurrentUser(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        String newName = request.name().trim();
        String newEmail = request.email().trim().toLowerCase();
        userRepository.findByEmail(newEmail).ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(user.getId())) {
                        throw new IllegalArgumentException("Já existe um usuário com esse e-mail");
                    }
                });

        user.setName(newName);
        user.setEmail(newEmail);
        user.setJobTitle(sanitizeJobTitle(request.jobTitle()));
        user.setTimeZone(sanitizeTimeZone(request.timeZone()));
        user.setNotificationsEnabled(Boolean.TRUE.equals(request.notificationsEnabled()));
        user.setPreferredTheme(normalizeTheme(request.preferredTheme()));
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        String newToken = jwtService.generateToken(userDetailsService.loadUserByUsername(updatedUser.getEmail()));
        return new AuthResponse(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(), updatedUser.getRole(), newToken, "Perfil atualizado com sucesso");
    }

    public AuthMeResponse updateCurrentUserPhoto(UpdateProfilePhotoRequest request) {
        User user = getAuthenticatedUser();
        user.setProfilePhoto(request.profilePhoto());
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return toMeResponse(updatedUser);
    }

    public AuthResponse changeCurrentPassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("A senha atual está incorreta");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        String newToken = jwtService.generateToken(userDetailsService.loadUserByUsername(updatedUser.getEmail()));
        return new AuthResponse( updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(), updatedUser.getRole(), newToken, "Senha atualizada com sucesso");
    }

    private User getAuthenticatedUser() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentEmail).orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não encontrado"));
    }

    private AuthMeResponse toMeResponse(User user) {
        return new AuthMeResponse(
            user.getId(), 
            user.getName(), 
            user.getEmail(), 
            user.getRole(), 
            sanitizeJobTitle(user.getJobTitle()), 
            sanitizeTimeZone(user.getTimeZone()), 
            user.getNotificationsEnabled() == null ? true : user.getNotificationsEnabled(), 
            normalizeTheme(user.getPreferredTheme()), 
            user.getProfilePhoto()
        );
    }

    private String sanitizeJobTitle(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "Colaborador";
        }
        return value.trim();
    }

    private String sanitizeTimeZone(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "America/Sao_Paulo";
        }
        return value.trim();
    }

    private String normalizeTheme(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "dark";
        }

        String normalized = value.trim().toLowerCase();

        if (!normalized.equals("dark") && !normalized.equals("light")) {
            return "dark";
        }

        return normalized;
    }
}