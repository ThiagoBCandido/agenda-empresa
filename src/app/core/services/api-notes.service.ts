import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';

export type Priority = 'alta' | 'media' | 'baixa';

export interface NoteBlock {
  id: string;
  title: string;
  description: string;
  priority: Priority;

  date: string;
  endDate: string;
  startTime: string;
  endTime: string;

  done: boolean;
  deleted: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  deletedAt: number | null;
}

export interface NoteWritePayload {
  title: string;
  description: string;
  priority: Priority;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

type ApiPriority = 'ALTA' | 'MEDIA' | 'BAIXA';

interface ApiNoteRequest {
  title: string;
  description: string;
  priority: ApiPriority;
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

interface ApiNoteResponse {
  id: string;
  title: string;
  description: string;
  priority: ApiPriority;

  date: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;

  done: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiNotesService {
  private http = inject(HttpClient);

  private readonly apiUrl = API_ENDPOINTS.notes;

  getAll(): Observable<NoteBlock[]> {
    return this.http.get<ApiNoteResponse[]>(this.apiUrl).pipe(
      map(notes => notes.map(note => this.fromApi(note)))
    );
  }

  getActive(): Observable<NoteBlock[]> {
    return this.http.get<ApiNoteResponse[]>(`${this.apiUrl}/active`).pipe(
      map(notes => notes.map(note => this.fromApi(note)))
    );
  }

  getCompleted(): Observable<NoteBlock[]> {
    return this.http.get<ApiNoteResponse[]>(`${this.apiUrl}/completed`).pipe(
      map(notes => notes.map(note => this.fromApi(note)))
    );
  }

  getTrash(): Observable<NoteBlock[]> {
    return this.http.get<ApiNoteResponse[]>(`${this.apiUrl}/trash`).pipe(
      map(notes => notes.map(note => this.fromApi(note)))
    );
  }

  getByDate(date: string): Observable<NoteBlock[]> {
    return this.http.get<ApiNoteResponse[]>(`${this.apiUrl}/by-date`, {
      params: { date }
    }).pipe(
      map(notes => notes.map(note => this.fromApi(note)))
    );
  }

  getById(id: string): Observable<NoteBlock> {
    return this.http.get<ApiNoteResponse>(`${this.apiUrl}/${id}`).pipe(
      map(note => this.fromApi(note))
    );
  }

  create(data: NoteWritePayload): Observable<NoteBlock> {
    return this.http.post<ApiNoteResponse>(
      this.apiUrl,
      this.toApiRequest(data)
    ).pipe(
      map(note => this.fromApi(note))
    );
  }

  update(id: string, data: NoteWritePayload): Observable<NoteBlock> {
    return this.http.put<ApiNoteResponse>(
      `${this.apiUrl}/${id}`,
      this.toApiRequest(data)
    ).pipe(
      map(note => this.fromApi(note))
    );
  }

  toggleDone(id: string): Observable<NoteBlock> {
    return this.http.patch<ApiNoteResponse>(
      `${this.apiUrl}/${id}/toggle-done`,
      null
    ).pipe(
      map(note => this.fromApi(note))
    );
  }

  moveToTrash(id: string): Observable<NoteBlock> {
    return this.http.patch<ApiNoteResponse>(
      `${this.apiUrl}/${id}/trash`,
      null
    ).pipe(
      map(note => this.fromApi(note))
    );
  }

  restoreFromTrash(id: string): Observable<NoteBlock> {
    return this.http.patch<ApiNoteResponse>(
      `${this.apiUrl}/${id}/restore`,
      null
    ).pipe(
      map(note => this.fromApi(note))
    );
  }

  deletePermanently(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/permanent`);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toApiRequest(data: NoteWritePayload): ApiNoteRequest {
    return {
      title: data.title.trim() || 'Sem título',
      description: data.description?.trim() ?? '',
      priority: this.toApiPriority(data.priority),
      date: data.date,
      endDate: data.endDate || data.date,
      startTime: data.startTime || null,
      endTime: data.endTime || null
    };
  }

  private fromApi(note: ApiNoteResponse): NoteBlock {
    return {
      id: note.id,
      title: note.title,
      description: note.description ?? '',
      priority: this.fromApiPriority(note.priority),

      date: note.date,
      endDate: note.endDate ?? note.date,
      startTime: note.startTime ?? '',
      endTime: note.endTime ?? '',

      done: !!note.done,
      deleted: !!note.deleted,
      createdAt: new Date(note.createdAt).getTime(),
      updatedAt: new Date(note.updatedAt).getTime(),
      completedAt: note.completedAt ? new Date(note.completedAt).getTime() : null,
      deletedAt: note.deletedAt ? new Date(note.deletedAt).getTime() : null
    };
  }

  private toApiPriority(priority: Priority): ApiPriority {
    switch (priority) {
      case 'alta':
        return 'ALTA';
      case 'media':
        return 'MEDIA';
      case 'baixa':
        return 'BAIXA';
    }
  }

  private fromApiPriority(priority: ApiPriority): Priority {
    switch (priority) {
      case 'ALTA':
        return 'alta';
      case 'MEDIA':
        return 'media';
      case 'BAIXA':
        return 'baixa';
    }
  }
}