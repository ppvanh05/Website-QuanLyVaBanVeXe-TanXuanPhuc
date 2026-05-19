import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnDestroy {
  activeTab = 'profile';
  isEditing = false;
  showOtpModal = false;
  showSuccessModal = false;
  
  // Password Visibility
  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  // Password fields
  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  // OTP
  otpInputs = [
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' }
  ];
  otpTimer = 90; // 01:30
  timerInterval: any;

  // Success Redirect
  redirectTimer = 3;
  redirectInterval: any;

  user = {
    fullName: 'Nguyễn Văn An',
    phone: '090 123 4567',
    gender: 'Nam',
    email: 'vanan.nguyen@email.com',
    dob: '1992-05-15',
    address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    avatar: 'asset/images/customer/avatar_placeholder.png'
  };

  editUser = { ...this.user };

  constructor(private router: Router) {}

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
  }

  startEdit() {
    this.editUser = { ...this.user };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveProfile() {
    this.user = { ...this.editUser };
    this.isEditing = false;
  }

  confirmChangePassword() {
    // Giả lập mở modal OTP sau khi nhấn xác nhận đổi mật khẩu
    this.showOtpModal = true;
    this.startOtpTimer();
  }

  startOtpTimer() {
    this.otpTimer = 90;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}s`;
  }

  closeOtpModal() {
    this.showOtpModal = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  verifyOtp() {
    const otpCode = this.otpInputs.map(i => i.value).join('');
    // Để demo dễ dàng, tui sẽ cho qua luôn nếu nhập đủ 6 ký tự
    if (otpCode.length === 6) {
      this.closeOtpModal();
      this.showSuccessModal = true;
      this.startRedirectTimer();
    } else {
      // Nếu chưa nhập đủ 6 số thì báo nhẹ để user biết
      console.log('Vui lòng nhập đủ 6 số OTP');
    }
  }

  startRedirectTimer() {
    this.redirectTimer = 3;
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.redirectInterval = setInterval(() => {
      if (this.redirectTimer > 1) {
        this.redirectTimer--;
      } else {
        this.goToLogin();
      }
    }, 1000);
  }

  goToLogin() {
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.showSuccessModal = false;
    this.passwords = { current: '', new: '', confirm: '' };
    this.router.navigate(['/login']);
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value;
    if (value && index < 5) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
  }
}
