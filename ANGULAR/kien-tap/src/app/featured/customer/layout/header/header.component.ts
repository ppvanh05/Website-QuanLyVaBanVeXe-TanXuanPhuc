import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isIntroDropdownOpen = false;
  isUserDropdownOpen = false;
  isLoggedIn = false;
  userName = '';

  constructor(
    private eRef: ElementRef,
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.authService.userName$.subscribe(name => this.userName = name);
  }

  login() {
    this.authService.login();
    // Không chuyển trang để user thấy ngay sự thay đổi tại chỗ
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
    this.authService.logout();
    this.isUserDropdownOpen = false;
    this.router.navigate(['/home']);
  }
}
