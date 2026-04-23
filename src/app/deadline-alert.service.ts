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

  constructor(private apiNotesService: ApiNotesService) {}

  start() {
    if (this.intervalId !== null) return;

    this.requestBrowserPermission();
    this.checkNow();

    this.intervalId = window.setInterval(() => {
      this.checkNow();
    }, 5000);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.queue = [];
    this.currentAlertSubject.next(null);
    this.checking = false;
  }

  dismiss() {
    this.currentAlertSubject.next(null);
    this.showNext();
  }

  markDone(noteId: string) {
    this.apiNotesService.toggleDone(noteId).subscribe({
      next: () => {
        this.dismiss();
      },
      error: () => {
        this.dismiss();
      }
    });
  }

  moveToTrash(noteId: string) {
    this.apiNotesService.moveToTrash(noteId).subscribe({
      next: () => {
        this.dismiss();
      },
      error: () => {
        this.dismiss();
      }
    });
  }

  private checkNow() {
    if (this.checking) return;

    this.checking = true;

    this.apiNotesService.getActive().subscribe({
      next: (activeNotes) => {
        const now = new Date();

        for (const note of activeNotes) {
          if (this.alertedIds.has(note.id)) continue;

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
      error: () => {
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