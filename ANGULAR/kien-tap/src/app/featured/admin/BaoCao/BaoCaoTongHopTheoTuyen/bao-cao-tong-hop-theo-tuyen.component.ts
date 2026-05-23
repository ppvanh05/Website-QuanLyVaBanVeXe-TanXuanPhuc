import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuyenXeService } from '../../QuanLyDieuHanh/tuyen-xe.service';

interface RouteSummaryItem {
  maTuyen: string;
  tuyen: string;
  khoangCachThoiGian: string;
  slChuyenChay: number;
  slVeDaBan: number;
  tyLeLapDay: number;
  tongDoanhThu: number;
  tongChiPhiVanHanh: number; // New field
  loiNhuanTuyen: number; // New field
  doanhThuTrungBinhChuyen: number; // New field
  loiNhuanTrungBinhChuyen: number; // New field
  trangThai: 'Đang hoạt động' | 'Ngừng hoạt động';
}

@Component({
  selector: 'app-bao-cao-tong-hop-theo-tuyen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-tong-hop-theo-tuyen.component.html',
  styleUrls: ['./bao-cao-tong-hop-theo-tuyen.component.css']
})
export class BaoCaoTongHopTheoTuyenComponent implements OnInit {
  filters = {
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    route: 'Tất cả',
    status: 'Tất cả'
  };

  allSummaries: RouteSummaryItem[] = [];
  filteredSummaries: RouteSummaryItem[] = [];
  isReportViewed = true;

  routesList: string[] = [];

  // Totals for summary row
  totals = {
    slChuyenChay: 0,
    slVeDaBan: 0,
    tongDoanhThu: 0,
    tongChiPhiVanHanh: 0,
    loiNhuanTuyen: 0,
    tyLeLapDayTrungBinh: 0,
    doanhThuTrungBinhChuyen: 0,
    loiNhuanTrungBinhChuyen: 0
  };

  constructor(private tuyenXeService: TuyenXeService) {}

  ngOnInit() {
    this.routesList = this.tuyenXeService.getRoutesList();
    this.generateMockSummaries();
    this.onViewReport();
  }

  private generateMockSummaries() {
    const sysRoutes = this.tuyenXeService.getRoutes();
    this.allSummaries = sysRoutes.map((route, i) => {
      const maTuyen = `TX${String(route.id).padStart(2, '0')}`;
      const duration = `${route.estimatedHours}h${route.estimatedMinutes ? route.estimatedMinutes + 'm' : ''}`;
      const khoangCachThoiGian = `${route.distance} km / ${duration}`;
      
      const slChuyenChay = 20 + (i * 7) % 35;
      const slVeDaBan = slChuyenChay * (15 + (i * 3) % 8);
      
      const maxSeats = slChuyenChay * 22;
      const tyLeLapDay = Math.min(100, Math.round((slVeDaBan / maxSeats) * 100));
      const singleFare = route.distance * 1000;
      const tongDoanhThu = slVeDaBan * singleFare;

      // Mocking operational costs (e.g., 30-50% of revenue)
      const tongChiPhiVanHanh = Math.round(tongDoanhThu * (0.3 + (i % 3) * 0.05));
      const loiNhuanTuyen = tongDoanhThu - tongChiPhiVanHanh;

      const doanhThuTrungBinhChuyen = slChuyenChay > 0 ? tongDoanhThu / slChuyenChay : 0;
      const loiNhuanTrungBinhChuyen = slChuyenChay > 0 ? loiNhuanTuyen / slChuyenChay : 0;

      const trangThai = route.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động';

      return {
        maTuyen,
        tuyen: route.name,
        khoangCachThoiGian,
        slChuyenChay,
        slVeDaBan,
        tyLeLapDay,
        tongDoanhThu,
        tongChiPhiVanHanh,
        loiNhuanTuyen,
        doanhThuTrungBinhChuyen,
        loiNhuanTrungBinhChuyen,
        trangThai
      };
    });
  }

  onViewReport() {
    this.isReportViewed = true;
    this.filteredSummaries = this.allSummaries.filter(item => {
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;
      if (this.filters.status !== 'Tất cả') {
        const filterStatus = this.filters.status === 'Hoạt động' ? 'Đang hoạt động' : 'Ngừng hoạt động';
        if (item.trangThai !== filterStatus) return false;
      }
      return true;
    });

    this.calculateTotals();
  }

  private calculateTotals() {
    let slChuyenChay = 0;
    let slVeDaBan = 0;
    let tongDoanhThu = 0;
    let tongChiPhiVanHanh = 0;
    let loiNhuanTuyen = 0;
    let sumTyLeLapDay = 0;
    let sumDoanhThuTrungBinhChuyen = 0;
    let sumLoiNhuanTrungBinhChuyen = 0;

    this.filteredSummaries.forEach(item => {
      slChuyenChay += item.slChuyenChay;
      slVeDaBan += item.slVeDaBan;
      tongDoanhThu += item.tongDoanhThu;
      tongChiPhiVanHanh += item.tongChiPhiVanHanh;
      loiNhuanTuyen += item.loiNhuanTuyen;
      sumTyLeLapDay += item.tyLeLapDay;
      sumDoanhThuTrungBinhChuyen += item.doanhThuTrungBinhChuyen;
      sumLoiNhuanTrungBinhChuyen += item.loiNhuanTrungBinhChuyen;
    });

    this.totals = {
      slChuyenChay,
      slVeDaBan,
      tongDoanhThu,
      tongChiPhiVanHanh,
      loiNhuanTuyen,
      tyLeLapDayTrungBinh: this.filteredSummaries.length > 0 
        ? Math.round(sumTyLeLapDay / this.filteredSummaries.length) 
        : 0,
      doanhThuTrungBinhChuyen: this.filteredSummaries.length > 0
        ? sumDoanhThuTrungBinhChuyen / this.filteredSummaries.length
        : 0,
      loiNhuanTrungBinhChuyen: this.filteredSummaries.length > 0
        ? sumLoiNhuanTrungBinhChuyen / this.filteredSummaries.length
        : 0
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả',
      status: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredSummaries.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO TỔNG HỢP VÉ BÁN THEO TUYẾN (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Tuyến: ${this.filters.route}\n`;
    csvContent += `Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã tuyến,Tên tuyến,Cự ly & Thời gian,Số chuyến đã chạy,Số vé đã bán,Lấp đầy TB (%),Doanh thu (VNĐ),Chi phí vận hành (VNĐ),Lợi nhuận tuyến (VNĐ),Doanh thu TB/chuyến (VNĐ),Lợi nhuận TB/chuyến (VNĐ),Trạng thái\n';

    this.filteredSummaries.forEach(item => {
      csvContent += `"${item.maTuyen}","${item.tuyen}","${item.khoangCachThoiGian}",${item.slChuyenChay},${item.slVeDaBan},${item.tyLeLapDay}%,${item.tongDoanhThu},${item.tongChiPhiVanHanh},${item.loiNhuanTuyen},${item.doanhThuTrungBinhChuyen},${item.loiNhuanTrungBinhChuyen},"${item.trangThai}"\n`;
    });

    // Summary Row
    csvContent += `\n"TỔNG CỘNG",,${this.totals.slChuyenChay},${this.totals.slVeDaBan},${this.totals.tyLeLapDayTrungBinh}%,${this.totals.tongDoanhThu},${this.totals.tongChiPhiVanHanh},${this.totals.loiNhuanTuyen},${this.totals.doanhThuTrungBinhChuyen},${this.totals.loiNhuanTrungBinhChuyen},\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTongHopTuyen_TXP_${this.filters.fromDate}_to_${this.filters.toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
