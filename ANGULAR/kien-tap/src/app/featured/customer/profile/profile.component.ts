import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileApiService } from '../../../core/services/profile-api.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  // Supabase pagination and debouncing variables
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
    private supabaseService: SupabaseService,
    private route: ActivatedRoute
  ) {
    this.authService.userName$.subscribe((name: string) => this.user.fullName = name);
  }


  ngOnInit(): void {
    this.loadProfile();

    this.maVeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterMaDonHang = value;
      this.currentPage = 1;
      this.loadHistoryFromSupabase();
    });

    this.tuyenXeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterTenTuyenXe = value;
      this.currentPage = 1;
      this.loadHistoryFromSupabase();
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
  }


  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
  }

  // Filter history logic
  searchHistory(): void {
    this.currentPage = 1;
    this.loadHistoryFromSupabase();
  }

  resetHistoryFilter(): void {
    this.filterMaDonHang = '';
    this.filterThoiGianDat = '';
    this.filterTenTuyenXe = '';
    this.filterTrangThai = '';
    this.currentPage = 1;
    this.loadHistoryFromSupabase();
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
        };
        this.editUser = { ...this.user };
        this.authService.setUserName(this.user.fullName || 'Khách hàng');
        this.isProfileLoading = false;

        // If on history tab, reload history now that currentUserId is available
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
    this.loadHistoryFromSupabase();
  }

  onMaVeChange(val: string): void {
    this.maVeSubject.next(val);
  }

  onTuyenXeChange(val: string): void {
    this.tuyenXeSubject.next(val);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadHistoryFromSupabase();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadHistoryFromSupabase();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pages(): number[] {
    const arr = [];
    for (let i = 1; i <= this.totalPages; i++) {
      arr.push(i);
    }
    return arr;
  }


  loadHistoryFromSupabase(): void {
    if (!this.currentUserId) {
      // If profile is not yet loaded, wait for it
      this.profileApiService.getProfile().subscribe({
        next: (response: any) => {
          const profile = response?.data || {};
          this.currentUserId = profile.MaKhachHang || profile.maKhachHang || '';
          this.fetchSupabaseData();
        },
        error: () => {
          this.isHistoryLoading = false;
        }
      });
    } else {
      this.fetchSupabaseData();
    }
  }

  async fetchSupabaseData() {
    this.isHistoryLoading = true;
    this.filteredHistoryOrders = [];

    try {
      if (!this.currentUserId) {
        this.isHistoryLoading = false;
        return;
      }

      const from = (this.currentPage - 1) * this.pageSize;
      const to = from + this.pageSize - 1;

      // Bước 1: lấy tất cả MaDonHang thuộc currentUserId
      const { data: donHangData, error: donHangError } =
        await this.supabaseService.supabase
          .from('DON_HANG')
          .select('MaDonHang')
          .eq('MaKhachHang', this.currentUserId);

      if (donHangError) throw donHangError;
      if (!donHangData || donHangData.length === 0) {
        this.totalItems = 0;
        this.isHistoryLoading = false;
        return;
      }

      const maDonHangList = donHangData.map((d: any) => d.MaDonHang);

      // Bước 2: query VE_DIEN_TU với danh sách MaDonHang
      let query = this.supabaseService.supabase
        .from('VE_DIEN_TU')
        .select(`
          MaVe, MaDonHang, MaLichTrinh, GiaVe, TrangThaiVe,
          LICH_TRINH (
            MaLichTrinh, NgayKhoiHanh, GioKhoiHanh, GioDenDuKien,
            TUYEN_XE ( MaTuyenXe, TenTuyenXe, DiemKhoiHanh, DiemDen )
          )
        `, { count: 'exact' })
        .in('MaDonHang', maDonHangList);

      // Lọc Mã vé
      if (this.filterMaDonHang.trim()) {
        query = query.ilike('MaVe', `%${this.filterMaDonHang.trim()}%`);
      }

      // Lọc Trạng thái
      if (this.filterTrangThai) {
        let dbStatuses: string[] = [];
        if (this.filterTrangThai === 'Chờ thanh toán')
          dbStatuses = ['ChoThanhToan', 'CHO_THANH_TOAN'];
        else if (this.filterTrangThai === 'Đã xác nhận')
          dbStatuses = ['ChoKhoiHanh', 'DA_XAC_NHAN'];
        else if (this.filterTrangThai === 'Đã hoàn thành')
          dbStatuses = ['DaHoanThanh', 'DaDanhGia', 'DA_SU_DUNG'];
        else if (this.filterTrangThai === 'Đã hủy')
          dbStatuses = ['DaHuy', 'DA_HUY'];
        if (dbStatuses.length > 0)
          query = query.in('TrangThaiVe', dbStatuses);
      }

      // Đếm số vé mỗi đơn
      const ticketCounts: Record<string, number> = {};
      for (const id of maDonHangList) ticketCounts[id] = 0;

      query = query.order('MaVe', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      this.totalItems = count || 0;

      if (data && data.length > 0) {
        // Đếm số vé thực tế trong trang hiện tại
        for (const t of data) {
          if (t.MaDonHang) {
            ticketCounts[t.MaDonHang] = (ticketCounts[t.MaDonHang] || 0) + 1;
          }
        }

        this.filteredHistoryOrders = data.map((ticket: any) => {
          const schedule = ticket.LICH_TRINH;
          const route = schedule?.TUYEN_XE;

          const tenTuyenXe = route
            ? `${route.DiemKhoiHanh} - ${route.DiemDen}`
            : '';

          // Format ngày giờ từ NgayKhoiHanh (YYYY-MM-DD) + GioKhoiHanh (HH:mm:ss)
          let formattedNgayDi = '';
          if (schedule?.NgayKhoiHanh && schedule?.GioKhoiHanh) {
            const gio = String(schedule.GioKhoiHanh).substring(0, 5);
            const parts = String(schedule.NgayKhoiHanh).split('-');
            if (parts.length === 3) {
              formattedNgayDi = `${gio} ${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          const dbStatus = ticket.TrangThaiVe;
          let displayStatus = 'Chờ thanh toán';
          if (dbStatus === 'ChoThanhToan' || dbStatus === 'CHO_THANH_TOAN')
            displayStatus = 'Chờ thanh toán';
          else if (dbStatus === 'ChoKhoiHanh' || dbStatus === 'DA_XAC_NHAN')
            displayStatus = 'Đã xác nhận';
          else if (['DaHoanThanh','DaDanhGia','DA_SU_DUNG'].includes(dbStatus))
            displayStatus = 'Đã hoàn thành';
          else if (dbStatus === 'DaHuy' || dbStatus === 'DA_HUY')
            displayStatus = 'Đã hủy';

          return {
            maVe: ticket.MaVe,
            maDonHang: ticket.MaDonHang || '',
            soLuongVeDaDat: ticketCounts[ticket.MaDonHang] || 1,
            tenTuyenXe,
            gioKhoiHanh: '',
            ngayKhoiHanh: '',
            formattedNgayDi,
            tongGiaVe: Number(ticket.GiaVe) || 0,
            trangThaiDonHang: displayStatus as any,
            soDienThoai: this.user.phone
          };
        });
      }
    } catch (err) {
      console.warn('Supabase error, dùng fallback API:', err);
      await this.fetchFallbackData();
    } finally {
      this.isHistoryLoading = false;
    }
  }

  fetchFallbackData(): Promise<void> {
    return new Promise((resolve) => {
      this.profileApiService.getHistory().subscribe({
        next: (response: any) => {
          const orders = Array.isArray(response?.data) ? response.data : [];
          
          let allTickets: any[] = [];
          const ticketCounts: Record<string, number> = {};
          
          for (const order of orders) {
            const orderId = order.maDonHang;
            const tickets = order.tickets || [];
            ticketCounts[orderId] = tickets.length;
            
            for (const ticket of tickets) {
              allTickets.push({
                ticket,
                order
              });
            }
          }
          
          // Apply in-memory filters
          if (this.filterMaDonHang.trim()) {
            const queryVal = this.filterMaDonHang.trim().toLowerCase();
            allTickets = allTickets.filter(item => 
              (item.ticket.maVe || '').toLowerCase().includes(queryVal)
            );
          }
          
          if (this.filterTenTuyenXe.trim()) {
            const queryVal = this.filterTenTuyenXe.trim().toLowerCase();
            allTickets = allTickets.filter(item => 
              (item.order.tenTuyen || '').toLowerCase().includes(queryVal)
            );
          }
          
          if (this.filterThoiGianDat) {
            allTickets = allTickets.filter(item => 
              item.order.departureDate === this.filterThoiGianDat
            );
          }
          
          if (this.filterTrangThai) {
            allTickets = allTickets.filter(item => {
              if (this.filterTrangThai === 'Chờ thanh toán') {
                return item.ticket.trangThaiVe === 'Chờ thanh toán' || item.ticket.trangThaiVe === 'ChoThanhToan' || item.ticket.trangThaiVe === 'CHO_THANH_TOAN';
              }
              if (this.filterTrangThai === 'Đã xác nhận') {
                return item.ticket.trangThaiVe === 'Đã xác nhận' || item.ticket.trangThaiVe === 'Chờ khởi hành' || item.ticket.trangThaiVe === 'ChoKhoiHanh' || item.ticket.trangThaiVe === 'DA_XAC_NHAN';
              }
              if (this.filterTrangThai === 'Đã hoàn thành') {
                return item.ticket.trangThaiVe === 'Đã hoàn thành' || item.ticket.trangThaiVe === 'Đã đánh giá' || item.ticket.trangThaiVe === 'DaHoanThanh' || item.ticket.trangThaiVe === 'DaDanhGia' || item.ticket.trangThaiVe === 'DA_SU_DUNG';
              }
              if (this.filterTrangThai === 'Đã hủy') {
                return item.ticket.trangThaiVe === 'Đã hủy' || item.ticket.trangThaiVe === 'DaHuy' || item.ticket.trangThaiVe === 'DA_HUY';
              }
              return true;
            });
          }
          
          // Sort by MaVe desc
          allTickets.sort((a, b) => (b.ticket.maVe || '').localeCompare(a.ticket.maVe || ''));
          
          this.totalItems = allTickets.length;
          
          const from = (this.currentPage - 1) * this.pageSize;
          const to = from + this.pageSize;
          const paginatedTickets = allTickets.slice(from, to);
          
          this.filteredHistoryOrders = paginatedTickets.map(item => {
            const t = item.ticket;
            const o = item.order;
            
            let formattedNgayDi = '';
            if (o.gioKhoiHanh && o.departureDate) {
              const [y, m, d] = o.departureDate.split('-');
              formattedNgayDi = `${o.gioKhoiHanh} ${d}-${m}-${y}`;
            } else {
              formattedNgayDi = `${o.gioKhoiHanh || ''} ${o.ngayKhoiHanh || ''}`.trim();
            }
            
            // Normalize status to standard format for classes/display
            let displayStatus = t.trangThaiVe;
            if (displayStatus === 'Chờ khởi hành' || displayStatus === 'ChoKhoiHanh' || displayStatus === 'DA_XAC_NHAN') {
              displayStatus = 'Đã xác nhận';
            } else if (displayStatus === 'DaHoanThanh' || displayStatus === 'DaDanhGia' || displayStatus === 'Đã đánh giá' || displayStatus === 'DA_SU_DUNG') {
              displayStatus = 'Đã hoàn thành';
            } else if (displayStatus === 'ChoThanhToan' || displayStatus === 'CHO_THANH_TOAN') {
              displayStatus = 'Chờ thanh toán';
            } else if (displayStatus === 'DaHuy' || displayStatus === 'DA_HUY') {
              displayStatus = 'Đã hủy';
            }
            
            return {
              maVe: t.maVe,
              maDonHang: o.maDonHang,
              soLuongVeDaDat: ticketCounts[o.maDonHang] || 1,
              tenTuyenXe: o.tenTuyen || '',
              gioKhoiHanh: '',
              ngayKhoiHanh: '',
              formattedNgayDi: formattedNgayDi,
              tongGiaVe: t.giaVe || 0,
              trangThaiDonHang: displayStatus,
              soDienThoai: o.soDienThoai
            };
          });
          
          resolve();
        },
        error: (err: any) => {
          console.error('Fallback failed:', err);
          this.filteredHistoryOrders = [];
          this.totalItems = 0;
          resolve();
        }
      });
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
      'bg-info-light': status === 'Đã xác nhận',
      'text-info-text': status === 'Đã xác nhận',
      'bg-warning-light': status === 'Chờ thanh toán',
      'text-warning-text': status === 'Chờ thanh toán',
    };
  }
}


