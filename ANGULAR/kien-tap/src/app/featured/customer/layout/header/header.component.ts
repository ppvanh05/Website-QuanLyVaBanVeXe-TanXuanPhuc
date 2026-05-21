import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ForgotPasswordComponent } from '../../auth/forgot-password/forgot-password.component';
import { AuthModalService, AuthModalMode } from '../../auth/auth-modal.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent, RegisterComponent, ForgotPasswordComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isIntroDropdownOpen = false;
  isUserDropdownOpen = false;
  isLoggedIn = false; // Mặc định chưa đăng nhập
  userName = 'Nguyễn Văn An';
  modalMode: AuthModalMode = null;

  constructor(
    private eRef: ElementRef,
    private router: Router,
    private authModalService: AuthModalService
  ) {
    this.authModalService.modalMode$.subscribe(mode => {
      this.modalMode = mode;
    });
  }

  login() {
    this.authModalService.openLoginModal();
  }

  closeModal() {
    this.authModalService.closeModal();
  }

  handleRegistered(name: string) {
    this.userName = name || 'Người dùng';
    this.isLoggedIn = true;
    this.closeModal();
  }

  handleLoggedIn(name: string) {
    this.userName = name || 'Người dùng';
    this.isLoggedIn = true;
    this.closeModal();
  }

  isIntroActive(): boolean {
    return this.router.url.startsWith('/gioi-thieu');
  }

  toggleIntroDropdown(event: Event) {
    event.stopPropagation();
    this.isIntroDropdownOpen = !this.isIntroDropdownOpen;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isIntroDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeIntroDropdown();
      this.isUserDropdownOpen = false;
    }
  }

  closeIntroDropdown() {
    this.isIntroDropdownOpen = false;
  }

  logout() {
    this.isLoggedIn = false;
    this.isUserDropdownOpen = false;
    this.router.navigate(['/home']);
  }
}
