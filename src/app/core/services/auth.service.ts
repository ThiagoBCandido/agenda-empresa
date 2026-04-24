import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  jobTitle: string;
  timeZone: string;
  notificationsEnabled: boolean;
  preferredTheme: 'dark' | 'light';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfilePhotoRequest {
  profilePhoto: string | null;
}

export interface UpdateThemeRequest {
  preferredTheme: 'dark' | 'light';
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  message: string;
  jobTitle?: string;
  timeZone?: string;
  notificationsEnabled?: boolean;
  preferredTheme?: 'dark' | 'light';
  profilePhoto?: string | null;
}

export interface AuthMeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  timeZone: string;
  notificationsEnabled: boolean;
  preferredTheme: 'dark' | 'light';
  profilePhoto: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private backendBaseUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://SEU-BACKEND.onrender.com';

  private apiUrl = `${this.backendBaseUrl}/auth`;

  private readonly TOKEN_KEY = 'agenda_token';
  private readonly USER_KEY = 'agenda_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.readStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private sessionMessageSubject = new BehaviorSubject<string>('');
  sessionMessage$ = this.sessionMessageSubject.asObservable();

  private unauthorizedHandled = false;

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.unauthorizedHandled = false;
        this.setSession(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.unauthorizedHandled = false;
        this.setSession(response);
      })
    );
  }

  refreshMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${this.apiUrl}/me`).pipe(
      tap((me) => {
        const current = this.currentUserSubject.value;
        if (!current) return;

        const merged: AuthResponse = {
          ...current,
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          jobTitle: me.jobTitle,
          timeZone: me.timeZone,
          notificationsEnabled: me.notificationsEnabled,
          preferredTheme: me.preferredTheme,
          profilePhoto: me.profilePhoto
        };

        this.persistUserOnly(merged);
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<AuthMeResponse> {
    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me`, data).pipe(
      tap((me) => {
        const current = this.currentUserSubject.value;
        if (!current) return;

        const merged: AuthResponse = {
          ...current,
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          jobTitle: me.jobTitle,
          timeZone: me.timeZone,
          notificationsEnabled: me.notificationsEnabled,
          preferredTheme: me.preferredTheme,
          profilePhoto: me.profilePhoto
        };

        this.persistUserOnly(merged);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/me/password`, data);
  }

  updateProfilePhoto(data: UpdateProfilePhotoRequest): Observable<AuthMeResponse> {
    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me/photo`, data).pipe(
      tap((me) => {
        const current = this.currentUserSubject.value;
        if (!current) return;

        const merged: AuthResponse = {
          ...current,
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          jobTitle: me.jobTitle,
          timeZone: me.timeZone,
          notificationsEnabled: me.notificationsEnabled,
          preferredTheme: me.preferredTheme,
          profilePhoto: me.profilePhoto
        };

        this.persistUserOnly(merged);
      })
    );
  }

  updateThemePreference(preferredTheme: 'dark' | 'light'): Observable<AuthMeResponse> {
    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me/theme`, { preferredTheme }).pipe(
      tap((me) => {
        const current = this.currentUserSubject.value;
        if (!current) return;

        const merged: AuthResponse = {
          ...current,
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          jobTitle: me.jobTitle,
          timeZone: me.timeZone,
          notificationsEnabled: me.notificationsEnabled,
          preferredTheme: me.preferredTheme,
          profilePhoto: me.profilePhoto
        };

        this.persistUserOnly(merged);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  logout(setMessage = false) {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.unauthorizedHandled = false;

    if (setMessage) {
      this.sessionMessageSubject.next('Sua sessão expirou. Faça login novamente.');
    } else {
      this.sessionMessageSubject.next('');
    }
  }

  handleUnauthorized() {
    if (this.unauthorizedHandled) return;

    this.unauthorizedHandled = true;
    this.logout(true);
  }

  clearSessionMessage() {
    this.sessionMessageSubject.next('');
  }

  private setSession(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.currentUserSubject.next(response);
    this.sessionMessageSubject.next('');
  }

  private persistUserOnly(user: AuthResponse) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}