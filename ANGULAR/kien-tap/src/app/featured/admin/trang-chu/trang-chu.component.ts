import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminAuthService, AdminUser } from '../../../core/services/admin-auth.service';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
}

interface StatCard {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  trend: string;
  trendType: 'up' | 'down';
  icon: string;
  theme: string;
}

interface Booking {
  id: string;
  customer: string;
  route: string;
  seat: string;
  time: string;
  price: number;
  status: string;
}

interface PopularRoute {
  name: string;
  bookings: number;
  trend: string;
  trendType: 'up' | 'down';
}

@Component({
  selector: 'app-trang-chu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trang-chu.component.html',
  styleUrls: ['./trang-chu.component.css']
})
export class TrangChuComponent implements OnInit {
  currentUser: AdminUser | null = null;
  greeting = '';
  roleLabel = '';

  quickActions: QuickAction[] = [];
  stats: StatCard[] = [];

  // Data for ticket sales / admin role
  bookings: Booking[] = [
    { id: 'TXP2605001', customer: 'Nguyễn Văn A', route: 'BX Miền Đông → Bến xe Hà Nội', seat: 'A1', time: '06:00', price: 860000, status: 'Hoàn thành' },
    { id: 'TXP2605002', customer: 'Trần Thị B', route: 'BX Miền Đông → Đà Nẵng', seat: 'B3', time: '08:30', price: 480000, status: 'Đang chờ' },
    { id: 'TXP2605003', customer: 'Lê Văn C', route: 'BX Miền Đông → Bến xe Vinh', seat: 'A5', time: '10:00', price: 450000, status: 'Hoàn thành' },
    { id: 'TXP2605004', customer: 'Phạm Thị D', route: 'BX Miền Đông → Bến xe Huế', seat: 'B10', time: '13:00', price: 350000, status: 'Hoàn thành' }
  ];

  // Data for dispatch role
  popularRoutes: PopularRoute[] = [
    { name: 'BX Miền Đông → Hà Nội', bookings: 342, trend: '+12%', trendType: 'up' },
    { name: 'BX Miền Đông → Đà Nẵng', bookings: 289, trend: '+8%', trendType: 'up' },
    { name: 'BX Miền Đông → Vinh', bookings: 231, trend: '-5%', trendType: 'down' },
    { name: 'BX Miền Đông → Huế', bookings: 187, trend: '+15%', trendType: 'up' }
  ];

