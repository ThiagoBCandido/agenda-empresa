package com.agendaempresa.backend.repository;

import com.agendaempresa.backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByUserId(UUID userId);
    List<Note> findByUserIdAndDeletedFalseAndDoneFalse(UUID userId);
    List<Note> findByUserIdAndDeletedFalseAndDoneTrue(UUID userId);
    List<Note> findByUserIdAndDeletedTrue(UUID userId);
    @Query("""
            SELECT n FROM Note n
            WHERE n.user.id = :userId
              AND n.deleted = false
              AND n.done = false
              AND n.date <= :date AND COALESCE(n.endDate, n.date) >= :date
            """)
    List<Note> findActiveByDateInsideRange(
            @Param("userId") UUID userId,
            @Param("date") LocalDate date
    );
    Optional<Note> findByIdAndUserId(UUID id, UUID userId);
}