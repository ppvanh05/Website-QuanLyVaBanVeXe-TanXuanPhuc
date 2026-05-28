import { Component, OnDestroy, OnInit } from '@angular/core';
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
  maVeSubject = new Subject<string>();
  tuyenXeSubject = new Subject<string>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileApiService: ProfileApiService,
    private route: ActivatedRoute
  ) {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user && user.HoTenKhachHang) this.user.fullName = user.HoTenKhachHang;
    });
  }

  ngOnInit(): void {
    this.loadProfile();

    this.maVeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterMaDonHang = value;
      this.currentPage = 1;
      this.loadHistoryFromApi();
    });

    this.tuyenXeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterTenTuyenXe = value;
      this.currentPage = 1;
      this.loadHistoryFromApi();
    });

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

    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.profileApiService.getProfile();
        }
        return of(null);
      })
    ).subscribe({
      next: (profileData: any) => {
        if (profileData) {
          this.user = {
            fullName: profileData.HoTenKhachHang || profileData.hoTenKhachHang || this.user.fullName,
            phone: profileData.SoDienThoai || profileData.soDienThoai || this.user.phone,
            gender: profileData.GioiTinh || profileData.gioiTinh || this.user.gender,
            email: profileData.Email || profileData.email || this.user.email,
            dob: profileData.NgaySinh ? new Date(profileData.NgaySinh).toISOString().slice(0,10) : this.user.dob,
            address: profileData.DiaChi || profileData.diaChi || this.user.address,
            avatar: profileData.AnhDaiDien || profileData.anhDaiDien || this.user.avatar,
          };
          this.editUser = { ...this.user };
          const current = this.authService.getCurrentUser() || {};
          this.authService.setCurrentUser({
            MaKhachHang: profileData.MaKhachHang,
            HoTenKhachHang: profileData.HoTenKhachHang || (current as any).HoTenKhachHang || this.user.fullName,
            SoDienThoai: profileData.SoDienThoai || (current as any).SoDienThoai,
            Email: profileData.Email || (current as any).Email,
            AnhDaiDien: profileData.AnhDaiDien || (current as any).AnhDaiDien,
            GioiTinh: profileData.GioiTinh || (current as any).GioiTinh,
            NgaySinh: profileData.NgaySinh || (current as any).NgaySinh,
            TrangThaiTaiKhoan: profileData.TrangThaiTaiKhoan || (current as any).TrangThaiTaiKhoan,
          });
        }
      },
      error: (err: any) => {
        console.error('Error fetching profile:', err);
        // Xử lý lỗi, ví dụ: chuyển hướng về trang đăng nhập nếu token hết hạn
        // Profile fetch error handled.
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
  }

  loadProfile(): void {
    this.isProfileLoading = true;
    this.profileApiService.getProfile().subscribe({
      next: (response: any) => {
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

        if (this.activeTab === 'history') {
          this.loadHistory();
        }
      },
      error: (err: any) => {
        console.error('Load profile error:', err);
        this.isProfileLoading = false;
      }
    });
  }

  loadHistory(): void {
    this.currentPage = 1;
    this.loadHistoryFromApi();
  }

  onMaVeChange(val: string): void { this.maVeSubject.next(val); }
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
        const orders = Array.isArray(response?.data) ? response.data : [];

        // Mỗi order trong response chứa field tickets[]
        // Mình flat ra thành từng vé để hiển thị theo dòng
        let allTickets: any[] = [];
        const ticketCounts: Record<string, number> = {};

        for (const order of orders) {
          const orderId = order.maDonHang;
          const tickets = order.tickets || [];
          ticketCounts[orderId] = tickets.length;

          for (const ticket of tickets) {
            allTickets.push({ ticket, order });
          }
        }

        // Lọc theo mã vé
        if (this.filterMaDonHang.trim()) {
          const q = this.filterMaDonHang.trim().toLowerCase();
          allTickets = allTickets.filter(item =>
            (item.ticket.maVe || '').toLowerCase().includes(q)
          );
        }

        // Lọc theo tuyến đường
        if (this.filterTenTuyenXe.trim()) {
          const q = this.filterTenTuyenXe.trim().toLowerCase();
          allTickets = allTickets.filter(item =>
            (item.order.tenTuyen || '').toLowerCase().includes(q)
          );
        }

        // Lọc theo ngày đi (departureDate dạng YYYY-MM-DD)
        if (this.filterThoiGianDat) {
          allTickets = allTickets.filter(item =>
            item.order.departureDate === this.filterThoiGianDat
          );
        }

        // Lọc theo trạng thái
        if (this.filterTrangThai) {
          allTickets = allTickets.filter(item => {
            const s = item.ticket.trangThaiVe || '';
            if (this.filterTrangThai === 'Chờ thanh toán')
              return ['Chờ thanh toán','ChoThanhToan','CHO_THANH_TOAN'].includes(s);
            if (this.filterTrangThai === 'Đã xác nhận')
              return ['Đã xác nhận','Chờ khởi hành','ChoKhoiHanh','DA_XAC_NHAN'].includes(s);
            if (this.filterTrangThai === 'Đã hoàn thành')
              return ['Đã hoàn thành','Đã đánh giá','DaHoanThanh','DaDanhGia','DA_SU_DUNG'].includes(s);
            if (this.filterTrangThai === 'Đã hủy')
              return ['Đã hủy','DaHuy','DA_HUY'].includes(s);
            return true;
          });
        }

        // Sắp xếp mã vé mới nhất lên đầu
        allTickets.sort((a, b) =>
          (b.ticket.maVe || '').localeCompare(a.ticket.maVe || '')
        );

        this.totalItems = allTickets.length;

        // Phân trang
        const from = (this.currentPage - 1) * this.pageSize;
        const paged = allTickets.slice(from, from + this.pageSize);

        this.filteredHistoryOrders = paged.map(item => {
          const t = item.ticket;
          const o = item.order;

          // Format ngày giờ: "HH:mm DD-MM-YYYY"
          let formattedNgayDi = '';
          if (o.gioKhoiHanh && o.departureDate) {
            const [y, m, d] = o.departureDate.split('-');
            formattedNgayDi = `${o.gioKhoiHanh} ${d}-${m}-${y}`;
          }

          // Chuẩn hóa trạng thái
          let displayStatus = t.trangThaiVe || 'Chờ thanh toán';
          if (['Chờ khởi hành','ChoKhoiHanh','DA_XAC_NHAN'].includes(displayStatus))
            displayStatus = 'Đã xác nhận';
          else if (['DaHoanThanh','DaDanhGia','Đã đánh giá','DA_SU_DUNG'].includes(displayStatus))
            displayStatus = 'Đã hoàn thành';
          else if (['ChoThanhToan','CHO_THANH_TOAN'].includes(displayStatus))
            displayStatus = 'Chờ thanh toán';
          else if (['DaHuy','DA_HUY'].includes(displayStatus))
            displayStatus = 'Đã hủy';

          return {
            maVe: t.maVe,
            maDonHang: o.maDonHang,
            soLuongVeDaDat: ticketCounts[o.maDonHang] || 1,
            tenTuyenXe: o.tenTuyen || '',
            gioKhoiHanh: o.gioKhoiHanh || '',
            ngayKhoiHanh: o.departureDate || '',
            formattedNgayDi,
            tongGiaVe: t.giaVe || 0,
            trangThaiDonHang: displayStatus as any,
            soDienThoai: o.soDienThoai || this.user.phone
          };
        });

        this.isHistoryLoading = false;
      },
      error: (err: any) => {
        console.error('Load history error:', err);
        this.filteredHistoryOrders = [];
        this.totalItems = 0;
        this.isHistoryLoading = false;
      }
    });
  }

  viewTicketDetail(order: any): void {
    this.router.navigate(['/tra-cuu-ve'], {
      queryParams: {
        phone: order.soDienThoai,
        code: order.maDonHang
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

  goToBooking() { this.router.navigate(['/tim-kiem-chuyen']); }

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
    if (tab === 'history') this.loadHistory();
  }

  getStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'bg-success-light': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'text-success-text': status === 'Đã hoàn thành' || status === 'Đã đánh giá',
      'bg-danger-light': status === 'Đã hủy',
      'text-danger-text': status === 'Đã hủy',
      'bg-info-light': status === 'Đã xác nhận',
      'text-info-text': status === 'Đã xác nhận',
      'bg-warning-light': status === 'Chờ thanh toán',
      'text-warning-text': status === 'Chờ thanh toán',
    };
  }
}