  constructor(private authService: AdminAuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupDashboard(user);
    });

    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Chào buổi sáng';
    else if (hour < 18) this.greeting = 'Chào buổi chiều';
    else this.greeting = 'Chào buổi tối';
  }

  setupDashboard(user: AdminUser | null) {
    if (!user) return;

    const role = user.LoaiTaiKhoan;
    const perms = user.Quyen || [];

    switch (role) {
      case 'NhanVienBanVe':
        this.roleLabel = 'Nhân viên bán vé';
        this.setupTicketSalesDashboard(perms);
        break;
      case 'NhanVienDieuPhoi':
        this.roleLabel = 'Nhân viên điều phối';
        this.setupDispatchDashboard(perms);
        break;
      case 'BanQuanLy':
        this.roleLabel = 'Ban quản lý';
        this.setupManagementDashboard(perms);
        break;
      case 'QuanTriVien':
        this.roleLabel = 'Quản trị viên';
        this.setupAdminDashboard(perms);
        break;
      default:
        this.roleLabel = 'Nhân viên';
        this.setupTicketSalesDashboard(perms);
    }
  }

  setupTicketSalesDashboard(perms: string[]) {
    this.quickActions = [
      { label: 'Đặt vé mới', icon: 'add_circle', route: '/admin/quan-ly-ve/dat-ve-moi', color: 'orange' },
      { label: 'Tra cứu vé', icon: 'search', route: '/admin/quan-ly-ve/danh-sach-ve', color: 'blue' },
      { label: 'Khách hàng', icon: 'people', route: '/admin/quan-ly-khach-hang', color: 'purple' },
    ];
    this.stats = [
      { title: 'Vé bán hôm nay', value: '47', trend: '+12% so với hôm qua', trendType: 'up', icon: 'local_activity', theme: 'blue' },
      { title: 'Vé chờ thanh toán', value: '8', trend: '3 sắp hết hạn', trendType: 'down', icon: 'pending_actions', theme: 'orange' },
      { title: 'Doanh thu hôm nay', value: 22350000, isCurrency: true, trend: '+18% so với hôm qua', trendType: 'up', icon: 'payments', theme: 'teal' },
      { title: 'Vé đã hủy hôm nay', value: '3', trend: '-1 so với hôm qua', trendType: 'up', icon: 'cancel', theme: 'purple' },
    ];
  }

  setupDispatchDashboard(perms: string[]) {
    this.quickActions = [
      { label: 'Quản lý lịch trình', icon: 'calendar_month', route: '/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh', color: 'blue' },
      { label: 'Quản lý tuyến xe', icon: 'route', route: '/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe', color: 'orange' },
      { label: 'Quản lý phương tiện', icon: 'directions_bus', route: '/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien', color: 'teal' },
      { label: 'Tài xế & phụ xe', icon: 'badge', route: '/admin/quan-ly-dieu-hanh/quan-ly-tai-xe-phu-xe', color: 'purple' },
    ];
    this.stats = [
      { title: 'Chuyến hôm nay', value: '12', trend: '2 đang chạy', trendType: 'up', icon: 'departure_board', theme: 'blue' },
      { title: 'Phương tiện hoạt động', value: '28/32', trend: 'Tỉ lệ vận hành 87%', trendType: 'up', icon: 'directions_bus', theme: 'teal' },
      { title: 'Chuyến chờ khởi hành', value: '5', trend: '1 chuyến sắp xuất bến', trendType: 'up', icon: 'pending', theme: 'orange' },
      { title: 'Tuyến đang hoạt động', value: '8', trend: 'Đầy đủ tài xế', trendType: 'up', icon: 'route', theme: 'purple' },
    ];
  }

  setupManagementDashboard(perms: string[]) {
    this.quickActions = [
      { label: 'Xem doanh thu', icon: 'payments', route: '/admin/bao-cao/bao-cao-chi-tiet', color: 'orange' },
      { label: 'Xuất báo cáo', icon: 'download', route: '/admin/bao-cao/bao-cao-tong-hop-theo-tuyen', color: 'blue' },
    ];
    this.stats = [
      { title: 'Doanh thu tháng này', value: 145000000, isCurrency: true, trend: '+8.2% so với tháng trước', trendType: 'up', icon: 'payments', theme: 'orange' },
      { title: 'Tổng vé trong tháng', value: '1,234', trend: '+12.5% so với tháng trước', trendType: 'up', icon: 'local_activity', theme: 'blue' },
      { title: 'Khách hàng mới', value: '342', trend: '-3.1% so với tháng trước', trendType: 'down', icon: 'person_add', theme: 'purple' },
      { title: 'Tỉ lệ hoàn/hủy', value: '2.1%', trend: '-0.4% so với tháng trước', trendType: 'up', icon: 'cancel', theme: 'teal' },
    ];
  }

  setupAdminDashboard(perms: string[]) {
    this.quickActions = [
      { label: 'Quản lý nhân viên', icon: 'manage_accounts', route: '/admin/quan-ly-nhan-vien', color: 'blue' },
      { label: 'Nhật ký hệ thống', icon: 'history_edu', route: '/admin/quan-ly-nhat-ky', color: 'orange' },
      { label: 'Quản lý đánh giá', icon: 'star', route: '/admin/trang-chu', color: 'purple' },
      { label: 'Từ khóa cấm', icon: 'block', route: '/admin/quan-ly-tu-khoa-cam', color: 'teal' },
    ];
    this.stats = [
      { title: 'Tổng nhân viên', value: '4', trend: 'Tất cả đang hoạt động', trendType: 'up', icon: 'badge', theme: 'blue' },
      { title: 'Đánh giá chưa phản hồi', value: '12', trend: '+3 hôm nay', trendType: 'down', icon: 'star_outline', theme: 'orange' },
      { title: 'Thao tác hôm nay', value: '38', trend: 'Từ 4 người dùng', trendType: 'up', icon: 'history', theme: 'purple' },
      { title: 'Báo cáo vi phạm', value: '2', trend: 'Chờ xử lý', trendType: 'down', icon: 'report', theme: 'teal' },
    ];
  }

  get showTicketSection(): boolean {
    const role = this.currentUser?.LoaiTaiKhoan;
    return role === 'NhanVienBanVe' || role === 'QuanTriVien';
  }

  get showRouteSection(): boolean {
    const role = this.currentUser?.LoaiTaiKhoan;
    return role === 'NhanVienDieuPhoi' || role === 'QuanTriVien';
  }

  get showFinanceSection(): boolean {
    const role = this.currentUser?.LoaiTaiKhoan;
    return role === 'BanQuanLy' || role === 'QuanTriVien';
  }

  getSeatsList(seat: string): string[] {
    if (!seat) return [];
    return seat.split(',').map(s => s.trim());
  }

  getSeatColorClass(seat: string): string {
    if (!seat) return '';
    return seat.startsWith('A') ? 'seat-a' : 'seat-b';
  }

  getStatusClass(status: string): string {
    if (status === 'Đang chờ') return 'status-pending';
    if (status === 'Hoàn thành') return 'status-done';
    return '';
  }
}
