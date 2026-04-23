import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiNotesService, NoteBlock } from '../core/services/api-notes.service';
import { NotesRefreshService } from '../core/services/notes-refresh.service';

@Component({
  selector: 'app-anotacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anotacoes.component.html',
  styleUrl: './anotacoes.component.css'
})
export class AnotacoesComponent implements OnInit, OnDestroy {
  @Output() noteSelected = new EventEmitter<NoteBlock>();

  notes: NoteBlock[] = [];
  loading = true;

  private refreshSub?: Subscription;

  constructor(
    private apiNotesService: ApiNotesService,
    private notesRefreshService: NotesRefreshService
  ) {}

  ngOnInit() {
    this.loadNotes();
    this.refreshSub = this.notesRefreshService.refresh$.subscribe(() => {
      this.loadNotes();
    });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  selectNote(note: NoteBlock) {
    this.noteSelected.emit(note);
  }

  trackByNoteId(index: number, note: NoteBlock): string {
    return note.id;
  }

  priorityLabel(priority: string): string {
    if (priority === 'alta') return 'Alta';
    if (priority === 'media') return 'Média';
    return 'Baixa';
  }

  private loadNotes() {
    this.loading = true;
    this.apiNotesService.getActive().subscribe({
      next: (notes) => {
        this.notes = notes
          .filter(note => !note.deleted && !note.done)
          .sort((a, b) => {
            const aDate = `${a.endDate || a.date}T${a.endTime || '23:59'}`;
            const bDate = `${b.endDate || b.date}T${b.endTime || '23:59'}`;
            return new Date(aDate).getTime() - new Date(bDate).getTime();
          });

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar anotações:', err);
        this.notes = [];
        this.loading = false;
      }
    });
  }
}