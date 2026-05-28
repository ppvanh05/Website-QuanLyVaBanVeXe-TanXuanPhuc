import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileApiService } from '../../../core/services/profile-api.service';

interface Order {
  maDonHang: string;
  soLuongVeDaDat: number;
  tenTuyenXe: string;
  ngayKhoiHanh: string;
  gioKhoiHanh: string;
  tongGiaVe: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy' | 'Chưa đánh giá' | 'Đã đánh giá';
  soDienThoai: string;
  departureDate?: string;
  tenTuyen?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTab = 'profile';
  isEditing = false;
  showOtpModal = false;
  showSuccessModal = false;
  isLogoutActive = false;
  
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
    fullName: '',
    phone: '',
    gender: '',
    email: '',
    dob: '',
    address: '',
    avatar: 'asset/images/customer/avatar_placeholder.png',
  };

  editUser = { ...this.user };
  isProfileLoading = false;

  // Filters state variables
  filterMaDonHang = '';
  filterThoiGianDat = '';
  filterTenTuyenXe = '';
  filterTrangThai = '';

  historyOrders: Order[] = [];
  filteredHistoryOrders: Order[] = [];
  isHistoryLoading = false;

  

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileApiService: ProfileApiService,
    private route: ActivatedRoute
  ) {
    this.authService.userName$.subscribe((name: string) => this.user.fullName = name);
  }

  ngOnInit(): void {
    this.loadProfile();

    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'history' || tab === 'password' || tab === 'profile') {
        this.activeTab = tab;
      } else {
        this.activeTab = 'profile';
      }

      if (this.activeTab === 'history') {
        this.loadHistory();
      }
    });
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
        if (status === 'Chờ thanh toán') {
          if (order.trangThaiDonHang !== 'Chờ thanh toán') return false;
        } else if (status === 'Chờ khởi hành') {
          if (order.trangThaiDonHang !== 'Chờ khởi hành') return false;
        } else if (status === 'Đã hoàn thành') {
          if (order.trangThaiDonHang !== 'Đã hoàn thành') return false;
        } else if (status === 'Đã hủy') {
          if (order.trangThaiDonHang !== 'Đã hủy') return false;
        } else if (status === 'Chưa đánh giá') {
          if (order.trangThaiDonHang !== 'Chưa đánh giá') return false;
        } else if (status === 'Đã đánh giá') {
          if (order.trangThaiDonHang !== 'Đã đánh giá') return false;
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

  loadProfile(): void {
    this.isProfileLoading = true;
    this.profileApiService.getProfile().subscribe({
      next: (response: any) => {
        const profile = response?.data || {};
        this.user = {
          fullName: profile.HoTenKhachHang || profile.hoTenKhachHang || '',
          phone: profile.SoDienThoai || profile.soDienThoai || '',
          gender: profile.GioiTinh || profile.gioiTinh || '',
          email: profile.Email || profile.email || '',
          dob: profile.NgaySinh ? new Date(profile.NgaySinh).toISOString().slice(0, 10) : '',
          address: profile.DiaChi || profile.diaChi || '',
          avatar: profile.AnhDaiDien || profile.anhDaiDien || 'asset/images/customer/avatar_placeholder.png',
        };
        this.editUser = { ...this.user };
        this.authService.setUserName(this.user.fullName || 'Khách hàng');
        this.isProfileLoading = false;
      },
      error: (err: any) => {
        console.error('Load profile error:', err);
        this.isProfileLoading = false;
      }
    });
  }

  loadHistory(): void {
    this.isHistoryLoading = true;
    this.historyOrders = [];
    this.filteredHistoryOrders = [];

    this.profileApiService.getHistory().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response?.data) ? response.data : [];
        this.historyOrders = data.map((order: any) => ({
          ...order,
          tenTuyenXe: order.tenTuyen || order.tenTuyenXe || '',
          ngayKhoiHanh: order.departureDate || order.ngayKhoiHanh || '',
        }));
        this.filteredHistoryOrders = [...this.historyOrders];
        this.isHistoryLoading = false;
      },
      error: (err: any) => {
        console.error('Load history error:', err);
        this.historyOrders = [];
        this.filteredHistoryOrders = [];
        this.isHistoryLoading = false;
      }
    });
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
    this.profileApiService.updateProfile({
      HoTenKhachHang: this.editUser.fullName,
      Email: this.editUser.email,
      GioiTinh: this.editUser.gender,
      NgaySinh: this.editUser.dob,
    }).subscribe({
      next: (response: any) => {
        this.user = { ...this.editUser };
        this.authService.setUserName(this.user.fullName || 'Khách hàng');
        this.isEditing = false;
      },
      error: (err: any) => {
        console.error('Save profile error:', err);
        this.isEditing = false;
      }
    });
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
      const changePasswordPayload = {
        MatKhauCu: this.passwords.current,
        MatKhauMoi: this.passwords.new,
        otp: otpCode,
      };
      console.log('Profile change-password payload:', changePasswordPayload);

      this.closeOtpModal();
      this.showSuccessModal = true;
      this.startRedirectTimer();
    } else {
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

  goToBooking() {
    this.router.navigate(['/tim-kiem-chuyen']);
  }

  logout() {
    this.isLogoutActive = true;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });

    if (tab === 'history') {
      this.loadHistory();
    }
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


