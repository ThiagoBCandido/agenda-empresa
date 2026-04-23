import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiNotesService, NoteBlock } from '../core/services/api-notes.service';

interface TrashGroup {
  label: string;
  items: NoteBlock[];
}

@Component({
  selector: 'app-lixeira',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lixeira.component.html',
  styleUrl: './lixeira.component.css'
})
export class LixeiraComponent implements OnInit {
  notes: NoteBlock[] = [];
  searchTerm = '';
  groups: TrashGroup[] = [];
  showModal = false;
  selectedNote: NoteBlock | null = null;

  constructor(private apiNotesService: ApiNotesService) {}

  ngOnInit() {
    this.loadTrashNotes();
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

  restore(id: string) {
    this.apiNotesService.restoreFromTrash(id).subscribe({
      next: () => {
        if (this.selectedNote?.id === id) {
          this.closeModal();
        }
        this.loadTrashNotes();
      },
      error: (err) => {
        console.error('Erro ao restaurar anotação da lixeira:', err);
      }
    });
  }

  deleteForever(id: string) {
    this.apiNotesService.deletePermanently(id).subscribe({
      next: () => {
        if (this.selectedNote?.id === id) {
          this.closeModal();
        }
        this.loadTrashNotes();
      },
      error: (err) => {
        console.error('Erro ao excluir anotação permanentemente:', err);
      }
    });
  }

  onSearchChange() {
    this.rebuildGroups();
  }

  private loadTrashNotes() {
    this.apiNotesService.getTrash().subscribe({
      next: (notes) => {
        this.notes = [...notes].sort(
          (a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)
        );

        this.rebuildGroups();

        if (this.selectedNote) {
          const updated = this.notes.find(n => n.id === this.selectedNote?.id) || null;

          if (updated && updated.deleted) {
            this.selectedNote = updated;
          } else {
            this.closeModal();
          }
        }
      },
      error: (err) => {
        console.error('Erro ao carregar lixeira:', err);
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
        this.formatGroupLabel(note.deletedAt),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });

    const map = new Map<string, NoteBlock[]>();

    for (const note of filtered) {
      const key = this.groupKey(note.deletedAt);
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