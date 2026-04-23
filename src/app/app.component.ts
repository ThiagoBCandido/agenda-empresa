import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CalendarioComponent } from './calendario/calendario.component';
import { AnotacoesComponent } from './anotacoes/anotacoes.component';
import { ConcluidosComponent } from './concluidos/concluidos.component';
import { LixeiraComponent } from './lixeira/lixeira.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ToastComponent } from './shared/toast/toast.component';
import { DeadlineAlertComponent } from './shared/deadline-alert/deadline-alert.component';
import { Priority } from './core/services/api-notes.service';
import { DeadlineAlertService } from './deadline-alert.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService, AppTheme } from './core/services/theme.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NoteBlock } from './core/services/api-notes.service';

type AppPage = 'principal' | 'concluidos' | 'lixeira' | 'perfil';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CalendarioComponent,
    AnotacoesComponent,
    ConcluidosComponent,
    LixeiraComponent,
    PerfilComponent,
    ToastComponent,
    DeadlineAlertComponent,
    LoginComponent,
    RegisterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  activeTab: 'calendario' | 'anotacoes' = 'calendario';
  activePage: AppPage = 'principal';
  showPriorityMenu = false;
  sidebarCollapsed = true;
  theme: AppTheme = 'dark';
  isAuthenticated = false;
  authMode: 'login' | 'register' = 'login';
  currentUserName = '';
  currentUserEmail = '';
  currentUserPhoto: string | null = null;
  sessionMessage = '';

  private userSub?: Subscription;
  private themeSub?: Subscription;
  private sessionMessageSub?: Subscription;

  @ViewChild('cal') cal!: CalendarioComponent;

  constructor(
    private deadlineAlertService: DeadlineAlertService,
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  openNoteFromAnnotations(note: NoteBlock) {
    this.activePage = 'principal';
    this.activeTab = 'calendario';

    setTimeout(() => {
      this.cal?.openEditModal(note);
    }, 0);
  }

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      this.theme = theme;
    });

    this.sessionMessageSub = this.authService.sessionMessage$.subscribe(message => {
      this.sessionMessage = message;
    });

    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUserName = user?.name ?? '';
      this.currentUserEmail = user?.email ?? '';
      this.currentUserPhoto = user?.profilePhoto ?? null;

      const notificationsEnabled = user?.notificationsEnabled ?? true;

      if (this.isAuthenticated && notificationsEnabled) {
        this.deadlineAlertService.start();
      } else {
        this.deadlineAlertService.stop();
      }
    });

    if (this.authService.getToken()) {
      this.syncCurrentUserFromBackend();
    }
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.themeSub?.unsubscribe();
    this.sessionMessageSub?.unsubscribe();
  }

  handleLoggedIn() {
    this.isAuthenticated = true;
    this.authMode = 'login';
    this.syncCurrentUserFromBackend();
  }

  handleRegistered() {
    this.isAuthenticated = true;
    this.authMode = 'login';
    this.syncCurrentUserFromBackend();
  }

  showRegister() {
    this.authMode = 'register';
  }

  showLogin() {
    this.authMode = 'login';
  }

  logout() {
    this.authService.logout();
    this.deadlineAlertService.stop();
    this.isAuthenticated = false;
    this.currentUserName = '';
    this.currentUserEmail = '';
    this.currentUserPhoto = null;
    this.activePage = 'principal';
    this.activeTab = 'calendario';
    this.authMode = 'login';
    this.showPriorityMenu = false;
  }

  setTab(tab: 'calendario' | 'anotacoes') {
    this.activeTab = tab;
    this.showPriorityMenu = false;
    this.activePage = 'principal';
  }

  setPage(page: AppPage) {
    this.activePage = page;
    this.showPriorityMenu = false;
    this.collapseSidebar();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;

    setTimeout(() => {
      this.cal?.animateCalendarResize(340);
    }, 0);
  }

  collapseSidebar() {
    if (this.sidebarCollapsed) return;

    this.sidebarCollapsed = true;

    setTimeout(() => {
      this.cal?.animateCalendarResize(340);
    }, 0);
  }

  togglePriorityMenu() {
    this.showPriorityMenu = !this.showPriorityMenu;
  }

  closePriorityMenu() {
    this.showPriorityMenu = false;
  }

  createNote(priority: Priority) {
    this.showPriorityMenu = false;
    this.activePage = 'principal';
    this.activeTab = 'calendario';

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;

    this.cal.openCreateModal(today, priority, true);
  }

  toggleCoverSide() {
    if (this.activePage !== 'principal') return;

    if (!this.sidebarCollapsed) {
      this.collapseSidebar();
      return;
    }

    this.activeTab = this.activeTab === 'calendario' ? 'anotacoes' : 'calendario';
  }

  toggleTheme() {
    const previousTheme = this.theme;
    const nextTheme: AppTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(nextTheme);

    if (!this.isAuthenticated) return;

    this.authService.updateThemePreference(nextTheme).subscribe({
      next: () => {},
      error: () => {
        this.themeService.setTheme(previousTheme);
      }
    });
  }

  themeIcon() {
    return this.theme === 'dark'
      ? '/assets/icons/icon-sun.png'
      : '/assets/icons/icon-moon.png';
  }

  themeAlt() {
    return this.theme === 'dark'
      ? 'Ativar modo claro'
      : 'Ativar modo escuro';
  }

  private syncCurrentUserFromBackend() {
    this.authService.refreshMe().subscribe({
      next: (data) => {
        if (data.preferredTheme) {
          this.themeService.setTheme(data.preferredTheme);
        }
      },
      error: () => {
        // o interceptor já cuida do logout limpo
      }
    });
  }
}