import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService } from '../../QuanLyDieuHanh/tuyen-xe.service';
import { PhuongTienService } from '../../QuanLyDieuHanh/phuong-tien.service';
import { TaiXeService } from '../../QuanLyDieuHanh/tai-xe.service'; // Import TaiXeService

interface TripReportItem {
  maChuyen: string;
  tuyen: string;
  bienSoXe: string;
  loaiXe: string;
  ngayDi: string;
  gioDi: string;
  slDaBan: number;
  tongGhe: number;
  tyLeLapDay: number;
  doanhThuVe: number;
  chiPhiVanHanh: number;
  loiNhuan: number;
  trangThai: 'Còn chỗ' | 'Hết chỗ' | 'Đã khởi hành' | 'Hủy';
  
  // New fields for enhanced analysis
  taiXeChinh: string;
  phuXe: string;
  diemDanhGiaTrungBinh: number; // Average rating from customers for this trip
  soLuongDanhGiaTieuCuc: number; // Number of negative reviews
  tyLeDongGopDoanhThuTuyen: number; // Percentage contribution to route revenue

  // Detailed Expenses
  phiCauDuong: number;
  phiDau: number;
  phiRuaXe: number;
  phiAnUong: number;
  phiBenBai: number;
}

@Component({
  selector: 'app-bao-cao-chi-tiet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-chi-tiet.component.html',
  styleUrls: ['./bao-cao-chi-tiet.component.css']
})
export class BaoCaoChiTietComponent implements OnInit {
  // Date and filter options
  filters = {
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    route: 'Tất cả',
    licensePlate: 'Tất cả',
    status: 'Tất cả'
  };

  isReportViewed = true;

  // Data lists
  allTrips: TripReportItem[] = [];
  filteredTrips: TripReportItem[] = [];
  
  // Lists for dropdown options
  routesList: string[] = [];
  vehiclesList: string[] = [];
  statusList = ['Còn chỗ', 'Hết chỗ', 'Đã khởi hành', 'Hủy'];

  // Modal controls
  showExpenseModal = false;
  selectedTrip: TripReportItem | null = null;

  // Pagination variables
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Stats summaries
  stats = {
    totalTrips: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0
  };

  constructor(
    private tuyenXeService: TuyenXeService,
    private phuongTienService: PhuongTienService,
    private taiXeService: TaiXeService // Inject TaiXeService
  ) {}

  ngOnInit() {
    this.routesList = this.tuyenXeService.getRoutesList();
    this.vehiclesList = this.phuongTienService.getVehicles().map(v => v.licensePlate);
    this.allTrips = this.generateMockData();
    this.onViewReport();
  }

  private generateMockData(): TripReportItem[] {
    const data: TripReportItem[] = [];
    const sysRoutes = this.tuyenXeService.getRoutes();
    const sysVehicles = this.phuongTienService.getVehicles();
    const sysDrivers = this.taiXeService.getDrivers(); // Get drivers
    const sysAssistants = this.taiXeService.getAssistantsList(); // Get assistants
    
    if (sysRoutes.length === 0 || sysVehicles.length === 0 || sysDrivers.length === 0 || sysAssistants.length === 0) return [];

    const tripStatuses: ('Còn chỗ' | 'Hết chỗ' | 'Đã khởi hành' | 'Hủy')[] = ['Còn chỗ', 'Hết chỗ', 'Đã khởi hành', 'Hủy'];

    // Generate 60 trip records in May 2026
    for (let i = 1; i <= 60; i++) {
      const route = sysRoutes[i % sysRoutes.length];
      const vehicle = sysVehicles[(i * 3) % sysVehicles.length];
      const driver = sysDrivers[i % sysDrivers.length];
      const assistant = sysAssistants[(i + 1) % sysAssistants.length];
      
      const day = (i % 28) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const ngayDi = `2026-05-${dayStr}`;
      
      const times = ['08:00', '13:00', '19:00', '21:00'];
      const gioDi = times[i % times.length];

      const tongGhe = vehicle.seats;
      let trangThai = tripStatuses[i % tripStatuses.length];
      
      let slDaBan = 0;
      if (trangThai === 'Hết chỗ') {
        slDaBan = tongGhe;
      } else if (trangThai === 'Hủy') {
        slDaBan = 0;
      } else if (trangThai === 'Còn chỗ') {
        slDaBan = Math.floor(tongGhe * 0.4) + (i % 6);
      } else { // Đã khởi hành
        slDaBan = Math.floor(tongGhe * 0.7) + (i % 5);
      }

      const tyLeLapDay = Math.min(100, Math.round((slDaBan / tongGhe) * 100));

      // Calculate total revenue from tickets (ticket price = distance * 1000)
      const singleFare = route.distance * 1000;
      const doanhThuVe = slDaBan * singleFare;

      // Expenses breakdown based on route distance
      const baseDistance = route.distance;
      let phiDau = 0;
      let phiCauDuong = 0;
      let phiRuaXe = 0;
      let phiAnUong = 0;
      let phiBenBai = 0;
      let chiPhiVanHanh = 0;

      if (trangThai !== 'Hủy') {
        phiDau = Math.round(baseDistance * 12 * 20000 / 100); // ~12L per 100km, 20k per L
        phiCauDuong = Math.round(baseDistance * 800);
        phiRuaXe = 150000;
        phiAnUong = 300000;
        phiBenBai = 200000;
        chiPhiVanHanh = phiDau + phiCauDuong + phiRuaXe + phiAnUong + phiBenBai;
      }

      const loiNhuan = doanhThuVe - chiPhiVanHanh;

      // New fields
      const taiXeChinh = driver.name;
      const phuXe = assistant.name;
      const diemDanhGiaTrungBinh = Math.round(Math.random() * (5 - 3) + 3); // Random rating between 3 and 5
      const soLuongDanhGiaTieuCuc = i % 7 === 0 ? 1 : 0; // Mock some negative reviews
      const tyLeDongGopDoanhThuTuyen = Math.round((doanhThuVe / (route.distance * 1000 * 100)) * 10000) / 100; // Mock percentage

      data.push({
        maChuyen: `LT-2605-${String(i).padStart(3, '0')}`,
        tuyen: route.name,
        bienSoXe: vehicle.licensePlate,
        loaiXe: vehicle.type,
        ngayDi: ngayDi,
        gioDi: gioDi,
        slDaBan: slDaBan,
        tongGhe: tongGhe,
        tyLeLapDay: tyLeLapDay,
        doanhThuVe: doanhThuVe,
        chiPhiVanHanh: chiPhiVanHanh,
        loiNhuan: loiNhuan,
        trangThai: trangThai,
        phiCauDuong: phiCauDuong,
        phiDau: phiDau,
        phiRuaXe: phiRuaXe,
        phiAnUong: phiAnUong,
        phiBenBai: phiBenBai,
        taiXeChinh: taiXeChinh,
        phuXe: phuXe,
        diemDanhGiaTrungBinh: diemDanhGiaTrungBinh,
        soLuongDanhGiaTieuCuc: soLuongDanhGiaTieuCuc,
        tyLeDongGopDoanhThuTuyen: tyLeDongGopDoanhThuTuyen
      });
    }

    // Sort by departure date descending, then departure time descending
    return data.sort((a, b) => {
      if (a.ngayDi !== b.ngayDi) {
        return b.ngayDi.localeCompare(a.ngayDi);
      }
      return b.gioDi.localeCompare(a.gioDi);
    });
  }

