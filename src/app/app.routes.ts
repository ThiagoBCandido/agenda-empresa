import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppComponent } from './app.component';
import { AppShellComponent } from './app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: AppComponent
  },
  {
    path: 'register',
    component: AppComponent
  },
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];