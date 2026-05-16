import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;
  currentDate = new Date();

  constructor(private router: Router) {
    // Tự động xử lý trạng thái menu khi chuyển trang
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.urlAfterRedirects || event.url;
      
      this.menuItems.forEach(item => {
        if (item.children) {
          // Kiểm tra xem có con nào đang active không
          const hasActiveChild = item.children.some(child => 
            child.route && currentUrl.includes(child.route)
          );
          
          // Nếu có con active, giữ menu mở. Nếu không, đóng lại.
          if (hasActiveChild) {
            item.isOpen = true;
          } else {
            // Chỉ đóng nếu chúng ta đang ở một trang hoàn toàn khác không thuộc nhóm này
            // item.isOpen = false; // Tạm thời comment nếu bạn muốn menu đứng yên hoàn toàn cho đến khi click cái khác
          }
        }
      });
    });
  }

  menuItems: MenuItem[] = [
    { label: 'Trang chủ', icon: 'home', route: '/admin/trang-chu' },
    {
      label: 'Quản lý vé',
      icon: 'confirmation_number',
      isOpen: false,
      children: [
        { label: 'Đặt vé mới', icon: 'add_circle', route: '/admin/quan-ly-ve/dat-ve-moi' },
        { label: 'Danh sách vé', icon: 'list_alt', route: '/admin/quan-ly-ve/danh-sach-ve' }
      ]
    },
    { label: 'Quản lý tin tức', icon: 'article', route: '/admin/quan-ly-tin-tuc' },
    {
      label: 'Quản lý điều hành',
      icon: 'settings_input_component',
      isOpen: false,
      children: [
        { label: 'Quản lý tuyến xe', icon: 'route', route: '/admin/quan-ly-dieu-hanh/quan-ly-tuyen-xe' },
        { label: 'Quản lý lịch trình', icon: 'calendar_month', route: '/admin/quan-ly-dieu-hanh/quan-ly-lich-trinh' },
        { label: 'Quản lý phương tiện', icon: 'directions_bus', route: '/admin/quan-ly-dieu-hanh/quan-ly-phuong-tien' },
        { label: 'Quản lý tài xế & phụ xe', icon: 'badge', route: '/admin/quan-ly-dieu-hanh/quan-ly-tai-xe-phu-xe' },
        { label: 'Quản lý điểm đón trả dừng', icon: 'location_on', route: '/admin/quan-ly-dieu-hanh/quan-ly-diem-don-tra-dung' }
      ]
    },
    { label: 'Quản lý khách hàng', icon: 'groups', route: '/admin/quan-ly-khach-hang' },
    { label: 'Quản lý nhân viên', icon: 'engineering', route: '/admin/quan-ly-nhan-vien' },
    { label: 'Quản lý chính sách', icon: 'policy', route: '/admin/quan-ly-chinh-sach' },
    { label: 'Báo cáo', icon: 'bar_chart', route: '/admin/bao-cao' },
    { label: 'Quản lý nhật ký', icon: 'history_edu', route: '/admin/quan-ly-nhat-ky' }
  ];

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleSubmenu(item: MenuItem) {
    if (item.children) {
      const currentState = item.isOpen;
      // Đóng tất cả các menu khác
      this.menuItems.forEach(m => {
        if (m !== item) m.isOpen = false;
      });
      // Toggle menu hiện tại
      item.isOpen = !currentState;
    } else {
      // Nếu bấm vào menu không có con (như Trang chủ), đóng tất cả các menu con đang mở
      this.menuItems.forEach(m => m.isOpen = false);
    }
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('vi-VN', options);
  }

  get isAnyMenuOpen(): boolean {
    return this.menuItems.some(m => m.isOpen);
  }
}
