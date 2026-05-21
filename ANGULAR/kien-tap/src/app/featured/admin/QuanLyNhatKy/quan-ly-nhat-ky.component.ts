import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SystemLog {
  maNhatKy: string;
  maKhachHang?: string;
  tenKhachHang?: string;
  maNhanVien?: string;
  tenNhanVien?: string;
  loaiTaiKhoan: 'Khách hàng' | 'Bán vé' | 'Điều phối' | 'Quản trị viên';
  loaiThaoTac: 'Đăng nhập' | 'Đăng xuất' | 'Đặt vé' | 'Hủy vé' | 'Cập nhật xe' | 'Thêm tuyến xe' | 'Đổi mật khẩu' | 'Sửa chính sách';
  thoiGian: string;
  diaChiIP: string;
  noiDungChiTiet: string;
  duLieuThayDoi?: {
    truong: string;
    giaTriCu: string;
    giaTriMoi: string;
  }[];
}

interface TicketLog {
  maLichSu: string;
  maVe: string;
  maKhachHang?: string;
  tenKhachHang?: string;
  maNVBanVe?: string;
  tenNVBanVe?: string;
  hanhDong: 'Đặt vé mới' | 'Đổi ngày/giờ đi' | 'Hủy vé hoàn tiền' | 'Ghi nhận check-in';
  trangThaiCu: string;
  trangThaiMoi: string;
  thoiGianThayDoi: string;
  ghiChu: string;
}

@Component({
  selector: 'app-quan-ly-nhat-ky',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-nhat-ky.component.html',
  styleUrls: ['./quan-ly-nhat-ky.component.css']
})
export class QuanLyNhatKyComponent implements OnInit {
  activeTab: 'he-thong' | 've-xe' = 'he-thong';

  // Filters for System Logs
  sysFilters = {
    role: 'Tất cả',
    action: 'Tất cả',
    searchTerm: '',
    fromDate: '2026-05-01',
    toDate: '2026-05-17'
  };

  // Filters for Ticket Logs
  ticketFilters = {
    action: 'Tất cả',
    searchTerm: '',
    fromDate: '2026-05-01',
    toDate: '2026-05-17'
  };

  // Full datasets
  allSysLogs: SystemLog[] = [];
  allTicketLogs: TicketLog[] = [];

  // Filtered datasets
  filteredSysLogs: SystemLog[] = [];
  filteredTicketLogs: TicketLog[] = [];

  // Paginated datasets
  sysPage = 1;
  sysPageSize = 10;
  sysTotalPages = 1;

  ticketPage = 1;
  ticketPageSize = 10;
  ticketTotalPages = 1;

  // Selected Log for detail modal
  selectedSysLog: SystemLog | null = null;
  selectedTicketLog: TicketLog | null = null;

  ngOnInit() {
    this.allSysLogs = this.generateMockSystemLogs();
    this.allTicketLogs = this.generateMockTicketLogs();
    this.applySysFilters();
    this.applyTicketFilters();
  }

  // Toggle tab
  switchTab(tab: 'he-thong' | 've-xe') {
    this.activeTab = tab;
  }

  // Filter and Paginate System Logs
  applySysFilters() {
    this.filteredSysLogs = this.allSysLogs.filter(log => {
      // Role Filter
      if (this.sysFilters.role !== 'Tất cả') {
        if (log.loaiTaiKhoan !== this.sysFilters.role) return false;
      }

      // Action Filter
      if (this.sysFilters.action !== 'Tất cả' && log.loaiThaoTac !== this.sysFilters.action) return false;

      // Date Filters
      const logDate = log.thoiGian.split(' ')[0]; // yyyy-MM-dd
      if (this.sysFilters.fromDate && logDate < this.sysFilters.fromDate) return false;
      if (this.sysFilters.toDate && logDate > this.sysFilters.toDate) return false;

      // Search query (Mã nhật ký, Tên người dùng, IP, Chi tiết)
      if (this.sysFilters.searchTerm) {
        const query = this.sysFilters.searchTerm.toLowerCase();
        const matchesCode = log.maNhatKy.toLowerCase().includes(query);
        const matchesIP = log.diaChiIP.includes(query);
        const matchesDetail = log.noiDungChiTiet.toLowerCase().includes(query);
        const matchesUser = (log.tenKhachHang?.toLowerCase().includes(query) || 
                            log.tenNhanVien?.toLowerCase().includes(query) || 
                            log.maKhachHang?.toLowerCase().includes(query) ||
                            log.maNhanVien?.toLowerCase().includes(query));

        if (!matchesCode && !matchesIP && !matchesDetail && !matchesUser) return false;
      }

      return true;
    });

    this.sysPage = 1;
    this.calculateSysPages();
  }

