import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CustomerReportItem {
  maKhachHang: string;
  tenKhachHang: string;
  sdt: string;
  email: string;
  ngayDangKy: string;
  tongVeDat: number;
  trangThai: 'Đang hoạt động' | 'Đã khóa';
}
@Component({
  selector: 'app-bao-cao-khach-hang',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-khach-hang.component.html',
  styleUrls: ['./bao-cao-khach-hang.component.css']
})
export class BaoCaoKhachHangComponent implements OnInit {
  filters = {
    searchTerm: '',
    status: 'Tất cả',
    fromDate: '',
    toDate: ''
  };

  allCustomers: CustomerReportItem[] = [];
  filteredCustomers: CustomerReportItem[] = [];
  isReportViewed = true;

  // KPI stats
  stats = {
    totalCustomers: 0,
    activeCustomers: 0,
    lockedCustomers: 0,
    totalVeDat: 0
  };

  constructor() {}

  ngOnInit() {
    this.allCustomers = this.generateMockCustomers();
    this.onViewReport();
  }

  private generateMockCustomers(): CustomerReportItem[] {
    return [
      { maKhachHang: 'KH001', tenKhachHang: 'Nguyễn Văn An', sdt: '0912445566', email: 'an.nv@gmail.com', ngayDangKy: '2026-01-15', tongVeDat: 12, trangThai: 'Đang hoạt động' },
      { maKhachHang: 'KH002', tenKhachHang: 'Trần Thị Bích', sdt: '0988776655', email: 'bich.tt@yahoo.com', ngayDangKy: '2026-02-10', tongVeDat: 8, trangThai: 'Đang hoạt động' },
      { maKhachHang: 'KH003', tenKhachHang: 'Lê Văn Cường', sdt: '0903112233', email: 'cuong.lv@hotmail.com', ngayDangKy: '2026-03-01', tongVeDat: 15, trangThai: 'Đang hoạt động' },
      { maKhachHang: 'KH004', tenKhachHang: 'Phạm Minh Đạo', sdt: '0976334455', email: 'dao.pm@outlook.com', ngayDangKy: '2026-03-20', tongVeDat: 3, trangThai: 'Đang hoạt động' },
      { maKhachHang: 'KH005', tenKhachHang: 'Hoàng Thị Dung', sdt: '0934889900', email: 'dunghoang99@gmail.com', ngayDangKy: '2026-04-05', tongVeDat: 9, trangThai: 'Đang hoạt động' },
      { maKhachHang: 'KH006', tenKhachHang: 'Nguyễn Thị Phương', sdt: '0919223344', email: 'phuongnt@gmail.com', ngayDangKy: '2026-04-18', tongVeDat: 21, trangThai: 'Đang hoạt động' },
      { maKhachHang: 'KH007', tenKhachHang: 'Lý Quốc Bảo', sdt: '0983112244', email: 'baolq.txp@gmail.com', ngayDangKy: '2026-04-22', tongVeDat: 5, trangThai: 'Đã khóa' },
      { maKhachHang: 'KH008', tenKhachHang: 'Vũ Thanh Hằng', sdt: '0967445522', email: 'hangvt.hanoi@gmail.com', ngayDangKy: '2026-05-02', tongVeDat: 2, trangThai: 'Đang hoạt động' }
    ];
  }

  onViewReport() {
    this.isReportViewed = true;
    this.filteredCustomers = this.allCustomers.filter(item => {
      // Search term
      if (this.filters.searchTerm) {
        const query = this.filters.searchTerm.toLowerCase();
        const matchName = item.tenKhachHang.toLowerCase().includes(query);
        const matchPhone = item.sdt.includes(query);
        const matchEmail = item.email.toLowerCase().includes(query);
        const matchCode = item.maKhachHang.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchEmail && !matchCode) return false;
      }

      // Status
      if (this.filters.status !== 'Tất cả' && item.trangThai !== this.filters.status) return false;

      // Date Range (Registration Date)
      if (this.filters.fromDate && item.ngayDangKy < this.filters.fromDate) return false;
      if (this.filters.toDate && item.ngayDangKy > this.filters.toDate) return false;

      return true;
    });

    // Sort by ticket bookings count descending so top buyers are at the top
    this.filteredCustomers.sort((a, b) => b.tongVeDat - a.tongVeDat);

    this.calculateStats();
  }

  private calculateStats() {
    let activeCustomers = 0;
    let lockedCustomers = 0;
    let totalVeDat = 0;

    this.filteredCustomers.forEach(item => {
      totalVeDat += item.tongVeDat;
      if (item.trangThai === 'Đang hoạt động') {
        activeCustomers++;
      } else {
        lockedCustomers++;
      }
    });

    this.stats = {
      totalCustomers: this.filteredCustomers.length,
      activeCustomers,
      lockedCustomers,
      totalVeDat
    };
  }

  onResetFilters() {
    this.filters = {
      searchTerm: '',
      status: 'Tất cả',
      fromDate: '',
      toDate: ''
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredCustomers.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO THỐNG KÊ TÀI KHOẢN KHÁCH HÀNG (TÂN XUÂN PHÚC)\n';
    csvContent += `Bộ lọc: Trạng thái: ${this.filters.status}`;
    if (this.filters.fromDate || this.filters.toDate) {
      csvContent += `, Từ ngày: ${this.filters.fromDate || '...'} Đến ngày: ${this.filters.toDate || '...'}`;
    }
    csvContent += '\n\n';
    
    csvContent += 'Mã khách hàng,Họ tên khách hàng,Số điện thoại,Email,Ngày đăng ký,Tổng vé đặt,Trạng thái tài khoản\n';

    this.filteredCustomers.forEach(item => {
      csvContent += `"${item.maKhachHang}","${item.tenKhachHang}","${item.sdt}","${item.email}","${item.ngayDangKy}",${item.tongVeDat},"${item.trangThai}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng số khách hàng",${this.stats.totalCustomers},"Hoạt động",${this.stats.activeCustomers},"Bị khóa",${this.stats.lockedCustomers},"Tổng số vé đặt",${this.stats.totalVeDat}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoKhachHang_TXP.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
