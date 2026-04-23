import {Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'sucess' | 'warning' | 'danger';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  createdAt: number;
  timeoutMs?: number;
}

@Injectable({providedIn: 'root'})
export class ToastService {
  private readonly _toasts = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this._toasts.asObservable();

  show(title: string, message: '', type: ToastType = 'info', timeoutMs = 4500){
    const id = crypto.randomUUID ? crypto.randomUUID() :Math.random().toString(16).slice(2);
    const toast: ToastMessage = {id, title, message, type, createdAt: Date.now(), timeoutMs};
    this._toasts.next([toast, ...this._toasts.value]);
  
    if(timeoutMs>0){
      setTimeout(() => this.dismiss(id), timeoutMs);
    }
  }
  dismiss(id: string){
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }

  clear() {
    this._toasts.next([]);
  }
}