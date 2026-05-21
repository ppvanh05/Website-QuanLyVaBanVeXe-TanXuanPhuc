import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthModalService } from '../auth-modal.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<string>();

  phoneOrEmail = '';
  password = '';
  loginError = '';
  showPassword = false;

  constructor(private authModalService: AuthModalService) {}

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }
    this.getMockUsers(); // Auto-seeding mock database if empty
    const savedPhone = localStorage.getItem('last_registered_phone');
    const savedPassword = localStorage.getItem('last_registered_password');
    if (savedPhone) {
      this.phoneOrEmail = savedPhone;
    }
    if (savedPassword) {
      this.password = savedPassword;
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  getMockUsers(): any[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const usersJson = localStorage.getItem('mock_users');
    if (!usersJson) {
      const defaultUsers = [
        {
          phoneNumber: '0987654321',
          fullName: 'Nguyễn Văn An',
          email: 'an.nguyen@example.com',
          password: '123456'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersJson);
  }

  onLogin() {
    this.loginError = '';
    const credential = this.phoneOrEmail.trim();
    const pass = this.password;

    if (!credential) {
      this.loginError = 'Vui lòng nhập số điện thoại hoặc email.';
      return;
    }
    if (!pass) {
      this.loginError = 'Vui lòng nhập mật khẩu.';
      return;
    }

    const users = this.getMockUsers();
    const user = users.find(u => u.phoneNumber === credential || u.email === credential);

    if (!user) {
      this.loginError = 'Số điện thoại hoặc email chưa được đăng ký.';
      return;
    }

    if (user.password !== pass) {
      this.loginError = 'Mật khẩu không chính xác.';
      return;
    }

    this.authModalService.closeModal();
    this.loggedIn.emit(user.fullName);
  }

  closeModal() {
    this.authModalService.closeModal();
    this.close.emit();
  }

  openRegister(event: Event) {
    event.preventDefault();
    this.authModalService.openRegisterModal();
  }

  openForgot(event: Event) {
    event.preventDefault();
    this.authModalService.openForgotModal();
  }
}
