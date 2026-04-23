import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);

  @Output() loggedIn = new EventEmitter<void>();
  @Output() goToRegister = new EventEmitter<void>();

  email = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Preencha e-mail e senha.';
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.loggedIn.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Não foi possível realizar o login.';
      }
    });
  }
}