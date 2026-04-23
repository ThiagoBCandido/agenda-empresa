import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Priority = 'alta' | 'media' | 'baixa';

export interface NoteBlock {
  id: string;
  title: string;
  description: string;
  priority: Priority;

  date: string;        // data inicial
  endDate: string;     // data final
  startTime: string;   // hora inicial
  endTime: string;     // hora final

  done: boolean;
  deleted: boolean;
  createdAt: number;
  completedAt: number | null;
  deletedAt: number | null;
}

function uid() {
  return (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : Math.random().toString(16).slice(2);
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly _notes = new BehaviorSubject<NoteBlock[]>([]);
  readonly notes$ = this._notes.asObservable();

  createWithDetails(payload: {
    priority: Priority;
    date: string;
    endDate: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
  }) {
    const note: NoteBlock = {
      id: uid(),
      title: payload.title.trim() || 'Sem título',
      description: payload.description.trim(),
      priority: payload.priority,

      date: payload.date,
      endDate: payload.endDate || payload.date,
      startTime: payload.startTime || '',
      endTime: payload.endTime || '',

      done: false,
      deleted: false,
      createdAt: Date.now(),
      completedAt: null,
      deletedAt: null,
    };

    this._notes.next([note, ...this._notes.value]);
    return note.id;
  }

  getAll() {
    return this._notes.value;
  }

  getActiveNotes() {
    return this._notes.value.filter(n => !n.done && !n.deleted);
  }

  getCompletedNotes() {
    return this._notes.value.filter(n => n.done && !n.deleted);
  }

  getTrashNotes() {
    return this._notes.value.filter(n => n.deleted);
  }

  getByDate(targetDate: string) {
    return this._notes.value.filter(n => {
      if (n.done || n.deleted) return false;
      return targetDate >= n.date && targetDate <= (n.endDate || n.date);
    });
  }

  getById(id: string) {
    return this._notes.value.find(n => n.id === id) || null;
  }

  updateNote(
    noteId: string,
    patch: Partial<Pick<NoteBlock, 'title' | 'description' | 'priority' | 'date' | 'endDate' | 'startTime' | 'endTime'>>
  ) {
    this._notes.next(
      this._notes.value.map(n => (n.id === noteId ? { ...n, ...patch } : n))
    );
  }

  toggleDone(noteId: string) {
    this._notes.next(
      this._notes.value.map(n => {
        if (n.id !== noteId) return n;

        const nextDone = !n.done;
        return {
          ...n,
          done: nextDone,
          completedAt: nextDone ? Date.now() : null,
        };
      })
    );
  }

  moveToTrash(noteId: string) {
    this._notes.next(
      this._notes.value.map(n =>
        n.id === noteId
          ? { ...n, deleted: true, deletedAt: Date.now() }
          : n
      )
    );
  }

  restoreFromTrash(noteId: string) {
    this._notes.next(
      this._notes.value.map(n =>
        n.id === noteId
          ? { ...n, deleted: false, deletedAt: null }
          : n
      )
    );
  }

  deletePermanently(noteId: string) {
    this._notes.next(this._notes.value.filter(n => n.id !== noteId));
  }
}