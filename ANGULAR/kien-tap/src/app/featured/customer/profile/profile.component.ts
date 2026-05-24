import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

interface Order {
  maDonHang: string;
  soLuongVeDaDat: number;
  tenTuyenXe: string;
  ngayKhoiHanh: string;
  gioKhoiHanh: string;
  tongGiaVe: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: 'Chá» thanh toÃ¡n' | 'Chá» khá»Ÿi hÃ nh' | 'ÄÃ£ hoÃ n thÃ nh' | 'ÄÃ£ há»§y' | 'ChÆ°a Ä‘Ã¡nh giÃ¡' | 'ÄÃ£ Ä‘Ã¡nh giÃ¡';
  soDienThoai: string;
}

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
    fullName: 'Nguyá»…n VÄƒn An',
    phone: '090 123 4567',
    gender: 'Nam',
    email: 'vanan.nguyen@email.com',
    dob: '1992-05-15',
    address: '123 ÄÆ°á»ng LÃª Lá»£i, Quáº­n 1, TP. Há»“ ChÃ­ Minh',
    avatar: 'asset/images/customer/avatar_placeholder.png'
  };

  editUser = { ...this.user };

  // Filters state variables
  filterMaDonHang = '';
  filterThoiGianDat = '';
  filterTenTuyenXe = '';
  filterTrangThai = '';

  // Mock booking history records
  historyOrders = [
    {
      maDonHang: 'P5UOLWB8',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Tay',
      ngayKhoiHanh: '21-05-2026',
      gioKhoiHanh: '00:00',
      tongGiaVe: 260000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'ÄÃ£ hoÃ n thÃ nh',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5ULATI1',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Tay',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '17:30',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'Momo',
      trangThaiDonHang: 'ÄÃ£ hoÃ n thÃ nh',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5IMBT0V',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Dong moi',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '23:05',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'ÄÃ£ hoÃ n thÃ nh',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5IOCBZB',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Dong moi',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '23:05',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'unknown',
      trangThaiDonHang: 'Chá» thanh toÃ¡n',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5ITF2W9',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Da Lat - Mien Dong moi',
      ngayKhoiHanh: '03-05-2026',
      gioKhoiHanh: '23:05',
      tongGiaVe: 364000,
      phuongThucThanhToan: 'unknown',
      trangThaiDonHang: 'ÄÃ£ há»§y',
      soDienThoai: '0901234567'
    },
    {
      maDonHang: 'P5CDWE67',
      soLuongVeDaDat: 1,
      tenTuyenXe: 'Mien Dong moi - Da Lat',
      ngayKhoiHanh: '24-04-2026',
      gioKhoiHanh: '22:25',
      tongGiaVe: 260000,
      phuongThucThanhToan: 'MoMo',
      trangThaiDonHang: 'ÄÃ£ hoÃ n thÃ nh',
      soDienThoai: '0333555412'
    },
    {
      maDonHang: 'P5CDWE88',
      soLuongVeDaDat: 2,
      tenTuyenXe: 'Báº¿n xe Miá»n TÃ¢y - Báº¿n xe Quy NhÆ¡n',
      ngayKhoiHanh: '22-05-2026',
      gioKhoiHanh: '18:00',
      tongGiaVe: 800000,
      phuongThucThanhToan: 'VietQR / Napas',
      trangThaiDonHang: 'ÄÃ£ hoÃ n thÃ nh',
      soDienThoai: '0981939379'
    }
  ];

  filteredHistoryOrders = [...this.historyOrders];

  

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.userName$.subscribe((name: string) => this.user.fullName = name);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
  }

  // Filter history logic
  searchHistory(): void {
    const code = this.filterMaDonHang.trim().toUpperCase();
    const date = this.filterThoiGianDat; // Format YYYY-MM-DD
    const route = this.filterTenTuyenXe.trim().toLowerCase();
    const status = this.filterTrangThai;

    this.filteredHistoryOrders = this.historyOrders.filter(order => {
      // 1. Check Code matching
      if (code && !order.maDonHang.toUpperCase().includes(code)) return false;

      // 2. Check Date matching (convert order date DD-MM-YYYY to YYYY-MM-DD)
      if (date) {
        const parts = order.ngayKhoiHanh.split('-');
        if (parts.length === 3) {
          const orderDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
          if (orderDateStr !== date) return false;
        }
      }

      // 3. Check Route matching
      if (route && !order.tenTuyenXe.toLowerCase().includes(route)) return false;

      // 4. Check Status matching
      if (status) {
        if (status === 'Chá» thanh toÃ¡n') {
          if (order.trangThaiDonHang !== 'Chá» thanh toÃ¡n') return false;
        } else if (status === 'Chá» khá»Ÿi hÃ nh') {
          if (order.trangThaiDonHang !== 'Chá» khá»Ÿi hÃ nh') return false;
        } else if (status === 'ÄÃ£ hoÃ n thÃ nh') {
          if (order.trangThaiDonHang !== 'ÄÃ£ hoÃ n thÃ nh') return false;
        } else if (status === 'ÄÃ£ há»§y') {
          if (order.trangThaiDonHang !== 'ÄÃ£ há»§y') return false;
        } else if (status === 'ChÆ°a Ä‘Ã¡nh giÃ¡') {
          if (order.trangThaiDonHang !== 'ChÆ°a Ä‘Ã¡nh giÃ¡') return false;
        } else if (status === 'ÄÃ£ Ä‘Ã¡nh giÃ¡') {
          if (order.trangThaiDonHang !== 'ÄÃ£ Ä‘Ã¡nh giÃ¡') return false;
        }
      }

      return true;
    });
  }

  resetHistoryFilter(): void {
    this.filterMaDonHang = '';
    this.filterThoiGianDat = '';
    this.filterTenTuyenXe = '';
    this.filterTrangThai = '';
    this.searchHistory();
  }

  // Go to ticket detail
  viewTicketDetail(order: any): void {
    this.router.navigate(['/tra-cuu-ve'], {
      queryParams: {
        phone: order.soDienThoai,
        code: order.maDonHang
      }
    });
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
    if (otpCode.length === 6) {
      this.closeOtpModal();
      this.showSuccessModal = true;
      this.startRedirectTimer();
    } else {
      console.log('Vui lÃ²ng nháº­p Ä‘á»§ 6 sá»‘ OTP');
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

  goToBooking() {
    this.router.navigate(['/tim-kiem-chuyen']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'bg-success-light': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'text-success-text': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'bg-danger-light': status === 'Đã hủy',
      'text-danger-text': status === 'Đã hủy',
      'bg-info-light': status === 'Chờ thanh toán',
      'text-info-text': status === 'Chờ thanh toán',
      'bg-warning-light': status === 'Chờ khởi hành',
      'text-warning-text': status === 'Chờ khởi hành',
    };
  }
}


