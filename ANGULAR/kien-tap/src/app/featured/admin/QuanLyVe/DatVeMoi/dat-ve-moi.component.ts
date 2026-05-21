import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface Trip {
  id: string;
  route: string;
  fromLoc: string;
  toLoc: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: string;
  vehicleType: string;
  availableSeats: number;
  priceSingle: number;
  priceDouble: number;
  pickupPoints: string[];
  dropoffPoints: string[];
}

export interface MockSeat {
  id: string;
  deck: 'lower' | 'upper';
  row: 'left' | 'right';
  isDouble: boolean;
  status: 'available' | 'sold' | 'selected';
}

@Component({
  selector: 'app-dat-ve-moi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dat-ve-moi.component.html',
  styleUrls: ['./dat-ve-moi.component.css']
})
export class DatVeMoiComponent implements OnInit, OnDestroy {
  // Wizard steps: 1 = Search/Select Trip, 2 = Seat Map & Info, 3 = Payment, 4 = Ticket / Receipt
  currentStep: number = 1;

  // Search parameters
  searchForm = {
    from: 'TP. Hồ Chí Minh',
    to: 'Bình Định',
    date: '2026-05-22',
    ticketCount: 1
  };

  // Locations for search dropdowns
  locations: string[] = [
    'TP. Hồ Chí Minh',
    'Bình Định',
    'Bình Dương',
    'Quy Nhơn',
    'Tuy Hòa',
    'Bến Tre',
    'Nha Trang',
    'Vũng Tàu'
  ];

  // Filters for sidebar
  filters = {
    timeRange: 'all', // 'all', 'morning', 'afternoon', 'night'
    deck: 'all',      // 'all', 'upper', 'lower'
    seatRow: 'all',   // 'all', 'front', 'mid', 'back'
    priceRange: 'all' // 'all', 'under500', 'over500'
  };

