import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { forkJoin, of, switchMap } from 'rxjs';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiNotesService, Priority, NoteBlock, NoteWritePayload } from '../core/services/api-notes.service';
import { NotesRefreshService } from '../core/services/notes-refresh.service';

function priorityColor(priority: Priority) {
  if (priority === 'alta') return '#ef4444';
  if (priority === 'media') return '#f59e0b';
  return '#3b82f6';
}

function addOneDay(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
}

function normalizeDateRange(startDate: string, endDate: string) {
  if (!startDate) {
    return { startDate: '', endDate: '' };
  }

  const finalEndDate = endDate || startDate;

  if (finalEndDate < startDate) {
    return {
      startDate: finalEndDate,
      endDate: startDate
    };
  }

  return {
    startDate,
    endDate: finalEndDate
  };
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  @ViewChild(FullCalendarComponent) calendarComponent?: FullCalendarComponent;

  private resizeRaf: number | null = null;

  selectedDate: string | null = null;
  showPriorityMenu = false;
  menuX = 0;
  menuY = 0;
  showModal = false;
  allowDateEdit = true;
  isEditing = false;
  editingId: string | null = null;

  draftPriority: Priority = 'media';
  draftTitle = '';
  draftDesc = '';
  draftStartDate = '';
  draftEndDate = '';
  draftStartTime = '';
  draftEndTime = '';

  notesOfSelectedDay: NoteBlock[] = [];
  pendingActions = new Map<string, 'done' | 'trash'>();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    showNonCurrentDates: true,
    fixedWeekCount: true,
    height: '100%',
    expandRows: false,
    dayMaxEvents: 2,
    eventDisplay: 'block',
    events: [],

    dateClick: (info) => {
      this.selectedDate = info.dateStr;

      const ev = info.jsEvent as MouseEvent;
      this.menuX = ev.clientX;
      this.menuY = ev.clientY;

      this.allowDateEdit = true;
      this.showPriorityMenu = true;
      this.showModal = false;

      this.refreshSelectedDayList();
    },

    eventClick: (info) => {
      const noteId = (info.event.extendedProps as any).noteId as string | undefined;

      if (!noteId) return;

      this.notes.getById(noteId).subscribe({
        next: (note) => {
          if (note.deleted || note.done) return;
          this.openEditModal(note);
        },
        error: (err) => {
          console.error('Erro ao carregar anotação para edição:', err);
        }
      });
    }
  };

  constructor(
    private notes: ApiNotesService,
    private notesRefreshService: NotesRefreshService
  ) {}

  ngOnInit() {
    this.reloadCalendarEvents();
  }

  animateCalendarResize(duration = 340) {
    const api = this.calendarComponent?.getApi();

    if (!api) return;

    if (this.resizeRaf !== null) {
      cancelAnimationFrame(this.resizeRaf);
    }

    const start = performance.now();

    const tick = (now: number) => {
      api.updateSize();

      if (now - start < duration) {
        this.resizeRaf = requestAnimationFrame(tick);
      } else {
        this.resizeRaf = null;
        api.updateSize();
        api.render();
      }
    };

    this.resizeRaf = requestAnimationFrame(tick);
  }

  refreshSelectedDayList() {
    if (!this.selectedDate) {
      this.notesOfSelectedDay = [];
      return;
    }

    this.notes.getByDate(this.selectedDate).subscribe({
      next: (notes) => {
        this.notesOfSelectedDay = notes.filter(note => !note.deleted && !note.done);
      },
      error: (err) => {
        console.error('Erro ao carregar notas do dia:', err);
        this.notesOfSelectedDay = [];
      }
    });
  }

  reloadCalendarEvents() {
    this.notes.getActive().subscribe({
      next: (activeNotes) => {
        const events: EventInput[] = activeNotes.map((note) => {
          const range = normalizeDateRange(note.date, note.endDate || note.date);

          return {
            id: note.id,
            title: note.title?.trim() ? note.title : '(Sem título)',
            start: range.startDate,
            end: addOneDay(range.endDate),
            allDay: true,
            color: priorityColor(note.priority),
            extendedProps: {
              noteId: note.id
            }
          };
        });

        this.calendarOptions = {
          ...this.calendarOptions,
          events
        };
      },
      error: (err) => {
        console.error('Erro ao recarregar eventos do calendário:', err);
      }
    });
  }

  pickPriority(p: Priority) {
    this.draftPriority = p;
    this.showPriorityMenu = false;
    this.allowDateEdit = true;
    this.isEditing = false;
    this.editingId = null;

    this.draftTitle = '';
    this.draftDesc = '';
    this.draftStartDate = this.selectedDate || '';
    this.draftEndDate = this.selectedDate || '';
    this.draftStartTime = '';
    this.draftEndTime = '';

    this.pendingActions.clear();
    this.showModal = true;

    this.refreshSelectedDayList();
  }

  openCreateModal(date: string, priority: Priority, allowDateEdit: boolean = true) {
    this.selectedDate = date;
    this.allowDateEdit = allowDateEdit;
    this.showPriorityMenu = false;
    this.isEditing = false;
    this.editingId = null;

    this.draftPriority = priority;
    this.draftTitle = '';
    this.draftDesc = '';
    this.draftStartDate = date;
    this.draftEndDate = date;
    this.draftStartTime = '';
    this.draftEndTime = '';

    this.pendingActions.clear();
    this.showModal = true;

    this.refreshSelectedDayList();
  }

  openEditModal(note: NoteBlock) {
    this.selectedDate = note.date;
    this.allowDateEdit = true;
    this.showPriorityMenu = false;
    this.isEditing = true;
    this.editingId = note.id;

    this.draftPriority = note.priority;
    this.draftTitle = note.title;
    this.draftDesc = note.description;
    this.draftStartDate = note.date;
    this.draftEndDate = note.endDate || note.date;
    this.draftStartTime = note.startTime || '';
    this.draftEndTime = note.endTime || '';

    this.pendingActions.clear();
    this.showModal = true;

    this.refreshSelectedDayList();
  }

  closePriorityMenu() {
    this.showPriorityMenu = false;
  }

  closeModal() {
    this.pendingActions.clear();
    this.showModal = false;
  }

  private buildPayload(): NoteWritePayload {
    const range = normalizeDateRange(
      this.draftStartDate || this.selectedDate || '',
      this.draftEndDate || this.draftStartDate || this.selectedDate || ''
    );

    return {
      title: this.draftTitle.trim() || 'Sem título',
      description: this.draftDesc.trim(),
      priority: this.draftPriority,
      date: range.startDate,
      endDate: range.endDate,
      startTime: this.draftStartTime || '',
      endTime: this.draftEndTime || ''
    };
  }

  isPending(noteId: string, action: 'done' | 'trash'): boolean {
    return this.pendingActions.get(noteId) === action;
  }

  private applyPendingActions(excludeId?: string) {
    const actions = Array.from(this.pendingActions.entries())
      .filter(([id]) => id !== excludeId);

    if (!actions.length) {
      return of(null);
    }

    return forkJoin(
      actions.map(([id, action]) =>
        action === 'done'
          ? this.notes.toggleDone(id)
          : this.notes.moveToTrash(id)
      )
    );
  }

  save() {
    const startDate = this.draftStartDate || this.selectedDate;
    const endDate = this.draftEndDate || startDate;

    if (!startDate || !endDate) return;

    const title = this.draftTitle.trim();
    const desc = this.draftDesc.trim();

    if (!title && !desc) return;

    const payload = this.buildPayload();
    const request$ = this.isEditing && this.editingId ? this.notes.update(this.editingId, payload) : this.notes.create(payload);

    request$.pipe(
      switchMap(() => this.applyPendingActions())
    ).subscribe({
      next: () => {
        this.pendingActions.clear();
        this.reloadCalendarEvents();
        this.refreshSelectedDayList();
        this.notesRefreshService.notify();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao salvar anotação:', err);
      }
    });
  }

  saveAndComplete() {
    if (!this.isEditing || !this.editingId) return;

    const noteId = this.editingId;
    const payload = this.buildPayload();

    this.notes.update(noteId, payload).pipe(switchMap(() => this.notes.toggleDone(noteId)), switchMap(() => this.applyPendingActions(noteId))).subscribe({
      next: () => {
        this.pendingActions.clear();
        this.reloadCalendarEvents();
        this.refreshSelectedDayList();
        this.notesRefreshService.notify();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar e concluir:', err);
      }
    });
  }

  completeFromList(noteId: string) {
    const current = this.pendingActions.get(noteId);

    if (current === 'done') {
      this.pendingActions.delete(noteId);
      return;
    }

    this.pendingActions.set(noteId, 'done');
  }

  trashFromList(noteId: string) {
    const current = this.pendingActions.get(noteId);

    if (current === 'trash') {
      this.pendingActions.delete(noteId);
      return;
    }
    this.pendingActions.set(noteId, 'trash');
  }
}