package com.agendaempresa.backend.dto.auth;

import com.agendaempresa.backend.model.UserRole;
import java.util.UUID;

public record AuthResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        String token,
        String message
) {
}