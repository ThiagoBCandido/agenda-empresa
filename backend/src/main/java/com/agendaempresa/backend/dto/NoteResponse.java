package com.agendaempresa.backend.dto;

import com.agendaempresa.backend.model.Priority;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        String title,
        String description,
        Priority priority,
        LocalDate date,
        LocalDate endDate,
        LocalTime startTime,
        LocalTime endTime,
        Boolean done,
        Boolean deleted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime completedAt,
        LocalDateTime deletedAt
) {}