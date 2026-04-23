package com.agendaempresa.backend.dto.auth;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Pattern;

public record UpdateProfileRequest(
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
        String name,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "O e-mail informado é inválido")
        @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres")
        String email,

        @Size(max = 120, message = "A função deve ter no máximo 120 caracteres")
        String jobTitle,

        @Size(max = 80, message = "O fuso horário deve ter no máximo 80 caracteres")
        String timeZone,

        @NotNull(message = "O campo de notificações é obrigatório")
        Boolean notificationsEnabled,

        @NotBlank(message = "O tema é obrigatório")
        @Pattern(regexp = "dark|light", message = "O tema deve ser 'dark' ou 'light'")
        String preferredTheme
) {
}