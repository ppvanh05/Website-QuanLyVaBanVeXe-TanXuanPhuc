import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RouteSummaryItem {
  tuyen: string;
  slVeNhaXe: number;
  slVeDaiLy: number;
  chietKhauDaiLy: number; // money
  tongTienGiaVe: number;
  tongTienThucThu: number;
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
    route: 'Tất cả'
  };

  allSummaries: RouteSummaryItem[] = [];
  filteredSummaries: RouteSummaryItem[] = [];

  routesList = [
    'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
    'Gia Lai ↔ Bình Dương (BX Bến Cát)',
    'Bình Định ↔ Sài Gòn (BX Miền Tây)',
    'Phú Yên ↔ Sài Gòn (BX Miền Đông)'
  ];

  // Totals for summary row
  totals = {
    slVeNhaXe: 0,
    slVeDaiLy: 0,
    chietKhauDaiLy: 0,
    tongTienGiaVe: 0,
    tongTienThucThu: 0
  };

  ngOnInit() {
    this.generateMockSummaries();
    this.onViewReport();
  }

  private generateMockSummaries() {
    // Generate realistic, consistent figures based on routes for Tân Xuân Phúc
    this.allSummaries = [
      {
        tuyen: 'Gia Lai ↔ Sài Gòn (BX Miền Đông)',
        slVeNhaXe: 245,
        slVeDaiLy: 68,
        chietKhauDaiLy: 2380000, // 35k commission per ticket
        tongTienGiaVe: 109550000, // (245+68) * 350,000
        tongTienThucThu: 107170000 // tongTienGiaVe - chietKhauDaiLy
      },
      {
        tuyen: 'Gia Lai ↔ Bình Dương (BX Bến Cát)',
        slVeNhaXe: 182,
        slVeDaiLy: 42,
        chietKhauDaiLy: 1470000, // 35k commission per ticket
        tongTienGiaVe: 78400000, // (182+42) * 350,000
        tongTienThucThu: 76930000
      },
      {
        tuyen: 'Bình Định ↔ Sài Gòn (BX Miền Tây)',
        slVeNhaXe: 310,
        slVeDaiLy: 95,
        chietKhauDaiLy: 2850000, // 30k commission per ticket
        tongTienGiaVe: 121500000, // (310+95) * 300,000
        tongTienThucThu: 118650000
      },
      {
        tuyen: 'Phú Yên ↔ Sài Gòn (BX Miền Đông)',
        slVeNhaXe: 148,
        slVeDaiLy: 27,
        chietKhauDaiLy: 6750000, // 250k discount for agents or promo
        tongTienGiaVe: 49000000, // (148+27) * 280,000
        tongTienThucThu: 42250000
      }
    ];
  }

  onViewReport() {
    // Dynamic filter based on selected route
    this.filteredSummaries = this.allSummaries.filter(item => {
      if (this.filters.route !== 'Tất cả' && item.tuyen !== this.filters.route) return false;
      return true;
    });

    this.calculateTotals();
  }

  private calculateTotals() {
    let slVeNhaXe = 0;
    let slVeDaiLy = 0;
    let chietKhauDaiLy = 0;
    let tongTienGiaVe = 0;
    let tongTienThucThu = 0;

    this.filteredSummaries.forEach(item => {
      slVeNhaXe += item.slVeNhaXe;
      slVeDaiLy += item.slVeDaiLy;
      chietKhauDaiLy += item.chietKhauDaiLy;
      tongTienGiaVe += item.tongTienGiaVe;
      tongTienThucThu += item.tongTienThucThu;
    });

    this.totals = {
      slVeNhaXe,
      slVeDaiLy,
      chietKhauDaiLy,
      tongTienGiaVe,
      tongTienThucThu
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      route: 'Tất cả'
    };
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
    csvContent += `Tuyến: ${this.filters.route}\n\n`;
    
    csvContent += 'Tuyến xe,SL vé nhà xe đã bán,SL vé đại lý đã bán,Chiết khấu đại lý (VNĐ),Tổng tiền giá vé (VNĐ),Tổng tiền thực thu (VNĐ)\n';

    this.filteredSummaries.forEach(item => {
      csvContent += `"${item.tuyen}",${item.slVeNhaXe},${item.slVeDaiLy},${item.chietKhauDaiLy},${item.tongTienGiaVe},${item.tongTienThucThu}\n`;
    });

    // Summary Row
    csvContent += `\n"TỔNG (VNĐ)",${this.totals.slVeNhaXe},${this.totals.slVeDaiLy},${this.totals.chietKhauDaiLy},${this.totals.tongTienGiaVe},${this.totals.tongTienThucThu}\n`;

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
