import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class TrangChuComponent {
  stats: StatCard[] = [
    { 
      title: 'Tổng vé trong tháng', 
      value: '1,234', 
      trend: '+12.5% so với tháng trước', 
      trendType: 'up',
      icon: 'local_activity',
      theme: 'blue'
    },
    { 
      title: 'Doanh thu tháng này', 
      value: 145000000, 
      isCurrency: true,
      trend: '+8.2% so với tháng trước', 
      trendType: 'up',
      icon: 'payments',
      theme: 'orange'
    },
    { 
      title: 'Khách hàng mới', 
      value: '342', 
      trend: '-3.1% so với tháng trước', 
      trendType: 'down',
      icon: 'person_add',
      theme: 'purple'
    },
    { 
      title: 'Phương tiện hoạt động', 
      value: '28/32', 
      trend: 'Tỉ lệ vận hành 87%', 
      trendType: 'up',
      icon: 'directions_bus',
      theme: 'teal'
    }
  ];

  bookings: Booking[] = [
    { id: 'TXP1245678', customer: 'Nguyễn Văn An', route: 'Bình Dương - BX Miền Đông', seat: 'A1, A2', time: '06:00', price: 170000, status: 'Hoàn thành' },
    { id: 'TXP1245679', customer: 'Trần Thị Bích', route: 'BX Miền Đông - Bình Dương', seat: 'B3', time: '08:30', price: 95000, status: 'Đang chờ' },
    { id: 'TXP1245680', customer: 'Lê Văn Cường', route: 'Bình Dương - BX Miền Tây', seat: 'A5, A6, A7', time: '10:00', price: 255000, status: 'Hoàn thành' },
    { id: 'TXP1245681', customer: 'Phạm Minh Đạo', route: 'BX Miền Tây - Bình Dương', seat: 'B10', time: '13:00', price: 100000, status: 'Hoàn thành' }
  ];

  popularRoutes: PopularRoute[] = [
    { name: 'Bình Dương - BX Miền Đông', bookings: 342, trend: '+12%', trendType: 'up' },
    { name: 'BX Miền Đông - Bình Dương', bookings: 289, trend: '+8%', trendType: 'up' },
    { name: 'Bình Dương - BX Miền Tây', bookings: 231, trend: '-5%', trendType: 'down' },
    { name: 'BX Miền Tây - Bình Dương', bookings: 187, trend: '+15%', trendType: 'up' },
    { name: 'Bình Dương - Bến Cát', bookings: 156, trend: '+3%', trendType: 'up' }
  ];

  getSeatsList(seat: string): string[] {
    if (!seat) return [];
    return seat.split(',').map(s => s.trim());
  }

  getSeatColorClass(seat: string): string {
    if (!seat) return '';
    return seat.startsWith('A') ? 'seat-a' : 'seat-b';
  }
}
