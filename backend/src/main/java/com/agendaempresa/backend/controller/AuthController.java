package com.agendaempresa.backend.controller;

import com.agendaempresa.backend.dto.AuthMeResponse;
import com.agendaempresa.backend.dto.auth.AuthResponse;
import com.agendaempresa.backend.dto.auth.ChangePasswordRequest;
import com.agendaempresa.backend.dto.auth.LoginRequest;
import com.agendaempresa.backend.dto.auth.RegisterRequest;
import com.agendaempresa.backend.dto.auth.UpdateProfilePhotoRequest;
import com.agendaempresa.backend.dto.auth.UpdateProfileRequest;
import com.agendaempresa.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import com.agendaempresa.backend.dto.auth.UpdateThemeRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthMeResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateCurrentUser(request));
    }

    @PutMapping("/me/photo")
    public ResponseEntity<AuthMeResponse> updatePhoto(@RequestBody UpdateProfilePhotoRequest request) {
        return ResponseEntity.ok(authService.updateCurrentUserPhoto(request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<AuthResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changeCurrentPassword(request));
    }

    @PutMapping("/me/theme")
    public ResponseEntity<AuthMeResponse> updateTheme(@RequestBody UpdateThemeRequest request) {
        return ResponseEntity.ok(authService.updateCurrentUserTheme(request));
    }
}