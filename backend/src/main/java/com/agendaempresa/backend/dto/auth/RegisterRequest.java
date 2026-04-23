package com.agendaempresa.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Nome obrigatório")
    @Size(min = 3, max = 120, message = "O nome dever no mínimo 3 caracteres")
    String name,

    @NotBlank(message = "E-mail obrigatório")
    @Email(message = "E-mail inválido")
    String email,

    @NotBlank(message = "Senha obrigatória")
    @Size(min = 6, max = 120, message = "A senha deve ter no mínimo 6 caracteres")
    String password
) {}
