import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
  isLoggedIn = false; // Mặc định chưa đăng nhập
  userName = 'Nguyễn Văn An';

  constructor(
    private eRef: ElementRef,
    private router: Router
  ) {}

  login() {
    this.isLoggedIn = true;
    this.router.navigate(['/home']);
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
