import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down';
  icon: string;
  color: string;
}

interface Booking {
  id: string;
  customer: string;
  route: string;
  seat: string;
  time: string;
  price: string;
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
  imports: [CommonModule],
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
      icon: 'confirmation_number',
      color: '#00bfa5'
    },
    { 
      title: 'Doanh thu tháng này', 
      value: '145M', 
      trend: '+8.2% so với tháng trước', 
      trendType: 'up',
      icon: 'payments',
      color: '#f37021'
    },
    { 
      title: 'Khách hàng mới', 
      value: '342', 
      trend: '-3.1% so với tháng trước', 
      trendType: 'down',
      icon: 'person_add',
      color: '#0097a7'
    },
    { 
      title: 'Phương tiện hoạt động', 
      value: '28/32', 
      trend: 'Tỉ lệ vận hành 87%', 
      trendType: 'up',
      icon: 'directions_bus',
      color: '#f37021'
    }
  ];

  bookings: Booking[] = [
    { id: 'TXP1245678', customer: 'Nguyễn Văn A', route: 'TP HCM - Bình Dương', seat: 'A1, A2', time: '06:00', price: '170,000đ', status: 'Hoàn thành' },
    { id: 'TXP1245679', customer: 'Trần Thị B', route: 'TP HCM - Bình Dương', seat: 'B3', time: '08:30', price: '95,000đ', status: 'Đang chờ' },
    { id: 'TXP1245680', customer: 'Lê Văn C', route: 'TP HCM - Bình Dương', seat: 'A5, A6, A7', time: '10:00', price: '255,000đ', status: 'Hoàn thành' },
    { id: 'TXP1245681', customer: 'Phạm Thị D', route: 'TP HCM - Bình Dương', seat: 'B10', time: '13:00', price: '100,000đ', status: 'Hoàn thành' }
  ];

  popularRoutes: PopularRoute[] = [
    { name: 'TP HCM - Bình Dương', bookings: 342, trend: '+12%', trendType: 'up' },
    { name: 'TP HCM - Đồng Nai', bookings: 289, trend: '+8%', trendType: 'up' },
    { name: 'TP HCM - Long An', bookings: 231, trend: '-5%', trendType: 'down' },
    { name: 'TP HCM - Tây Ninh', bookings: 187, trend: '+15%', trendType: 'up' },
    { name: 'TP HCM - Bà Rịa', bookings: 156, trend: '+3%', trendType: 'up' }
  ];
}
