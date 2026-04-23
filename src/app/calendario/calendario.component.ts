import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { forkJoin, of, switchMap } from 'rxjs';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import {
  ApiNotesService,
  Priority,
  NoteBlock,
  NoteWritePayload
} from '../core/services/api-notes.service';
import { NotesRefreshService } from '../core/services/notes-refresh.service';

function priorityColor(priority: Priority) {
  if (priority === 'alta') return '#ef4444';
  if (priority === 'media') return '#f59e0b';
  return '#3b82f6';
}

function enumerateDays(startDate: string, endDate: string) {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const current = new Date(start);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
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
  allowDateEdit = false;

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

      this.allowDateEdit = false;
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
        const events: EventInput[] = activeNotes.flatMap((n) =>
          enumerateDays(n.date, n.endDate || n.date).map(day => ({
            title: n.title?.trim() ? n.title : '(Sem título)',
            date: day,
            color: priorityColor(n.priority),
            extendedProps: { noteId: n.id }
          }))
        );

        this.calendarOptions = { ...this.calendarOptions, events };
      },
      error: (err) => {
        console.error('Erro ao recarregar eventos do calendário:', err);
      }
    });
  }

  pickPriority(p: Priority) {
    this.draftPriority = p;
    this.showPriorityMenu = false;

    this.allowDateEdit = false;

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

  openCreateModal(date: string, priority: Priority, allowDateEdit: boolean = false) {
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
    this.allowDateEdit = false;
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
    const startDate = this.draftStartDate || this.selectedDate || '';
    const endDate = this.draftEndDate || startDate;

    return {
      title: this.draftTitle.trim() || 'Sem título',
      description: this.draftDesc.trim(),
      priority: this.draftPriority,
      date: startDate,
      endDate,
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

    const request$ =
      this.isEditing && this.editingId
        ? this.notes.update(this.editingId, payload)
        : this.notes.create(payload);

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

    this.notes.update(noteId, payload).pipe(
      switchMap(() => this.notes.toggleDone(noteId)),
      switchMap(() => this.applyPendingActions(noteId))
    ).subscribe({
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