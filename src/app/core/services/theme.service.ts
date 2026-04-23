import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'dark' | 'light';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private readonly STORAGE_KEY = 'notes-theme';
  private themeSubject = new BehaviorSubject<AppTheme>(this.readInitialTheme());
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  setTheme(theme: AppTheme, persist = true) {
    this.themeSubject.next(theme);
    this.applyTheme(theme);

    if (persist) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  private readInitialTheme(): AppTheme {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  }

  private applyTheme(theme: AppTheme) {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme === 'dark');
  }
}
