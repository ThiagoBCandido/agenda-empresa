package com.agendaempresa.backend.service;

import com.agendaempresa.backend.dto.NoteRequest;
import com.agendaempresa.backend.dto.NoteResponse;
import com.agendaempresa.backend.exception.ResourceNotFoundException;
import com.agendaempresa.backend.model.Note;
import com.agendaempresa.backend.model.User;
import com.agendaempresa.backend.repository.NoteRepository;
import com.agendaempresa.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    public List<NoteResponse> listAll() {
        UUID userId = getCurrentUser().getId();

        return noteRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Note::getDate).thenComparing(Note::getCreatedAt))
                .map(this::toResponse)
                .toList();
    }

    public List<NoteResponse> listActive() {
        UUID userId = getCurrentUser().getId();

        return noteRepository.findByUserIdAndDeletedFalseAndDoneFalse(userId).stream()
                .sorted(Comparator.comparing(Note::getDate).thenComparing(Note::getCreatedAt))
                .map(this::toResponse)
                .toList();
    }

    public List<NoteResponse> listCompleted() {
        UUID userId = getCurrentUser().getId();

        return noteRepository.findByUserIdAndDeletedFalseAndDoneTrue(userId).stream()
                .sorted(Comparator.comparing(
                        Note::getCompletedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::toResponse)
                .toList();
    }

    public List<NoteResponse> listTrash() {
        UUID userId = getCurrentUser().getId();

        return noteRepository.findByUserIdAndDeletedTrue(userId).stream()
                .sorted(Comparator.comparing(
                        Note::getDeletedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::toResponse)
                .toList();
    }

    public List<NoteResponse> listByDate(LocalDate date) {
        UUID userId = getCurrentUser().getId();

        return noteRepository.findActiveByDateInsideRange(userId, date).stream()
                .sorted(Comparator.comparing(Note::getCreatedAt))
                .map(this::toResponse)
                .toList();
    }

    public NoteResponse findById(UUID id) {
        return toResponse(getExistingNote(id));
    }

    public NoteResponse create(NoteRequest request) {
        LocalDateTime now = LocalDateTime.now();

        LocalDate startDate = request.date();
        LocalDate endDate = normalizeEndDate(request.date(), request.endDate());

        Note note = new Note();
        note.setUser(getCurrentUser());
        note.setTitle(request.title().trim());
        note.setDescription(request.description() == null ? "" : request.description().trim());
        note.setPriority(request.priority());
        note.setDate(startDate);
        note.setEndDate(endDate);
        note.setStartTime(request.startTime());
        note.setEndTime(request.endTime());
        note.setDone(false);
        note.setDeleted(false);
        note.setCreatedAt(now);
        note.setUpdatedAt(now);
        note.setCompletedAt(null);
        note.setDeletedAt(null);

        return toResponse(noteRepository.save(note));
    }

    public NoteResponse update(UUID id, NoteRequest request) {
        Note note = getExistingNote(id);

        LocalDate startDate = request.date();
        LocalDate endDate = normalizeEndDate(request.date(), request.endDate());

        note.setTitle(request.title().trim());
        note.setDescription(request.description() == null ? "" : request.description().trim());
        note.setPriority(request.priority());
        note.setDate(startDate);
        note.setEndDate(endDate);
        note.setStartTime(request.startTime());
        note.setEndTime(request.endTime());
        note.setUpdatedAt(LocalDateTime.now());

        return toResponse(noteRepository.save(note));
    }

    public NoteResponse toggleDone(UUID id) {
        Note note = getExistingNote(id);

        boolean nextDone = !Boolean.TRUE.equals(note.getDone());

        note.setDone(nextDone);
        note.setCompletedAt(nextDone ? LocalDateTime.now() : null);
        note.setUpdatedAt(LocalDateTime.now());

        if (nextDone) {
            note.setDeleted(false);
            note.setDeletedAt(null);
        }

        return toResponse(noteRepository.save(note));
    }

    public NoteResponse moveToTrash(UUID id) {
        Note note = getExistingNote(id);

        note.setDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        note.setDone(false);
        note.setCompletedAt(null);
        note.setUpdatedAt(LocalDateTime.now());

        return toResponse(noteRepository.save(note));
    }

    public NoteResponse restoreFromTrash(UUID id) {
        Note note = getExistingNote(id);

        note.setDeleted(false);
        note.setDeletedAt(null);
        note.setUpdatedAt(LocalDateTime.now());

        return toResponse(noteRepository.save(note));
    }

    public void deletePermanently(UUID id) {
        noteRepository.delete(getExistingNote(id));
    }

    public void delete(UUID id) {
        deletePermanently(id);
    }

    private LocalDate normalizeEndDate(LocalDate startDate, LocalDate endDate) {
        if (endDate == null) {
            return startDate;
        }

        if (endDate.isBefore(startDate)) {
            return startDate;
        }

        return endDate;
    }

    private Note getExistingNote(UUID id) {
        UUID userId = getCurrentUser().getId();

        return noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nota não encontrada"));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não encontrado"));
    }

    private NoteResponse toResponse(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getDescription(),
                note.getPriority(),
                note.getDate(),
                note.getEndDate(),
                note.getStartTime(),
                note.getEndTime(),
                note.getDone(),
                note.getDeleted(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getCompletedAt(),
                note.getDeletedAt()
        );
    }
}