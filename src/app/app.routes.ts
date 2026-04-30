import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login'},
  {path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
  {path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)},
  {path: 'app', loadComponent: () => import('./app-shell/app-shell.component').then(m => m.AppShellComponent), canActivate: [authGuard]},
  {path: '**', redirectTo: 'login'}
];