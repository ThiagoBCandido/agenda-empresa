import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';

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

  private readonly apiUrl = API_ENDPOINTS.auth;
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
      tap((me) => this.mergeCurrentUser(me))
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<AuthMeResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/me`, data).pipe(
      tap((response) => this.setSession(response)),
      switchMap(() => this.refreshMe())
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/me/password`, data).pipe(
      tap((response) => this.setSession(response))
    );
  }

  updateProfilePhoto(data: UpdateProfilePhotoRequest): Observable<AuthMeResponse> {
    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me/photo`, data).pipe(
      tap((me) => this.mergeCurrentUser(me))
    );
  }

  updateThemePreference(preferredTheme: 'dark' | 'light'): Observable<AuthMeResponse> {
    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me/theme`, { preferredTheme }).pipe(
      tap((me) => this.mergeCurrentUser(me))
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

    this.sessionMessageSubject.next(
      setMessage ? 'Sua sessão expirou. Faça login novamente.' : ''
    );
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

  private mergeCurrentUser(me: AuthMeResponse) {
    const current = this.currentUserSubject.value;
    if (!current) return;

    this.persistUserOnly({
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
    });
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