  calculateSysPages() {
    this.sysTotalPages = Math.ceil(this.filteredSysLogs.length / this.sysPageSize) || 1;
  }

  get paginatedSysLogs(): SystemLog[] {
    const startIndex = (this.sysPage - 1) * this.sysPageSize;
    return this.filteredSysLogs.slice(startIndex, startIndex + this.sysPageSize);
  }

  setSysPage(page: number) {
    if (page >= 1 && page <= this.sysTotalPages) {
      this.sysPage = page;
    }
  }

  getSysPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.sysTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  resetSysFilters() {
    this.sysFilters = {
      role: 'Tất cả',
      action: 'Tất cả',
      searchTerm: '',
      fromDate: '2026-05-01',
      toDate: '2026-05-17'
    };
    this.applySysFilters();
  }

  // Filter and Paginate Ticket Logs
  applyTicketFilters() {
    this.filteredTicketLogs = this.allTicketLogs.filter(log => {
      // Action Filter
      if (this.ticketFilters.action !== 'Tất cả' && log.hanhDong !== this.ticketFilters.action) return false;

      // Date Filters
      const logDate = log.thoiGianThayDoi.split(' ')[0];
      if (this.ticketFilters.fromDate && logDate < this.ticketFilters.fromDate) return false;
      if (this.ticketFilters.toDate && logDate > this.ticketFilters.toDate) return false;

      // Search query (Mã lịch sử, Mã vé, Tên người dùng, Ghi chú)
      if (this.ticketFilters.searchTerm) {
        const query = this.ticketFilters.searchTerm.toLowerCase();
        const matchesCode = log.maLichSu.toLowerCase().includes(query);
        const matchesTicket = log.maVe.toLowerCase().includes(query);
        const matchesNotes = log.ghiChu.toLowerCase().includes(query);
        const matchesUser = (log.tenKhachHang?.toLowerCase().includes(query) || 
                            log.tenNVBanVe?.toLowerCase().includes(query) ||
                            log.maKhachHang?.toLowerCase().includes(query) ||
                            log.maNVBanVe?.toLowerCase().includes(query));

        if (!matchesCode && !matchesTicket && !matchesNotes && !matchesUser) return false;
      }

      return true;
    });

    this.ticketPage = 1;
    this.calculateTicketPages();
  }

  calculateTicketPages() {
    this.ticketTotalPages = Math.ceil(this.filteredTicketLogs.length / this.ticketPageSize) || 1;
  }

  get paginatedTicketLogs(): TicketLog[] {
    const startIndex = (this.ticketPage - 1) * this.ticketPageSize;
    return this.filteredTicketLogs.slice(startIndex, startIndex + this.ticketPageSize);
  }

  setTicketPage(page: number) {
    if (page >= 1 && page <= this.ticketTotalPages) {
      this.ticketPage = page;
    }
  }

  getTicketPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.ticketTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  resetTicketFilters() {
    this.ticketFilters = {
      action: 'Tất cả',
      searchTerm: '',
      fromDate: '2026-05-01',
      toDate: '2026-05-17'
    };
    this.applyTicketFilters();
  }

  // Detail Modal Actions
  openSysLogDetail(log: SystemLog) {
    this.selectedSysLog = log;
  }

  closeSysLogDetail() {
    this.selectedSysLog = null;
  }

  openTicketLogDetail(log: TicketLog) {
    this.selectedTicketLog = log;
  }

  closeTicketLogDetail() {
    this.selectedTicketLog = null;
  }

