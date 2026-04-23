import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiNotesService, NoteBlock } from '../core/services/api-notes.service';

interface CompletedGroup {
  label: string;
  items: NoteBlock[];
}

@Component({
  selector: 'app-concluidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './concluidos.component.html',
  styleUrl: './concluidos.component.css'
})
export class ConcluidosComponent implements OnInit {
  notes: NoteBlock[] = [];
  searchTerm = '';
  groups: CompletedGroup[] = [];

  showModal = false;
  selectedNote: NoteBlock | null = null;

  constructor(private apiNotesService: ApiNotesService) {}

  ngOnInit() {
    this.loadCompletedNotes();
  }

  trackById(_: number, note: NoteBlock) {
    return note.id;
  }

  openNote(note: NoteBlock) {
    this.selectedNote = note;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedNote = null;
  }

  markAsPending(id: string) {
    this.apiNotesService.toggleDone(id).subscribe({
      next: () => {
        if (this.selectedNote?.id === id) {
          this.closeModal();
        }
        this.loadCompletedNotes();
      },
      error: (err) => {
        console.error('Erro ao mover anotação para pendentes:', err);
      }
    });
  }

  moveToTrash(id: string) {
    this.apiNotesService.moveToTrash(id).subscribe({
      next: () => {
        if (this.selectedNote?.id === id) {
          this.closeModal();
        }
        this.loadCompletedNotes();
      },
      error: (err) => {
        console.error('Erro ao mover anotação para lixeira:', err);
      }
    });
  }

  onSearchChange() {
    this.rebuildGroups();
  }

  private loadCompletedNotes() {
    this.apiNotesService.getCompleted().subscribe({
      next: (notes) => {
        this.notes = [...notes].sort(
          (a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)
        );

        this.rebuildGroups();

        if (this.selectedNote) {
          const updated = this.notes.find(n => n.id === this.selectedNote?.id) || null;

          if (updated && updated.done && !updated.deleted) {
            this.selectedNote = updated;
          } else {
            this.closeModal();
          }
        }
      },
      error: (err) => {
        console.error('Erro ao carregar concluídos:', err);
      }
    });
  }

  private rebuildGroups() {
    const term = this.searchTerm.trim().toLowerCase();

    const filtered = this.notes.filter(note => {
      if (!term) return true;

      const haystack = [
        note.title,
        note.description,
        note.date,
        this.formatGroupLabel(note.completedAt),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });

    const map = new Map<string, NoteBlock[]>();

    for (const note of filtered) {
      const key = this.groupKey(note.completedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(note);
    }

    this.groups = Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => ({
        label: this.labelFromKey(key),
        items
      }));
  }

  private groupKey(timestamp: number | null) {
    const d = timestamp ? new Date(timestamp) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private labelFromKey(key: string) {
    const [y, m, d] = key.split('-');
    return `${d}/${m}/${y}`;
  }

  private formatGroupLabel(timestamp: number | null) {
    if (!timestamp) return '';
    return this.labelFromKey(this.groupKey(timestamp));
  }
}