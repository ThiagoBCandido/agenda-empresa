import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/app');
    }
  }

  togglePassword() {
    if (this.loading) return;
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    if (this.loading) return;
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  goToLogin() {
    if (this.loading) return;
    this.router.navigateByUrl('/login');
  }

  submit() {
    if (this.loading) return;

    this.errorMessage = '';

    const name = this.name.trim();
    const email = this.email.trim();
    const password = this.password.trim();
    const confirmPassword = this.confirmPassword.trim();

    if (!name || !email || !password || !confirmPassword) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas estão diferentes.';
      return;
    }

    this.loading = true;

    this.authService.register({
      name,
      email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/app');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Impossível realizar o cadastro.';
      }
    });
  }
}