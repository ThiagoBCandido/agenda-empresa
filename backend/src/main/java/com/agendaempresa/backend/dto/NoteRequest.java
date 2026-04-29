package com.agendaempresa.backend.dto;

import com.agendaempresa.backend.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record NoteRequest(

        @NotBlank(message = "O título é obrigatório")
        @Size(min = 3, max = 100, message = "O título deve ter entre 3 e 100 caracteres")
        String title,
        @Size(max = 1000, message = "A descrição pode ter no máximo 1000 caracteres")
        String description,
        @NotNull(message = "A prioridade é obrigatória")
        Priority priority,
        @NotNull(message = "A data inicial é obrigatória")
        LocalDate date,
        LocalDate endDate,
        LocalTime startTime,
        LocalTime endTime
) {}