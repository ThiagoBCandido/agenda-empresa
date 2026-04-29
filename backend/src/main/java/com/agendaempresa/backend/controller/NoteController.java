package com.agendaempresa.backend.controller;

import com.agendaempresa.backend.dto.NoteRequest;
import com.agendaempresa.backend.dto.NoteResponse;
import com.agendaempresa.backend.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> listAll() {
        return noteService.listAll();
    }

    @GetMapping("/active")
    public List<NoteResponse> listActive() {
        return noteService.listActive();
    }

    @GetMapping("/completed")
    public List<NoteResponse> listCompleted() {
        return noteService.listCompleted();
    }

    @GetMapping("/trash")
    public List<NoteResponse> listTrash() {
        return noteService.listTrash();
    }

    @GetMapping("/by-date")
    public List<NoteResponse> listByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate date) {
        return noteService.listByDate(date);
    }

    @GetMapping("/{id}")
    public NoteResponse findById(@PathVariable UUID id) {
        return noteService.findById(id);
    }

    @PostMapping
    public NoteResponse create(@Valid @RequestBody NoteRequest request) {
        return noteService.create(request);
    }

    @PutMapping("/{id}")
    public NoteResponse update(@PathVariable UUID id, @Valid @RequestBody NoteRequest request) {
        return noteService.update(id, request);
    }

    @PatchMapping("/{id}/toggle-done")
    public NoteResponse toggleDone(@PathVariable UUID id) {
        return noteService.toggleDone(id);
    }

    @PatchMapping("/{id}/trash")
    public NoteResponse moveToTrash(@PathVariable UUID id) {
        return noteService.moveToTrash(id);
    }

    @PatchMapping("/{id}/restore")
    public NoteResponse restoreFromTrash(@PathVariable UUID id) {
        return noteService.restoreFromTrash(id);
    }

    @DeleteMapping("/{id}/permanent")
    public void deletePermanently(@PathVariable UUID id) {
        noteService.deletePermanently(id);
    }
}