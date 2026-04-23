package com.agendaempresa.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank(message = "A senha atual obrigatória") String currentPassword,

    @NotBlank(message = "A nova senha obrigatória")
    @Size(min = 6, message = "A nova precisa de no mínimo 6 caracteres") String newPassword
) {
}