  // Master trips collection
  private allTrips: Trip[] = [
    {
      id: 'TXP001',
      route: 'TP. Hồ Chí Minh - Bình Định',
      fromLoc: 'TP. Hồ Chí Minh',
      toLoc: 'Bình Định',
      departureTime: '18:00',
      arrivalTime: '05:00',
      duration: '11 giờ',
      distance: '550Km',
      vehicleType: 'Limousine',
      availableSeats: 12,
      priceSingle: 400000,
      priceDouble: 600000,
      pickupPoints: ['Bến xe Miền Đông Cũ (292 Đinh Bộ Lĩnh)', 'Ngã tư Hàng Xanh', 'Suối Tiên'],
      dropoffPoints: ['Bến xe Quy Nhơn', 'Dọc quốc lộ 1D', 'Văn phòng Quy Nhơn']
    },
    {
      id: 'TXP002',
      route: 'TP. Hồ Chí Minh - Bình Định',
      fromLoc: 'TP. Hồ Chí Minh',
      toLoc: 'Bình Định',
      departureTime: '18:30',
      arrivalTime: '06:30',
      duration: '12 giờ',
      distance: '580Km',
      vehicleType: 'Limousine',
      availableSeats: 15,
      priceSingle: 400000,
      priceDouble: 600000,
      pickupPoints: ['Bến xe Miền Tây (395 Kinh Dương Vương)', 'Khu công nghiệp Tân Bình'],
      dropoffPoints: ['Bến xe Quy Nhơn', 'Ngã 3 Phú Tài']
    },
    {
      id: 'TXP003',
      route: 'TP. Hồ Chí Minh - Bình Định',
      fromLoc: 'TP. Hồ Chí Minh',
      toLoc: 'Bình Định',
      departureTime: '19:00',
      arrivalTime: '06:00',
      duration: '11 giờ',
      distance: '550Km',
      vehicleType: 'Limousine',
      availableSeats: 9,
      priceSingle: 520000,
      priceDouble: 720000,
      pickupPoints: ['Bến xe An Sương (Quốc lộ 22)', 'Cầu vượt Quang Trung'],
      dropoffPoints: ['Bến xe Quy Nhơn', 'Tuy Hòa (Phú Yên)']
    },
    {
      id: 'TXP004',
      route: 'TP. Hồ Chí Minh - Bình Định',
      fromLoc: 'TP. Hồ Chí Minh',
      toLoc: 'Bình Định',
      departureTime: '19:30',
      arrivalTime: '07:30',
      duration: '12 giờ',
      distance: '570Km',
      vehicleType: 'Limousine',
      availableSeats: 10,
      priceSingle: 400000,
      priceDouble: 600000,
      pickupPoints: ['Bến xe Miền Đông Cũ', 'Suối Tiên'],
      dropoffPoints: ['Tuy Hòa (Phú Yên)', 'BX Quy Nhơn']
    },
    {
      id: 'TXP005',
      route: 'TP. Hồ Chí Minh - Bình Định',
      fromLoc: 'TP. Hồ Chí Minh',
      toLoc: 'Bình Định',
      departureTime: '20:00',
      arrivalTime: '07:30',
      duration: '11:30 giờ',
      distance: '540Km',
      vehicleType: 'Limousine',
      availableSeats: 11,
      priceSingle: 520000,
      priceDouble: 720000,
      pickupPoints: ['Bến xe Miền Đông Cũ', 'Ngã tư Bình Phước'],
      dropoffPoints: ['Tuy Hòa (Phú Yên)', 'Bến xe Quy Nhơn']
    },
    {
      id: 'TXP006',
      route: 'Bình Định - TP. Hồ Chí Minh',
      fromLoc: 'Bình Định',
      toLoc: 'TP. Hồ Chí Minh',
      departureTime: '08:00',
      arrivalTime: '19:00',
      duration: '11 giờ',
      distance: '550Km',
      vehicleType: 'Limousine',
      availableSeats: 14,
      priceSingle: 400000,
      priceDouble: 600000,
      pickupPoints: ['Bến xe Quy Nhơn', 'Ngã 3 Phú Tài'],
      dropoffPoints: ['Bến xe Miền Đông', 'Ngã tư Hàng Xanh']
    },
    {
      id: 'TXP007',
      route: 'TP. Hồ Chí Minh - Vũng Tàu',
      fromLoc: 'TP. Hồ Chí Minh',
      toLoc: 'Vũng Tàu',
      departureTime: '07:00',
      arrivalTime: '09:30',
      duration: '2:30 giờ',
      distance: '120Km',
      vehicleType: 'Limousine Vip',
      availableSeats: 8,
      priceSingle: 220000,
      priceDouble: 350000,
      pickupPoints: ['Văn phòng Quận 1', 'Hầm Thủ Thiêm'],
      dropoffPoints: ['Văn phòng Vũng Tàu', 'Nội thành Vũng Tàu']
    }
  ];

  // List of filtered trips shown to the user
  filteredTrips: Trip[] = [];
  searchPerformed: boolean = false;

  // Selected trip, seats, and form details
  selectedTrip: Trip | null = null;
  seats: MockSeat[] = [];
  selectedSeats: string[] = [];

  // Customer information form
  customerInfo = {
    name: '',
    phone: '',
    email: '',
    pickupPoint: '',
    dropoffPoint: '',
    note: ''
  };

  // Payment configuration
  paymentMethod: string = 'vietqr'; // 'vietqr', 'momo', 'vnpay', 'zalopay', 'atm', 'visa', 'cash'
  vietqrCountdown: number = 900;    // 15:00 minutes
  countdownTimer: any;
  ticketId: string = '';
  ticketStatus: 'Chờ thanh toán' | 'Chờ xác nhận' | 'Đã thanh toán' = 'Chờ thanh toán';
  paymentDate: Date = new Date();

  // Search History for rapid clicking
  searchHistory = [
    { from: 'TP. Hồ Chí Minh', to: 'Bình Định', date: '22/05/2026' },
    { from: 'TP. Hồ Chí Minh', to: 'Phú Yên', date: '23/05/2026' }
  ];

  constructor() {}

