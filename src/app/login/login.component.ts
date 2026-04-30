import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;
  sessionMessage$ = this.authService.sessionMessage$;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/app');
    }
  }

  togglePassword() {
    if (this.loading) return;
    this.showPassword = !this.showPassword;
  }

  clearError() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  goToRegister() {
    if (this.loading) return;
    this.router.navigateByUrl('/register');
  }

  submit() {
    if (this.loading) return;

    this.errorMessage = '';

    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.errorMessage = 'Preencha e-mail e senha.';
      return;
    }

    this.loading = true;

    this.authService.login({email, password: this.password}).subscribe({next: () => {
        this.loading = false;
        this.router.navigateByUrl('/app');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Não foi possível realizar o login.';
      }
    });
  }
}