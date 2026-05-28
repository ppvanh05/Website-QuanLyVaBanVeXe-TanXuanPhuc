import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileApiService } from '../../../core/services/profile-api.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Order {
  maDonHang: string;
  soLuongVeDaDat: number;
  tenTuyenXe: string;
  ngayKhoiHanh: string;
  gioKhoiHanh: string;
  tongGiaVe: number;
  phuongThucThanhToan?: string;
  trangThaiDonHang: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã xác nhận' | 'Đã hoàn thành' | 'Đã hủy' | 'Chưa đánh giá' | 'Đã đánh giá';
  soDienThoai: string;
  departureDate?: string;
  tenTuyen?: string;
  maVe?: string;
  formattedNgayDi?: string;
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

  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  passwords = { current: '', new: '', confirm: '' };

  otpInputs = [
    { value: '' }, { value: '' }, { value: '' },
    { value: '' }, { value: '' }, { value: '' }
  ];
  otpTimer = 90;
  timerInterval: any;

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
  } as any;

  // Validation / template helpers
  AnhDaiDienError: string = '';
  HoTenKhachHangError: string = '';
  EmailError: string = '';
  NgaySinhError: string = '';
  isFormValid = true;

  editUser = { ...this.user } as any;
  isProfileLoading = false;

  filterMaDonHang = '';
  filterThoiGianDat = '';
  filterTenTuyenXe = '';
  filterTrangThai = '';

  historyOrders: Order[] = [];
  filteredHistoryOrders: Order[] = [];
  isHistoryLoading = false;

  currentUserId = '';
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  maDonHangSubject = new Subject<string>();
  tuyenXeSubject = new Subject<string>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileApiService: ProfileApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.user = {
          fullName: user.HoTenKhachHang || '',
          phone: user.SoDienThoai || '',
          gender: user.GioiTinh || '',
          email: user.Email || '',
          dob: user.NgaySinh ? new Date(user.NgaySinh).toISOString().slice(0, 10) : '',
          address: user.DiaChi || '',
          avatar: user.AnhDaiDien || 'asset/images/customer/avatar_placeholder.png',
          MaKhachHang: user.MaKhachHang,
          HoTenKhachHang: user.HoTenKhachHang,
          SoDienThoai: user.SoDienThoai,
          Email: user.Email,
          AnhDaiDien: user.AnhDaiDien || 'asset/images/customer/user.png',
          GioiTinh: user.GioiTinh,
          NgaySinh: user.NgaySinh,
          TrangThaiTaiKhoan: user.TrangThaiTaiKhoan,
        };
        this.editUser = { ...this.user };
      }
    });
  }

  ngOnInit(): void {
    this.loadProfile();

    this.maDonHangSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.ngZone.run(() => {
        this.filterMaDonHang = value;
        this.currentPage = 1;
        this.loadHistoryFromApi();
      });
    });

    this.tuyenXeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.ngZone.run(() => {
        this.filterTenTuyenXe = value;
        this.currentPage = 1;
        this.loadHistoryFromApi();
      });
    });

    this.route.queryParamMap.subscribe(params => {
      this.ngZone.run(() => {
        const tab = params.get('tab');
        if (tab === 'history' || tab === 'password' || tab === 'profile') {
          this.activeTab = tab;
        } else {
          this.activeTab = 'profile';
        }
        
        // Force immediate change detection to switch views instantly
        this.cdr.detectChanges();

        if (this.activeTab === 'history') {
          if (!this.isHistoryLoading) {
            this.loadHistory();
          }
        } else {
          this.stopHistoryPolling();
        }
      });
    });

    // If user logs in after opening this page, and the history tab is active,
    // load history when login state becomes true.
    this.authService.isLoggedIn$.subscribe(logged => {
      this.ngZone.run(() => {
        if (logged && this.activeTab === 'history' && this.filteredHistoryOrders.length === 0 && !this.isHistoryLoading) {
          console.log('User logged in and history tab active — loading history');
          this.loadHistory();
        } else {
          this.cdr.detectChanges();
        }
      });
    });

    // Redundant currentUser$ subscription removed to prevent infinite recursive profile-fetching loops
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.stopHistoryPolling();
  }

  loadProfile(): void {
    this.isProfileLoading = true;
    this.profileApiService.getProfile().subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          const profile = response?.data || {};
          this.currentUserId = profile.MaKhachHang || profile.maKhachHang || '';
          this.user = {
            fullName: profile.HoTenKhachHang || profile.hoTenKhachHang || '',
            phone: profile.SoDienThoai || profile.soDienThoai || '',
            gender: profile.GioiTinh || profile.gioiTinh || '',
            email: profile.Email || profile.email || '',
            dob: profile.NgaySinh ? new Date(profile.NgaySinh).toISOString().slice(0, 10) : '',
            address: profile.DiaChi || profile.diaChi || '',
            avatar: profile.AnhDaiDien || profile.anhDaiDien || 'asset/images/customer/avatar_placeholder.png',
            MaKhachHang: profile.MaKhachHang,
            HoTenKhachHang: profile.HoTenKhachHang,
            SoDienThoai: profile.SoDienThoai,
            Email: profile.Email,
            AnhDaiDien: profile.AnhDaiDien || profile.anhDaiDien || 'asset/images/customer/user.png',
            GioiTinh: profile.GioiTinh,
            NgaySinh: profile.NgaySinh,
            TrangThaiTaiKhoan: profile.TrangThaiTaiKhoan,
          } as any;
          this.editUser = { ...this.user };
          const cur = this.authService.getCurrentUser() || {};
          this.authService.setCurrentUser({ ...(cur as any), HoTenKhachHang: this.user.fullName || (cur as any).HoTenKhachHang || 'Khách hàng' });
          this.isProfileLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Load profile error:', err);
          this.isProfileLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  normalizeString(str: string): string {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '');
  }

  loadHistory(): void {
    this.currentPage = 1;
    this.loadHistoryFromApi();
    this.startHistoryPolling();
  }

  onMaVeChange(val: string): void { this.maDonHangSubject.next(val); }
  onTuyenXeChange(val: string): void { this.tuyenXeSubject.next(val); }
  onFilterChange(): void { this.currentPage = 1; this.loadHistoryFromApi(); }
  searchHistory(): void { this.currentPage = 1; this.loadHistoryFromApi(); }

  resetHistoryFilter(): void {
    this.filterMaDonHang = '';
    this.filterThoiGianDat = '';
    this.filterTenTuyenXe = '';
    this.filterTrangThai = '';
    this.currentPage = 1;
    this.loadHistoryFromApi();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadHistoryFromApi();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pages(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages; i++) arr.push(i);
    return arr;
  }

  // ===== HÀM CHÍNH: Gọi backend API (KHÔNG dùng Supabase) =====
  loadHistoryFromApi(): void {
    this.isHistoryLoading = true;
    this.filteredHistoryOrders = [];

    this.profileApiService.getHistory().subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          let orders = Array.isArray(response?.data) ? response.data : [];

          // Lọc theo mã đơn hàng (maDonHang)
          if (this.filterMaDonHang.trim()) {
            const q = this.filterMaDonHang.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.maDonHang || '').toLowerCase().includes(q)
            );
          }

          // Lọc theo tuyến đường
          if (this.filterTenTuyenXe.trim()) {
            const q = this.filterTenTuyenXe.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.tenTuyen || '').toLowerCase().includes(q)
            );
          }

          // Lọc theo ngày đi (departureDate dạng YYYY-MM-DD)
          if (this.filterThoiGianDat) {
            orders = orders.filter((o: any) =>
              o.departureDate === this.filterThoiGianDat
            );
          }

          // Lọc theo trạng thái
          if (this.filterTrangThai) {
            const targetStatus = this.normalizeString(this.filterTrangThai);
            orders = orders.filter((o: any) =>
              this.normalizeString(o.trangThaiDonHang) === targetStatus
            );
          }

          // Sắp xếp mã đơn hàng mới nhất lên đầu
          orders.sort((a: any, b: any) =>
            (b.maDonHang || '').localeCompare(a.maDonHang || '')
          );

          this.totalItems = orders.length;

          // Phân trang
          const from = (this.currentPage - 1) * this.pageSize;
          const paged = orders.slice(from, from + this.pageSize);

          this.filteredHistoryOrders = paged.map((o: any) => {
            // Format ngày giờ: "HH:mm DD-MM-YYYY"
            let formattedNgayDi = '';
            if (o.gioKhoiHanh && o.departureDate) {
              const [y, m, d] = o.departureDate.split('-');
              formattedNgayDi = `${o.gioKhoiHanh} ${d}-${m}-${y}`;
            }

            // Chuẩn hóa trạng thái
            const rawStatus = (o.trangThaiDonHang || '').toString();
            let displayStatus = 'Chờ thanh toán';
            const s = rawStatus.toLowerCase();
            if (s.includes('chothanhtoan') || s.includes('cho_thanh_toan') || s.includes('cho_thanhtoan') || s.includes('cho thanh toan') || s.includes('cho thanhtoan') || s === 'chờ thanh toán') {
              displayStatus = 'Chờ thanh toán';
            } else if (s.includes('chokhoihanh') || s.includes('cho_khoi_hanh') || s.includes('cho khoi hanh') || s.includes('chờ khởi hành') || s.includes('cho khoihanh') || s === 'chờ khởi hành') {
              displayStatus = 'Chờ khởi hành';
            } else if (s.includes('dahoanthanh') || s.includes('da_hoan_thanh') || s.includes('da hoàn thành') || s.includes('da hoan thanh') || s === 'đã hoàn thành') {
              displayStatus = 'Đã hoàn thành';
            } else if (s.includes('dadanhgia') || s.includes('da_danh_gia') || s.includes('đã đánh giá') || s.includes('da danh gia') || s === 'đã đánh giá') {
              displayStatus = 'Đã đánh giá';
            } else if (s.includes('dahuy') || s.includes('da_huy') || s.includes('đã hủy') || s.includes('da huy') || s === 'đã hủy') {
              displayStatus = 'Đã hủy';
            }

            return {
              maDonHang: o.maDonHang,
              soLuongVeDaDat: o.soLuongVeDaDat || 1,
              tenTuyenXe: o.tenTuyen || '',
              gioKhoiHanh: o.gioKhoiHanh || '',
              ngayKhoiHanh: o.departureDate || '',
              formattedNgayDi,
              tongGiaVe: o.tongGiaVe || 0,
              trangThaiDonHang: displayStatus as any,
              soDienThoai: o.soDienThoai || this.user.phone
            };
          });

          this.isHistoryLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Load history error:', err);
          this.filteredHistoryOrders = [];
          this.totalItems = 0;
          this.isHistoryLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  viewTicketDetail(order: any): void {
    this.router.navigate(['/tra-cuu-ve'], {
      queryParams: {
        soDienThoai: order.soDienThoai,
        maDonHang: order.maDonHang
      }
    });
  }

  startEdit() { this.editUser = { ...this.user }; this.isEditing = true; }
  cancelEdit() { this.isEditing = false; }

  saveProfile() {
    this.profileApiService.updateProfile({
      HoTenKhachHang: this.editUser.fullName,
      Email: this.editUser.email,
      GioiTinh: this.editUser.gender,
      NgaySinh: this.editUser.dob,
    }).subscribe({
      next: () => {
        this.user = { ...this.editUser };
        const cur2 = this.authService.getCurrentUser() || {};
        this.authService.setCurrentUser({ ...(cur2 as any), HoTenKhachHang: this.user.fullName || (cur2 as any).HoTenKhachHang || 'Khách hàng' });
        this.isEditing = false;
      },
      error: (err: any) => {
        console.error('Save profile error:', err);
        this.isEditing = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    // simple client preview and basic size check
    if (file.size > 1024 * 1024) {
      this.AnhDaiDienError = 'File quá lớn, tối đa 1MB';
      return;
    }
    const url = URL.createObjectURL(file);
    (this.editUser as any).AnhDaiDien = url;
    this.AnhDaiDienError = '';
  }

  validateHoTenKhachHang() {
    const name = (this.editUser as any).HoTenKhachHang || '';
    this.HoTenKhachHangError = name.trim() ? '' : 'Vui lòng nhập họ tên';
    this.updateFormValidity();
  }

  validateEmail() {
    const email = (this.editUser as any).Email || '';
    if (!email) { this.EmailError = ''; this.updateFormValidity(); return; }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    this.EmailError = ok ? '' : 'Email không hợp lệ';
    this.updateFormValidity();
  }

  validateNgaySinh() {
    const d = (this.editUser as any).NgaySinh || '';
    this.NgaySinhError = d ? '' : '';
    this.updateFormValidity();
  }

  updateFormValidity() {
    this.isFormValid = !this.HoTenKhachHangError && !this.EmailError && !this.NgaySinhError && !this.AnhDaiDienError;
  }

  confirmChangePassword() { this.showOtpModal = true; this.startOtpTimer(); }

  startOtpTimer() {
    this.otpTimer = 90;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) this.otpTimer--;
      else clearInterval(this.timerInterval);
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
    }
  }

  startRedirectTimer() {
    this.redirectTimer = 3;
    if (this.redirectInterval) clearInterval(this.redirectInterval);
    this.redirectInterval = setInterval(() => {
      if (this.redirectTimer > 1) this.redirectTimer--;
      else this.goToLogin();
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

  historyInterval: any;

  startHistoryPolling(): void {
    this.stopHistoryPolling();
    this.historyInterval = setInterval(() => {
      if (this.activeTab === 'history' && !this.isHistoryLoading) {
        this.loadHistorySilent();
      }
    }, 5000);
  }

  stopHistoryPolling(): void {
    if (this.historyInterval) {
      clearInterval(this.historyInterval);
      this.historyInterval = null;
    }
  }

  loadHistorySilent(): void {
    this.profileApiService.getHistory().subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          let orders = Array.isArray(response?.data) ? response.data : [];

          if (this.filterMaDonHang.trim()) {
            const q = this.filterMaDonHang.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.maDonHang || '').toLowerCase().includes(q)
            );
          }

          if (this.filterTenTuyenXe.trim()) {
            const q = this.filterTenTuyenXe.trim().toLowerCase();
            orders = orders.filter((o: any) =>
              (o.tenTuyen || '').toLowerCase().includes(q)
            );
          }

          if (this.filterThoiGianDat) {
            orders = orders.filter((o: any) =>
              o.departureDate === this.filterThoiGianDat
            );
          }

          if (this.filterTrangThai) {
            const targetStatus = this.normalizeString(this.filterTrangThai);
            orders = orders.filter((o: any) =>
              this.normalizeString(o.trangThaiDonHang) === targetStatus
            );
          }

          orders.sort((a: any, b: any) =>
            (b.maDonHang || '').localeCompare(a.maDonHang || '')
          );

          this.totalItems = orders.length;

          const from = (this.currentPage - 1) * this.pageSize;
          const paged = orders.slice(from, from + this.pageSize);

          this.filteredHistoryOrders = paged.map((o: any) => {
            let formattedNgayDi = '';
            if (o.gioKhoiHanh && o.departureDate) {
              const [y, m, d] = o.departureDate.split('-');
              formattedNgayDi = `${o.gioKhoiHanh} ${d}-${m}-${y}`;
            }

            const rawStatus = (o.trangThaiDonHang || '').toString();
            let displayStatus = 'Chờ thanh toán';
            const s = rawStatus.toLowerCase();
            if (s.includes('chothanhtoan') || s.includes('cho_thanh_toan') || s.includes('cho_thanhtoan') || s.includes('cho thanh toan') || s.includes('cho thanhtoan') || s === 'chờ thanh toán') {
              displayStatus = 'Chờ thanh toán';
            } else if (s.includes('chokhoihanh') || s.includes('cho_khoi_hanh') || s.includes('cho khoi hanh') || s.includes('chờ khởi hành') || s.includes('cho khoihanh') || s === 'chờ khởi hành') {
              displayStatus = 'Chờ khởi hành';
            } else if (s.includes('dahoanthanh') || s.includes('da_hoan_thanh') || s.includes('da hoàn thành') || s.includes('da hoan thanh') || s === 'đã hoàn thành') {
              displayStatus = 'Đã hoàn thành';
            } else if (s.includes('dadanhgia') || s.includes('da_danh_gia') || s.includes('đã đánh giá') || s.includes('da danh gia') || s === 'đã đánh giá') {
              displayStatus = 'Đã đánh giá';
            } else if (s.includes('dahuy') || s.includes('da_huy') || s.includes('đã hủy') || s.includes('da huy') || s === 'đã hủy') {
              displayStatus = 'Đã hủy';
            }

            return {
              maDonHang: o.maDonHang,
              soLuongVeDaDat: o.soLuongVeDaDat || 1,
              tenTuyenXe: o.tenTuyen || '',
              gioKhoiHanh: o.gioKhoiHanh || '',
              ngayKhoiHanh: o.departureDate || '',
              formattedNgayDi,
              tongGiaVe: o.tongGiaVe || 0,
              trangThaiDonHang: displayStatus as any,
              soDienThoai: o.soDienThoai || this.user.phone
            };
          });

          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

  goToBooking() { this.router.navigate(['/home']); }

  logout() {
    this.isLogoutActive = true;
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  selectTab(tab: string) {
    this.router.navigate([], {
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
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