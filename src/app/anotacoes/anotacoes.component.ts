import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService, NoteBlock, Priority } from '../core/services/notes.service';

@Component({
  selector: 'app-anotacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anotacoes.component.html',
  styleUrl: './anotacoes.component.css'
})
export class AnotacoesComponent {
  notes: NoteBlock[] = [];

  showModal = false;
  isEditing = false;
  selectedNote: NoteBlock | null = null;

  draftTitle = '';
  draftDescription = '';
  draftPriority: Priority = 'media';

  constructor(private notesService: NotesService) {
    this.notesService.notes$.subscribe(notes => {
      this.notes = [...notes]
        .filter(n => !n.deleted && !n.done)
        .sort((a, b) => b.createdAt - a.createdAt);

      if (this.selectedNote) {
        const updated = notes.find(n => n.id === this.selectedNote?.id) || null;
        this.selectedNote = updated;

        if (updated) {
          this.draftPriority = updated.priority;
        } else {
          this.closeModal();
        }
      }
    });
  }

  trackById(_: number, note: NoteBlock) {
    return note.id;
  }

  openNote(note: NoteBlock) {
    this.selectedNote = note;
    this.draftTitle = note.title;
    this.draftDescription = note.description;
    this.draftPriority = note.priority;
    this.isEditing = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedNote = null;
    this.draftTitle = '';
    this.draftDescription = '';
    this.draftPriority = 'media';
  }

  startEdit() {
    if (!this.selectedNote) return;

    this.draftTitle = this.selectedNote.title;
    this.draftDescription = this.selectedNote.description;
    this.draftPriority = this.selectedNote.priority;
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;

    if (!this.selectedNote) return;

    this.draftTitle = this.selectedNote.title;
    this.draftDescription = this.selectedNote.description;
    this.draftPriority = this.selectedNote.priority;
  }

  saveEdit() {
    if (!this.selectedNote) return;

    this.notesService.updateNote(this.selectedNote.id, {
      title: this.draftTitle.trim() || 'Sem título',
      description: this.draftDescription.trim(),
      priority: this.draftPriority
    });

    this.isEditing = false;
  }

  deleteSelected() {
    if (!this.selectedNote) return;

    this.notesService.moveToTrash(this.selectedNote.id);
    this.closeModal();
  }

  toggleDoneSelected() {
    if (!this.selectedNote) return;

    this.notesService.toggleDone(this.selectedNote.id);
  }
}