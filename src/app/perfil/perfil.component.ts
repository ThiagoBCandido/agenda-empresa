import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, UpdateProfileRequest, ChangePasswordRequest, AuthMeResponse } from '../core/services/auth.service';
import { ThemeService, AppTheme } from '../core/services/theme.service';

type TimeZoneOption = {
  value: string;
  label: string;
};

const TIME_ZONE_OPTIONS: TimeZoneOption[] = [
  { value: 'America/Sao_Paulo', label: 'Brasil - São Paulo (GMT-3)' },
  { value: 'America/Manaus', label: 'Brasil - Manaus (GMT-4)' },
  { value: 'America/Cuiaba', label: 'Brasil - Cuiabá (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Brasil - Rio Branco (GMT-5)' },
  { value: 'America/Noronha', label: 'Brasil - Fernando de Noronha (GMT-2)' },
  { value: 'America/New_York', label: 'EUA - Nova York' },
  { value: 'America/Chicago', label: 'EUA - Chicago' },
  { value: 'America/Denver', label: 'EUA - Denver' },
  { value: 'America/Los_Angeles', label: 'EUA - Los Angeles' },
  { value: 'Europe/London', label: 'Reino Unido - Londres' },
  { value: 'Europe/Paris', label: 'Europa - Paris' },
  { value: 'Europe/Lisbon', label: 'Portugal - Lisboa' },
  { value: 'Asia/Tokyo', label: 'Japão - Tóquio' }
];

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private themeSub?: Subscription;

  userName = '';
  userEmail = '';
  userRole = '';
  jobTitle = 'Colaborador';
  timeZone = 'America/Sao_Paulo';
  notificationsEnabled = true;
  preferredTheme: AppTheme = 'dark';
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editMode = false;
  formName = '';
  formEmail = '';
  formJobTitle = 'Colaborador';
  formTimeZone = 'America/Sao_Paulo';
  formNotificationsEnabled = true;
  formPreferredTheme: AppTheme = 'dark';
  passwordEditMode = false;
  passwordSaving = false;
  passwordErrorMessage = '';
  passwordSuccessMessage = '';
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;
  profilePhoto: string | null = null;
  cropModalOpen = false;
  imageToCrop: string | null = null;
  cropZoom = 1;
  cropOffsetX = 0;
  cropOffsetY = 0;
  cropBaseWidth = 0;
  cropBaseHeight = 0;

  private readonly previewSize = 280;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOriginX = 0;
  private dragOriginY = 0;
  timeZoneOptions = TIME_ZONE_OPTIONS;

  ngOnInit() {
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      if (this.editMode) {
        this.formPreferredTheme = theme;
      } else {
        this.preferredTheme = theme;
      }
    });

    this.loadProfile();
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
  }

  get displayedTimeZoneLabel(): string {
    return this.timeZoneOptions.find(tz => tz.value === this.timeZone)?.label ?? this.timeZone;
  }

  get userInitial(): string {
    return (this.userName?.trim()?.charAt(0) || 'U').toUpperCase();
  }

  get cropImageTransform(): string {
    return `translate(${this.cropOffsetX}px, ${this.cropOffsetY}px) scale(${this.cropZoom})`;
  }

  get notificationsLabel(): string {
    return this.notificationsEnabled ? 'Ativadas' : 'Desativadas';
  }

  get themeLabel(): string {
    return this.preferredTheme === 'light' ? 'Claro' : 'Escuro';
  }

  loadProfile() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.refreshMe().subscribe({
      next: (data: AuthMeResponse) => {
        this.applyProfileData(data);
        this.loading = false;
      },
      error: (err: any) => {
        const storedUser = this.authService.getCurrentUser();
        this.userName = storedUser?.name || 'Usuário';
        this.userEmail = storedUser?.email || 'usuario@empresa.com';
        this.userRole = this.mapRole(storedUser?.role || 'USER');
        this.jobTitle = storedUser?.jobTitle || 'Colaborador';
        this.timeZone = storedUser?.timeZone || 'America/Sao_Paulo';
        this.notificationsEnabled = storedUser?.notificationsEnabled ?? true;
        this.preferredTheme = this.normalizeTheme(storedUser?.preferredTheme);
        this.profilePhoto = storedUser?.profilePhoto ?? null;
        this.formName = this.userName;
        this.formEmail = this.userEmail;
        this.formJobTitle = this.jobTitle;
        this.formTimeZone = this.timeZone;
        this.formNotificationsEnabled = this.notificationsEnabled;
        this.formPreferredTheme = this.preferredTheme;
        this.errorMessage = err?.error?.message || 'Não foi possível carregar os dados do perfil.';
        this.loading = false;
      }
    });
  }

  startEdit() {
    this.successMessage = '';
    this.errorMessage = '';
    this.editMode = true;
    this.formName = this.userName;
    this.formEmail = this.userEmail;
    this.formJobTitle = this.jobTitle;
    this.formTimeZone = this.timeZone;
    this.formNotificationsEnabled = this.notificationsEnabled;
    this.formPreferredTheme = this.preferredTheme;
  }

  cancelEdit() {
    this.editMode = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.formName = this.userName;
    this.formEmail = this.userEmail;
    this.formJobTitle = this.jobTitle;
    this.formTimeZone = this.timeZone;
    this.formNotificationsEnabled = this.notificationsEnabled;
    this.formPreferredTheme = this.preferredTheme;
    this.themeService.setTheme(this.preferredTheme);
  }

  saveProfile() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.formName.trim() || !this.formEmail.trim()) {
      this.errorMessage = 'Preencha nome e e-mail.';
      return;
    }

    this.saving = true;

    const payload: UpdateProfileRequest = {
      name: this.formName.trim(),
      email: this.formEmail.trim(),
      jobTitle: this.formJobTitle.trim() || 'Colaborador',
      timeZone: this.formTimeZone.trim() || 'America/Sao_Paulo',
      notificationsEnabled: this.formNotificationsEnabled,
      preferredTheme: this.formPreferredTheme
    };

    this.authService.updateProfile(payload).subscribe({
      next: (response: AuthMeResponse) => {
        this.applyProfileData(response);
        this.editMode = false;
        this.saving = false;
        this.successMessage = 'Perfil atualizado com sucesso.';
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMessage =
          err?.error?.message || 'Não foi possível atualizar o perfil.';
      }
    });
  }

  toggleNotificationsSwitch() {
    this.formNotificationsEnabled = !this.formNotificationsEnabled;
  }

  toggleThemeSwitch() {
    const nextTheme: AppTheme = this.formPreferredTheme === 'dark' ? 'light' : 'dark';
    this.formPreferredTheme = nextTheme;
    this.themeService.setTheme(nextTheme);
  }

  startPasswordEdit() {
    this.passwordEditMode = true;
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';
    this.clearPasswordForm();
  }

  cancelPasswordEdit() {
    this.passwordEditMode = false;
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';
    this.clearPasswordForm();
  }

  savePassword() {
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    if (!this.currentPassword.trim() || !this.newPassword.trim() || !this.confirmNewPassword.trim()) {
      this.passwordErrorMessage = 'Preencha todos os campos da senha.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMessage = 'A nova senha deve ter pelo menos 6 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordErrorMessage = 'A confirmação da nova senha não confere.';
      return;
    }

    const payload: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.passwordSaving = true;

    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.passwordSaving = false;
        this.passwordEditMode = false;
        this.passwordSuccessMessage = response.message || 'Senha atualizada com sucesso.';
        this.clearPasswordForm();
      },
      error: (err: any) => {
        this.passwordSaving = false;
        this.passwordErrorMessage = err?.error?.message || 'Não foi possível alterar a senha.';
      }
    });
  }

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmNewPassword() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  private clearPasswordForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmNewPassword = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.prepareCropper(reader.result);
      }
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  private prepareCropper(src: string) {
    const img = new Image();
    img.onload = () => {
      const baseScale = Math.max(
        this.previewSize / img.width,
        this.previewSize / img.height
      );

      this.cropBaseWidth = img.width * baseScale;
      this.cropBaseHeight = img.height * baseScale;
      this.imageToCrop = src;
      this.cropZoom = 1;
      this.cropOffsetX = 0;
      this.cropOffsetY = 0;
      this.cropModalOpen = true;
      this.clampOffsets();
    };

    img.src = src;
  }

  startDrag(event: MouseEvent | TouchEvent) {
    if (!this.imageToCrop) return;

    this.isDragging = true;
    const point = this.getPoint(event);
    this.dragStartX = point.x;
    this.dragStartY = point.y;
    this.dragOriginX = this.cropOffsetX;
    this.dragOriginY = this.cropOffsetY;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.cropOffsetX = this.dragOriginX + (event.clientX - this.dragStartX);
    this.cropOffsetY = this.dragOriginY + (event.clientY - this.dragStartY);
    this.clampOffsets();
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    const point = this.getPoint(event);
    this.cropOffsetX = this.dragOriginX + (point.x - this.dragStartX);
    this.cropOffsetY = this.dragOriginY + (point.y - this.dragStartY);
    this.clampOffsets();
    event.preventDefault();
  }

  @HostListener('document:touchend')
  onTouchEnd() {
    this.isDragging = false;
  }

  onZoomChange() {
    this.clampOffsets();
  }

  closeCropModal() {
    this.cropModalOpen = false;
    this.imageToCrop = null;
    this.cropZoom = 1;
    this.cropOffsetX = 0;
    this.cropOffsetY = 0;
    this.cropBaseWidth = 0;
    this.cropBaseHeight = 0;
    this.isDragging = false;
  }

  saveCroppedPhoto() {
    if (!this.imageToCrop) return;
    this.errorMessage = '';
    this.successMessage = '';
    const img = new Image();

    img.onload = () => {
      const outputSize = 320;
      const outputScale = outputSize / this.previewSize;
      const drawWidth = this.cropBaseWidth * this.cropZoom;
      const drawHeight = this.cropBaseHeight * this.cropZoom;
      const drawX = (this.previewSize - drawWidth) / 2 + this.cropOffsetX;
      const drawY = (this.previewSize - drawHeight) / 2 + this.cropOffsetY;
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, outputSize, outputSize);
      ctx.save();
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, drawX * outputScale, drawY * outputScale, drawWidth * outputScale, drawHeight * outputScale);
      ctx.restore();

      const finalImage = canvas.toDataURL('image/svg');
      this.authService.updateProfilePhoto({ profilePhoto: finalImage }).subscribe({
        next: (data) => {
          this.profilePhoto = data.profilePhoto ?? null;
          this.successMessage = 'Foto de perfil atualizada com sucesso.';
          this.closeCropModal();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Não foi possível atualizar a foto de perfil.';
        }
      });
    };
    img.src = this.imageToCrop;
  }

  removePhoto() {
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.updateProfilePhoto({ profilePhoto: null }).subscribe({next: (data) => {
        this.profilePhoto = data.profilePhoto ?? null;
        this.successMessage = 'Foto removida com sucesso.';
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Não foi possível remover a foto.';
      }
    });
  }

  private clampOffsets() {
    const drawWidth = this.cropBaseWidth * this.cropZoom;
    const drawHeight = this.cropBaseHeight * this.cropZoom;
    const maxX = Math.max(0, (drawWidth - this.previewSize) / 2);
    const maxY = Math.max(0, (drawHeight - this.previewSize) / 2);
    this.cropOffsetX = Math.min(maxX, Math.max(-maxX, this.cropOffsetX));
    this.cropOffsetY = Math.min(maxY, Math.max(-maxY, this.cropOffsetY));
  }

  private getPoint(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    }

    const touch = event.touches[0] || event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }

  private mapRole(role: string): string {
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'USER') return 'Colaborador';
    
    return 'Colaborador';
  }

  private normalizeTheme(value: string | null | undefined): AppTheme {
    return value === 'light' ? 'light' : 'dark';
  }

  private applyProfileData(data: AuthMeResponse) {
    this.userName = data.name || 'Usuário';
    this.userEmail = data.email || 'usuario@empresa.com';
    this.userRole = this.mapRole(data.role);
    this.jobTitle = data.jobTitle || 'Colaborador';
    this.timeZone = data.timeZone || 'America/Sao_Paulo';
    this.notificationsEnabled = data.notificationsEnabled ?? true;
    this.preferredTheme = this.normalizeTheme(data.preferredTheme);
    this.profilePhoto = data.profilePhoto ?? null;
    this.formName = this.userName;
    this.formEmail = this.userEmail;
    this.formJobTitle = this.jobTitle;
    this.formTimeZone = this.timeZone;
    this.formNotificationsEnabled = this.notificationsEnabled;
    this.formPreferredTheme = this.preferredTheme;
    this.themeService.setTheme(this.preferredTheme);
  }
}