import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiNotesService, NoteBlock } from './core/services/api-notes.service';

@Injectable({ providedIn: 'root' })
export class DeadlineAlertService {
  private currentAlertSubject = new BehaviorSubject<NoteBlock | null>(null);
  currentAlert$ = this.currentAlertSubject.asObservable();

  private queue: NoteBlock[] = [];
  private alertedIds = new Set<string>();
  private intervalId: number | null = null;
  private checking = false;
  private readonly checkIntervalMs = 30000;

  constructor(private notesService: ApiNotesService) {}

  start() {
    if (this.intervalId !== null) return;

    this.requestBrowserPermission();
    this.checkNow();

    this.intervalId = window.setInterval(() => {
      this.checkNow();
    }, this.checkIntervalMs);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.checking = false;
    this.queue = [];
    this.currentAlertSubject.next(null);
    this.alertedIds.clear();
  }

  dismiss() {
    this.currentAlertSubject.next(null);
    this.showNext();
  }

  markDone(noteId: string) {
    this.notesService.toggleDone(noteId).subscribe({
      next: () => {
        this.dismiss();
      },
      error: (err) => {
        console.error('Erro ao concluir anotação no alerta:', err);
      }
    });
  }

  moveToTrash(noteId: string) {
    this.notesService.moveToTrash(noteId).subscribe({
      next: () => {
        this.dismiss();
      },
      error: (err) => {
        console.error('Erro ao mover anotação para lixeira no alerta:', err);
      }
    });
  }

  private checkNow() {
    if (this.checking) return;
    this.checking = true;

    const now = new Date();

    this.notesService.getActive().subscribe({
      next: (activeNotes) => {
        for (const note of activeNotes) {
          if (this.alertedIds.has(note.id)) continue;
          if (note.deleted || note.done) continue;

          const deadline = this.getDeadline(note);
          if (!deadline) continue;

          if (deadline.getTime() <= now.getTime()) {
            this.alertedIds.add(note.id);
            this.queue.push(note);
          }
        }

        this.showNext();
        this.checking = false;
      },
      error: (err) => {
        console.error('Erro ao verificar deadlines:', err);
        this.checking = false;
      }
    });
  }

  private showNext() {
    if (this.currentAlertSubject.value) return;
    if (!this.queue.length) return;

    const next = this.queue.shift() || null;
    if (!next) return;

    this.currentAlertSubject.next(next);
    this.showBrowserNotification(next);
  }

  private getDeadline(note: NoteBlock): Date | null {
    if (!note.endTime || !note.endTime.trim()) return null;

    const endDate = note.endDate?.trim() || note.date?.trim();
    if (!endDate) return null;

    const dt = new Date(`${endDate}T${note.endTime}`);
    if (isNaN(dt.getTime())) return null;

    return dt;
  }

  private requestBrowserPermission() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }

  private showBrowserNotification(note: NoteBlock) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const bodyParts = [
      note.description?.trim() || 'Prazo atingido.',
      note.endDate ? `Prazo: ${note.endDate}${note.endTime ? ' ' + note.endTime : ''}` : ''
    ].filter(Boolean);

    const notification = new Notification(`Prazo: ${note.title}`, {
      body: bodyParts.join(' • '),
      tag: `deadline-${note.id}`
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}