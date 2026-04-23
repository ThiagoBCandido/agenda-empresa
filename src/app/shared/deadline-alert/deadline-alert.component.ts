import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeadlineAlertService } from '../../deadline-alert.service';
import { NoteBlock } from '../../core/services/notes.service';

@Component({
  selector: 'app-deadline-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deadline-alert.component.html',
  styleUrl: './deadline-alert.component.css'
})
export class DeadlineAlertComponent {
  note: NoteBlock | null = null;

  constructor(private deadlineAlertService: DeadlineAlertService) {
    this.deadlineAlertService.currentAlert$.subscribe(note => {
      this.note = note;
    });
  }

  close() {
    this.deadlineAlertService.dismiss();
  }

  markDone() {
    if (!this.note) return;
    this.deadlineAlertService.markDone(this.note.id);
  }

  moveToTrash() {
    if (!this.note) return;
    this.deadlineAlertService.moveToTrash(this.note.id);
  }

  priorityClass() {
    if (!this.note) return '';
    if (this.note.priority === 'alta') return 'high';
    if (this.note.priority === 'media') return 'medium';
    return 'low';
  }
}