  // System Logs Mock Generator
  private generateMockSystemLogs(): SystemLog[] {
    return [
      {
        maNhatKy: 'TXP_LOG0001',
        maKhachHang: 'TXP_KH003',
        tenKhachHang: 'Lê Văn Cường',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đăng nhập',
        thoiGian: '2026-05-17 19:42:01',
        diaChiIP: '192.168.1.10',
        noiDungChiTiet: 'Khách hàng đăng nhập thành công vào website Tân Xuân Phúc qua xác thực mật khẩu.'
      },
      {
        maNhatKy: 'TXP_LOG0002',
        maKhachHang: 'TXP_KH003',
        tenKhachHang: 'Lê Văn Cường',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đặt vé',
        thoiGian: '2026-05-17 19:48:15',
        diaChiIP: '192.168.1.10',
        noiDungChiTiet: 'Đặt thành công vé mã TXP2605C103 tuyến Bình Định ↔ Sài Gòn (BX Miền Tây) khởi hành ngày 2026-05-20 lúc 19:00.',
        duLieuThayDoi: [
          { truong: 'Trạng thái ghế', giaTriCu: 'Trống', giaTriMoi: 'Đã Bán' },
          { truong: 'Số lượng vé đặt', giaTriCu: '0', giaTriMoi: '1' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0003',
        maNhanVien: 'TXP_NV02',
        tenNhanVien: 'Vũ Quốc Hùng',
        loaiTaiKhoan: 'Điều phối',
        loaiThaoTac: 'Cập nhật xe',
        thoiGian: '2026-05-17 16:30:10',
        diaChiIP: '10.20.30.45',
        noiDungChiTiet: 'Cập nhật thông tin hạn kiểm định và trạng thái hoạt động của phương tiện biển số 81B-015.68.',
        duLieuThayDoi: [
          { truong: 'HanDangKiem', giaTriCu: '2026-05-01', giaTriMoi: '2026-11-01' },
          { truong: 'TrangThai', giaTriCu: 'Bảo trì', giaTriMoi: 'Hoạt động' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0004',
        maNhanVien: 'TXP_NV01',
        tenNhanVien: 'Phan Văn Anh',
        loaiTaiKhoan: 'Quản trị viên',
        loaiThaoTac: 'Sửa chính sách',
        thoiGian: '2026-05-17 15:20:12',
        diaChiIP: '10.20.30.12',
        noiDungChiTiet: 'Điều chỉnh chính sách hủy vé hoàn tiền cho các tuyến limousine dịp hè 2026.',
        duLieuThayDoi: [
          { truong: 'TyLePhiHuy (%)', giaTriCu: '5%', giaTriMoi: '10%' },
          { truong: 'NgayApDung', giaTriCu: '2026-01-01', giaTriMoi: '2026-05-20' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0005',
        maKhachHang: 'TXP_KH008',
        tenKhachHang: 'Vũ Thanh Hằng',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Hủy vé',
        thoiGian: '2026-05-16 10:15:30',
        diaChiIP: '172.16.8.99',
        noiDungChiTiet: 'Yêu cầu hủy vé trực tuyến cho vé mã TXP2605C108 tuyến Phú Yên ↔ Sài Gòn. Lý do: Khách hàng chủ động hủy.',
        duLieuThayDoi: [
          { truong: 'TrangThaiVe', giaTriCu: 'ConHieuLuc', giaTriMoi: 'DaHuy' },
          { truong: 'TrangThaiGhe', giaTriCu: 'DaBan', giaTriMoi: 'Trong' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0006',
        maNhanVien: 'TXP_NV02',
        tenNhanVien: 'Vũ Quốc Hùng',
        loaiTaiKhoan: 'Điều phối',
        loaiThaoTac: 'Thêm tuyến xe',
        thoiGian: '2026-05-15 08:30:00',
        diaChiIP: '10.20.30.45',
        noiDungChiTiet: 'Thêm tuyến xe mới: Phú Yên ↔ Bình Dương phục vụ nhu cầu công nhân đi lại dịp hè.',
        duLieuThayDoi: [
          { truong: 'TenTuyenXe', giaTriCu: 'Trống', giaTriMoi: 'Phú Yên ↔ Bình Dương' },
          { truong: 'TrangThai', giaTriCu: 'Trống', giaTriMoi: 'Hoạt động' }
        ]
      },
      {
        maNhatKy: 'TXP_LOG0007',
        maKhachHang: 'TXP_KH005',
        tenKhachHang: 'Hoàng Thị Dung',
        loaiTaiKhoan: 'Khách hàng',
        loaiThaoTac: 'Đổi mật khẩu',
        thoiGian: '2026-05-14 22:11:45',
        diaChiIP: '14.23.45.67',
        noiDungChiTiet: 'Thay đổi mật khẩu tài khoản khách hàng thành công. Xác thực OTP hoàn tất.'
      },
      {
        maNhatKy: 'TXP_LOG0008',
        maNhanVien: 'TXP_NV03',
        tenNhanVien: 'Trần Thị Thu',
        loaiTaiKhoan: 'Bán vé',
        loaiThaoTac: 'Đăng nhập',
        thoiGian: '2026-05-14 07:45:00',
        diaChiIP: '192.168.2.11',
        noiDungChiTiet: 'Nhân viên Vũ Quốc Hùng đăng nhập vào cổng bán vé nội bộ tại Văn phòng Gia Lai.'
      }
    ];
  }

  // Ticket Logs Mock Generator
  private generateMockTicketLogs(): TicketLog[] {
    return [
      {
        maLichSu: 'TXP_TKT001',
        maVe: 'TXP2605C103',
        maKhachHang: 'TXP_KH003',
        tenKhachHang: 'Lê Văn Cường',
        hanhDong: 'Đặt vé mới',
        trangThaiCu: 'Trống',
        trangThaiMoi: 'ConHieuLuc',
        thoiGianThayDoi: '2026-05-17 19:48:15',
        ghiChu: 'Vé đặt trực tuyến trên website, thanh toán thành công qua ví điện tử ZaloPay.'
      },
      {
        maLichSu: 'TXP_TKT02',
        maVe: 'TXP2605C102',
        maKhachHang: 'TXP_KH002',
        tenKhachHang: 'Trần Thị Bích',
        hanhDong: 'Đổi ngày/giờ đi',
        trangThaiCu: 'ConHieuLuc',
        trangThaiMoi: 'ConHieuLuc',
        thoiGianThayDoi: '2026-05-17 14:10:00',
        ghiChu: 'Hỗ trợ khách hàng đổi giờ khởi hành từ 08:00 sang 19:00 ngày 2026-05-20 do vướng lịch trình cá nhân.'
      },
      {
        maLichSu: 'TXP_TKT03',
        maVe: 'TXP2605C108',
        maKhachHang: 'TXP_KH008',
        tenKhachHang: 'Vũ Thanh Hằng',
        hanhDong: 'Hủy vé hoàn tiền',
        trangThaiCu: 'ConHieuLuc',
        trangThaiMoi: 'DaHuy',
        thoiGianThayDoi: '2026-05-16 10:15:30',
        ghiChu: 'Hủy vé theo yêu cầu của khách hàng trước 24h. Hoàn tiền 100% về tài khoản gốc.'
      },
      {
        maLichSu: 'TXP_TKT04',
        maVe: 'TXP2605C101',
        maNVBanVe: 'TXP_NV03',
        tenNVBanVe: 'Trần Thị Thu',
        hanhDong: 'Ghi nhận check-in',
        trangThaiCu: 'ConHieuLuc',
        trangThaiMoi: 'DaSuDung',
        thoiGianThayDoi: '2026-05-15 18:45:00',
        ghiChu: 'Nhân viên soát vé ghi nhận khách hàng lên xe tại Văn phòng Gia Lai (An Nhơn Bắc).'
      },
      {
        maLichSu: 'TXP_TKT05',
        maVe: 'TXP2605C104',
        maKhachHang: 'TXP_KH004',
        tenKhachHang: 'Phạm Minh Đạo',
        hanhDong: 'Đặt vé mới',
        trangThaiCu: 'Trống',
        trangThaiMoi: 'ConHieuLuc',
        thoiGianThayDoi: '2026-05-14 09:12:00',
        ghiChu: 'Vé được đặt và xuất trực tiếp tại quầy bán vé Sài Gòn, thanh toán tiền mặt.'
      }
    ];
  }
}