  onViewReport() {
    this.isReportViewed = true;
    this.filteredTrips = this.allTrips.filter(item => {
      // Date filter
      if (this.filters.fromDate && item.ngayDi < this.filters.fromDate) return false;
      if (this.filters.toDate && item.ngayDi > this.filters.toDate) return false;

      // Advanced filters
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;
      if (this.filters.licensePlate !== 'Tất cả' && item.bienSoXe !== this.filters.licensePlate) return false;
      if (this.filters.status !== 'Tất cả' && item.trangThai !== this.filters.status) return false;

      return true;
    });

    // Calculate summaries
    this.calculateStats();
    
    // Reset pagination
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  private calculateStats() {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    let totalTrips = 0;

    this.filteredTrips.forEach(item => {
      totalRevenue += item.doanhThuVe;
      totalExpenses += item.chiPhiVanHanh;
      totalProfit += item.loiNhuan;
      totalTrips++;
    });

    this.stats = {
      totalTrips: totalTrips,
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      totalProfit: totalProfit
    };
  }



  private calculateTotalPages() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredTrips.length / this.pageSize));
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTrips.slice(start, start + this.pageSize);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers() {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả',
      licensePlate: 'Tất cả',
      status: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  // Modal actions
  openExpenseDetail(trip: TripReportItem) {
    this.selectedTrip = trip;
    this.showExpenseModal = true;
  }

  closeExpenseDetail() {
    this.showExpenseModal = false;
    this.selectedTrip = null;
  }

  onExportExcel() {
    if (this.filteredTrips.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO THỐNG KÊ CHI TIẾT THEO CHUYẾN XE (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Tuyến: ${this.filters.route}, Biển số xe: ${this.filters.licensePlate}, Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã chuyến,Tuyến xe,Biển số xe,Loại xe,Ngày đi,Giờ đi,SL đã bán,Tổng ghế,Tỷ lệ lấp đầy (%),Doanh thu vé (VNĐ),Chi phí vận hành (VNĐ),Lợi nhuận (VNĐ),Trạng thái,Tài xế chính,Phụ xe,Điểm đánh giá TB,SL đánh giá tiêu cực,Tỷ lệ đóng góp DT tuyến (%)\n';

    this.filteredTrips.forEach(item => {
      csvContent += `"${item.maChuyen}","${item.tuyen}","${item.bienSoXe}","${item.loaiXe}","${item.ngayDi}","${item.gioDi}",${item.slDaBan},${item.tongGhe},${item.tyLeLapDay}%,${item.doanhThuVe},${item.chiPhiVanHanh},${item.loiNhuan},"${item.trangThai}","${item.taiXeChinh}","${item.phuXe}",${item.diemDanhGiaTrungBinh},${item.soLuongDanhGiaTieuCuc},${item.tyLeDongGopDoanhThuTuyen}\n`;
    });

    // Summary Row
    csvContent += `\n"TỔNG CỘNG",,,,,,,${this.stats.totalTrips},,"Tổng doanh thu",${this.stats.totalRevenue},"Tổng chi phí",${this.stats.totalExpenses},"Tổng lợi nhuận",${this.stats.totalProfit}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoChiTietChuyenXe_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
