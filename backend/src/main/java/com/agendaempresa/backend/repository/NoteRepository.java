package com.agendaempresa.backend.repository;

import com.agendaempresa.backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByUserId(UUID userId);
    List<Note> findByUserIdAndDeletedFalseAndDoneFalse(UUID userId);
    List<Note> findByUserIdAndDeletedFalseAndDoneTrue(UUID userId);
    List<Note> findByUserIdAndDeletedTrue(UUID userId);
    List<Note> findByUserIdAndDeletedFalseAndDoneFalseAndDate(UUID userId, LocalDate date);
    Optional<Note> findByIdAndUserId(UUID id, UUID userId);
}