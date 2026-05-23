import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RefundReportItem {
  maVe: string;
  nguoiHuy: string; // Source of cancellation (e.g., "Khách hàng tự hủy trên web", "Nhân viên bán vé hủy hộ")
  tienGoc: number; // Original ticket price
  tyLePhi: number; // Cancellation fee percentage
  lePhiHuy: number; // Cancellation fee amount
  tienHoan: number; // Refund amount
  maGiaoDich: string; // Transaction ID for refund
  ngayHuy: string; // Cancellation date for filtering
}

@Component({
  selector: 'app-bao-cao-hoan-huy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-hoan-huy.component.html',
  styleUrls: ['./bao-cao-hoan-huy.component.css']
})
export class BaoCaoHoanHuyComponent implements OnInit {
  filters = {
    fromDate: '2026-05-01',
    toDate: '2026-05-31',
    nguoiHuy: 'Tất cả'
  };

  allRefunds: RefundReportItem[] = [];
  filteredRefunds: RefundReportItem[] = [];
  isReportViewed = true;

  // KPI stats
  stats = {
    totalCancelled: 0,
    totalOriginalPrice: 0,
    totalFees: 0,
    totalRefunded: 0
  };

  nguoiHuyList: string[] = ['Khách hàng tự hủy trên web', 'Nhân viên bán vé hủy hộ'];

  constructor() {}

  ngOnInit() {
    this.allRefunds = this.generateMockRefunds();
    this.onViewReport();
  }

  private generateMockRefunds(): RefundReportItem[] {
    const data: RefundReportItem[] = [];
    const nguoiHuyOptions = ['Khách hàng tự hủy trên web', 'Nhân viên bán vé hủy hộ'];

    for (let i = 1; i <= 30; i++) { // Generate 30 mock cancellation records
      const maVe = `TXP${String(10000 + i)}`;
      const nguoiHuy = nguoiHuyOptions[i % nguoiHuyOptions.length];
      const tienGoc = Math.floor(Math.random() * (500000 - 100000 + 1) + 100000); // Random original price between 100k and 500k

      let tyLePhi: number;
      // Mock cancellation fee based on some logic (e.g., time before departure, or source)
      if (nguoiHuy === 'Khách hàng tự hủy trên web') {
        if (i % 5 === 0) tyLePhi = 0; // 0% fee
        else if (i % 5 === 1) tyLePhi = 0.1; // 10% fee
        else if (i % 5 === 2) tyLePhi = 0.25; // 25% fee
        else if (i % 5 === 3) tyLePhi = 0.5; // 50% fee
        else tyLePhi = 1; // 100% fee
      } else { // Nhân viên bán vé hủy hộ
        if (i % 3 === 0) tyLePhi = 0; // 0% fee (e.g., company cancellation)
        else if (i % 3 === 1) tyLePhi = 0.05; // 5% fee (e.g., administrative)
        else tyLePhi = 0.1; // 10% fee
      }

      const lePhiHuy = tienGoc * tyLePhi;
      const tienHoan = tienGoc - lePhiHuy;
      const maGiaoDich = `GD${Date.now()}${String(i).padStart(3, '0')}`;

      const day = (i % 28) + 1; // Day in May
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const ngayHuy = `2026-05-${dayStr}`;

      data.push({
        maVe,
        nguoiHuy,
        tienGoc,
        tyLePhi,
        lePhiHuy,
        tienHoan,
        maGiaoDich,
        ngayHuy
      });
    }

    return data.sort((a, b) => b.ngayHuy.localeCompare(a.ngayHuy));
  }

  onViewReport() {
    this.isReportViewed = true;
    this.filteredRefunds = this.allRefunds.filter(item => {
      // Date filter
      if (this.filters.fromDate && item.ngayHuy < this.filters.fromDate) return false;
      if (this.filters.toDate && item.ngayHuy > this.filters.toDate) return false;

      // Nguoi Huy filter
      if (this.filters.nguoiHuy !== 'Tất cả' && item.nguoiHuy !== this.filters.nguoiHuy) return false;

      return true;
    });

    this.calculateStats();
  }

  private calculateStats() {
    let totalOriginalPrice = 0;
    let totalFees = 0;
    let totalRefunded = 0;

    this.filteredRefunds.forEach(item => {
      totalOriginalPrice += item.tienGoc;
      totalFees += item.lePhiHuy;
      totalRefunded += item.tienHoan;
    });

    this.stats = {
      totalCancelled: this.filteredRefunds.length,
      totalOriginalPrice: totalOriginalPrice,
      totalFees: totalFees,
      totalRefunded: totalRefunded
    };
  }

  onResetFilters() {
    this.filters = {
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      nguoiHuy: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredRefunds.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO HOÀN HỦY VÉ XE KHÁCH (TÂN XUÂN PHÚC)\n';
    csvContent += `Thời gian hủy: Từ ${this.filters.fromDate} đến ${this.filters.toDate}\n`;
    csvContent += `Bộ lọc: Người hủy: ${this.filters.nguoiHuy}\n\n`;
    
    csvContent += 'Mã vé / Mã đơn hàng,Người thực hiện hủy,Tiền vé gốc,Tỷ lệ phí hủy áp dụng (%),Lệ phí hủy (VNĐ),Số tiền hoàn lại,Mã giao dịch hoàn\n';

    this.filteredRefunds.forEach(item => {
      csvContent += `"${item.maVe}","${item.nguoiHuy}",${item.tienGoc},${item.tyLePhi * 100},${item.lePhiHuy},${item.tienHoan},"${item.maGiaoDich}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng",${this.stats.totalCancelled},"Tổng tiền gốc",${this.stats.totalOriginalPrice},"Tổng phí hủy",${this.stats.totalFees},"Tổng tiền hoàn",${this.stats.totalRefunded}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoHoanHuy_TXP.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
