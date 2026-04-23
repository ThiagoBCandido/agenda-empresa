import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

/*exports*/
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

/*Classes*/
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth';

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
        this.clearSessionMessage();
        this.saveSession(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.clearSessionMessage();
        this.saveSession(response);
      })
    );
  }

  getMe(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${this.apiUrl}/me`);
  }

  refreshMe(): Observable<AuthMeResponse> {
    return this.getMe().pipe(
      tap((data) => this.updateStoredUserFromMe(data))
    );
  }

  updateMe(data: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/me`, data).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/me/password`, data).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  updateProfilePhoto(data: UpdateProfilePhotoRequest): Observable<AuthMeResponse> {
    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me/photo`, data).pipe(
      tap((response) => this.updateStoredUserFromMe(response))
    );
  }

  updateThemePreference(theme: 'dark' | 'light'): Observable<AuthMeResponse> {
    const payload: UpdateThemeRequest = {
      preferredTheme: theme
    };

    return this.http.put<AuthMeResponse>(`${this.apiUrl}/me/theme`, payload).pipe(
      tap((data) => this.updateStoredUserFromMe(data))
    );
  }

  logout(clearSessionMessage = true) {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);

    if (clearSessionMessage) {
      this.clearSessionMessage();
    }
  }

  handleUnauthorized() {
    if (this.unauthorizedHandled) return;

    this.unauthorizedHandled = true;
    this.logout(false);
    this.sessionMessageSubject.next('Sua sessão expirou. Faça login novamente.');

    setTimeout(() => {
      this.unauthorizedHandled = false;
    }, 300);
  }

  clearSessionMessage() {
    this.sessionMessageSubject.next('');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getUserName(): string {
    return this.getUser()?.name ?? '';
  }

  getUserEmail(): string {
    return this.getUser()?.email ?? '';
  }

  getUserRole(): string {
    return this.getUser()?.role ?? '';
  }

  getUserPhoto(): string | null {
    return this.getUser()?.profilePhoto ?? null;
  }

  updateStoredUserFromMe(data: AuthMeResponse) {
    const current = this.getUser();

    if (!current) return;

    const updated: AuthResponse = {
      ...current,
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      jobTitle: data.jobTitle,
      timeZone: data.timeZone,
      notificationsEnabled: data.notificationsEnabled,
      preferredTheme: data.preferredTheme,
      profilePhoto: data.profilePhoto
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }

  private saveSession(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  private readStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}