  ngOnInit() {
    // Perform initial automatic search to populate listings for demo
    this.searchTrips();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  // Task 1: Trip Filtering & Searching
  searchTrips() {
    this.searchPerformed = true;
    this.filteredTrips = this.allTrips.filter(t => {
      const matchRoute = t.fromLoc.toLowerCase() === this.searchForm.from.toLowerCase() &&
                         t.toLoc.toLowerCase() === this.searchForm.to.toLowerCase();
      
      if (!matchRoute) return false;

      // Filter by departure time range
      if (this.filters.timeRange !== 'all') {
        const hour = parseInt(t.departureTime.split(':')[0]);
        if (this.filters.timeRange === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (this.filters.timeRange === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (this.filters.timeRange === 'night' && (hour < 18 && hour >= 0)) return false;
        if (this.filters.timeRange === 'early_morning' && (hour >= 6)) return false; // 00:00 - 06:00
      }

      // Filter by price range
      if (this.filters.priceRange !== 'all') {
        if (this.filters.priceRange === 'under500' && t.priceSingle >= 500000) return false;
        if (this.filters.priceRange === 'over500' && t.priceSingle < 500000) return false;
      }

      return true;
    });
  }

  quickSearch(hist: any) {
    this.searchForm.from = hist.from;
    this.searchForm.to = hist.to;
    // Format date from DD/MM/YYYY to YYYY-MM-DD
    const parts = hist.date.split('/');
    if (parts.length === 3) {
      this.searchForm.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    this.searchTrips();
  }

  swapDestinations() {
    const temp = this.searchForm.from;
    this.searchForm.from = this.searchForm.to;
    this.searchForm.to = temp;
    this.searchTrips();
  }

  updateFilters(type: string, value: string) {
    (this.filters as any)[type] = value;
    this.searchTrips();
  }

  resetFilters() {
    this.filters = {
      timeRange: 'all',
      deck: 'all',
      seatRow: 'all',
      priceRange: 'all'
    };
    this.searchTrips();
  }

  // Task 2: Trip selection and Seat map population
  selectTrip(trip: Trip) {
    this.selectedTrip = trip;
    this.generateSeatMap();
    this.selectedSeats = [];
    this.customerInfo.pickupPoint = trip.pickupPoints[0];
    this.customerInfo.dropoffPoint = trip.dropoffPoints[0];
    this.currentStep = 2;
  }

  generateSeatMap() {
    const list: MockSeat[] = [];
    // Lower Deck: 1A - 12A. Row Left (A1, A3, A5, A7, A9, A11), Row Right (A2, A4, A6, A8, A10, A12)
    // Upper Deck: 1B - 10B. Row Left (B1, B3, B5, B7, B9), Row Right (B2, B4, B6, B8, B10)
    // We make 11A, 12A, 9B, 10B Double Seats (phòng đôi)
    
    // Lower Deck
    for (let i = 1; i <= 12; i++) {
      const isDouble = (i === 11 || i === 12);
      const isLeft = (i % 2 !== 0);
      
      // Seed some sold seats randomly for realism
      let status: 'available' | 'sold' = 'available';
      if (i === 2 || i === 3 || i === 5 || i === 10) {
        status = 'sold';
      }

      list.push({
        id: `${i}A`,
        deck: 'lower',
        row: isLeft ? 'left' : 'right',
        isDouble,
        status
      });
    }

    // Upper Deck
    for (let i = 1; i <= 10; i++) {
      const isDouble = (i === 9 || i === 10);
      const isLeft = (i % 2 !== 0);
      
      let status: 'available' | 'sold' = 'available';
      if (i === 3 || i === 6) {
        status = 'sold';
      }

      list.push({
        id: `${i}B`,
        deck: 'upper',
        row: isLeft ? 'left' : 'right',
        isDouble,
        status
      });
    }

    this.seats = list;
  }

  // Filter seats based on current deck filter
  getSeatsByDeck(deck: 'lower' | 'upper') {
    return this.seats.filter(s => s.deck === deck);
  }

  getSeatsByDeckAndRow(deck: 'lower' | 'upper', row: 'left' | 'right') {
    return this.seats.filter(s => s.deck === deck && s.row === row);
  }

  toggleSeat(seat: MockSeat) {
    if (seat.status === 'sold') return;

    if (seat.status === 'selected') {
      seat.status = 'available';
      this.selectedSeats = this.selectedSeats.filter(id => id !== seat.id);
    } else {
      seat.status = 'selected';
      this.selectedSeats.push(seat.id);
    }
  }

  getSeatPrice(seatId: string): number {
    if (!this.selectedTrip) return 0;
    const isDouble = seatId.endsWith('A') 
      ? (seatId === '11A' || seatId === '12A') 
      : (seatId === '9B' || seatId === '10B');
    return isDouble ? this.selectedTrip.priceDouble : this.selectedTrip.priceSingle;
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((sum, seatId) => sum + this.getSeatPrice(seatId), 0);
  }

  // Continue to step 3
  submitCustomerInfo() {
    if (this.selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế ngồi để tiếp tục!');
      return;
    }
    if (!this.customerInfo.name.trim()) {
      alert('Vui lòng nhập họ và tên khách hàng!');
      return;
    }
    if (!this.customerInfo.phone.trim()) {
      alert('Vui lòng nhập số điện thoại khách hàng!');
      return;
    }

    // Set countdown and move to step 3
    this.currentStep = 3;
    if (this.paymentMethod === 'vietqr') {
      this.startQrCountdown();
    }
  }

  // Step 3: Payment
  selectPaymentMethod(method: string) {
    this.paymentMethod = method;
    if (method === 'vietqr') {
      this.startQrCountdown();
    } else {
      this.stopTimer();
    }
  }

  startQrCountdown() {
    this.stopTimer();
    this.vietqrCountdown = 900; // Reset to 15:00 minutes
    this.countdownTimer = setInterval(() => {
      if (this.vietqrCountdown > 0) {
        this.vietqrCountdown--;
      } else {
        this.stopTimer();
        alert('Hết thời gian giữ chỗ thanh toán trực tuyến! Vui lòng thực hiện lại.');
        this.currentStep = 2;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  getFormattedCountdown(): string {
    const mins = Math.floor(this.vietqrCountdown / 60);
    const secs = this.vietqrCountdown % 60;
    return `${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
  }

  // Complete Online Payment (Simulation)
  completePaymentOnline() {
    this.stopTimer();
    this.ticketId = 'TXP' + Math.floor(10000000 + Math.random() * 89999999).toString();
    this.ticketStatus = 'Đã thanh toán';
    this.paymentDate = new Date();
    this.currentStep = 4;
  }

  // Book with Cash (Needs Confirmation)
  completePaymentCash() {
    this.stopTimer();
    this.ticketId = 'TXP' + Math.floor(10000000 + Math.random() * 89999999).toString();
    // Cash starts in 'Chờ xác nhận' state
    this.ticketStatus = 'Chờ xác nhận';
    this.paymentDate = new Date();
    this.currentStep = 4;
  }

  // Confirm cash collected from customer
  confirmCashCollected() {
    if (confirm('Bạn có chắc chắn muốn xác nhận đã THU ĐỦ TIỀN MẶT của khách hàng này không?')) {
      this.ticketStatus = 'Đã thanh toán';
      this.paymentDate = new Date();
      alert('Đã cập nhật trạng thái vé: ĐÃ THANH TOÁN thành công!');
    }
  }

  // PDF Export
  exportPDF() {
    alert(`Đang khởi tạo tệp PDF hóa đơn thanh toán cho Vé ${this.ticketId}...\nTải xuống thành công!`);
  }

  // Print ticket details
  printTicket() {
    window.print();
  }

  // Reset to book another ticket
  resetBooking() {
    this.currentStep = 1;
    this.selectedTrip = null;
    this.selectedSeats = [];
    this.seats = [];
    this.customerInfo = {
      name: '',
      phone: '',
      email: '',
      pickupPoint: '',
      dropoffPoint: '',
      note: ''
    };
    this.paymentMethod = 'vietqr';
    this.ticketId = '';
    this.ticketStatus = 'Chờ thanh toán';
    this.searchTrips();
  }

  // Format currencies in VND
  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + 'đ';
  }
}
