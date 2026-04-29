package com.agendaempresa.backend.dto;

import com.agendaempresa.backend.model.UserRole;
import java.util.UUID;

public record AuthMeResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        String jobTitle,
        String timeZone,
        Boolean notificationsEnabled,
        String preferredTheme,
        String profilePhoto
) {
}