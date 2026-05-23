import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaiXeService } from '../../QuanLyDieuHanh/tai-xe.service';

interface CrewReportItem {
  maNhanSu: string;
  hoTen: string;
  vaiTro: 'Tài xế' | 'Phụ xe';
  sdt: string;
  cccd: string;
  loaiBangLai: string;
  thoiHanBangLai: string;
  trangThaiLamViec: 'Đang hoạt động' | 'Đã khóa';
}

@Component({
  selector: 'app-bao-cao-tai-xe-phu-xe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bao-cao-tai-xe-phu-xe.component.html',
  styleUrls: ['./bao-cao-tai-xe-phu-xe.component.css']
})
export class BaoCaoTaiXePhuXeComponent implements OnInit {
  filters = {
    searchTerm: '',
    role: 'Tất cả',
    status: 'Tất cả'
  };

  allCrew: CrewReportItem[] = [];
  filteredCrew: CrewReportItem[] = [];
  isReportViewed = true;

  // KPI stats
  stats = {
    totalCrew: 0,
    totalDrivers: 0,
    totalAssistants: 0,
    expiringLicenses: 0
  };

  rolesList = ['Tài xế', 'Phụ xe'];

  constructor(private taiXeService: TaiXeService) {}

  ngOnInit() {
    this.loadCrewData();
    this.onViewReport();
  }

  loadCrewData() {
    const drivers = this.taiXeService.getDrivers();
    this.allCrew = drivers.map(d => {
      return {
        maNhanSu: `TXP_NS${String(d.id).padStart(3, '0')}`,
        hoTen: d.name,
        vaiTro: d.role === 'driver' ? 'Tài xế' : 'Phụ xe',
        sdt: d.phone,
        cccd: d.cccdNumber || 'N/A',
        loaiBangLai: d.licenseClass || 'Không có',
        thoiHanBangLai: d.licenseExpiry || 'N/A',
        trangThaiLamViec: d.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'
      };
    });
  }

  isLicenseExpiringSoon(expiryStr: string): boolean {
    if (!expiryStr || expiryStr === 'N/A') return false;
    const parts = expiryStr.split('/');
    if (parts.length !== 3) return false;
    const expiryDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const today = new Date('2026-05-18');
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }

  isLicenseExpired(expiryStr: string): boolean {
    if (!expiryStr || expiryStr === 'N/A') return false;
    const parts = expiryStr.split('/');
    if (parts.length !== 3) return false;
    const expiryDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const today = new Date('2026-05-18');
    return expiryDate.getTime() < today.getTime();
  }

  onViewReport() {
    this.isReportViewed = true;
    this.filteredCrew = this.allCrew.filter(item => {
      // Search term
      if (this.filters.searchTerm) {
        const query = this.filters.searchTerm.toLowerCase();
        const matchName = item.hoTen.toLowerCase().includes(query);
        const matchPhone = item.sdt.includes(query);
        const matchCccd = item.cccd.includes(query);
        const matchCode = item.maNhanSu.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchCccd && !matchCode) return false;
      }

      // Role
      if (this.filters.role !== 'Tất cả' && item.vaiTro !== this.filters.role) return false;

      // Status
      if (this.filters.status !== 'Tất cả') {
        const statusMap = this.filters.status === 'Hoạt động' ? 'Đang hoạt động' : 'Đã khóa';
        if (item.trangThaiLamViec !== statusMap) return false;
      }

      return true;
    });

    this.calculateStats();
  }

  private calculateStats() {
    let totalDrivers = 0;
    let totalAssistants = 0;
    let expiringLicenses = 0;

    this.filteredCrew.forEach(item => {
      if (item.vaiTro === 'Tài xế') {
        totalDrivers++;
        if (this.isLicenseExpiringSoon(item.thoiHanBangLai) || this.isLicenseExpired(item.thoiHanBangLai)) {
          expiringLicenses++;
        }
      } else {
        totalAssistants++;
      }
    });

    this.stats = {
      totalCrew: this.filteredCrew.length,
      totalDrivers,
      totalAssistants,
      expiringLicenses
    };
  }

  onResetFilters() {
    this.filters = {
      searchTerm: '',
      role: 'Tất cả',
      status: 'Tất cả'
    };
    this.isReportViewed = true;
    this.onViewReport();
  }

  onExportExcel() {
    if (this.filteredCrew.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO NHÂN SỰ TÀI XẾ & PHỤ XE (TÂN XUÂN PHÚC)\n';
    csvContent += `Bộ lọc: Vai trò: ${this.filters.role}, Trạng thái: ${this.filters.status}\n\n`;
    
    csvContent += 'Mã nhân sự,Họ tên nhân viên,Vai trò,Số điện thoại,CCCD,Loại bằng lái,Thời hạn bằng lái,Trạng thái làm việc\n';

    this.filteredCrew.forEach(item => {
      csvContent += `"${item.maNhanSu}","${item.hoTen}","${item.vaiTro}","${item.sdt}","${item.cccd}","${item.loaiBangLai}","${item.thoiHanBangLai}","${item.trangThaiLamViec}"\n`;
    });

    // Summary Row
    csvContent += `\n"Tổng cộng nhân sự",${this.stats.totalCrew},"Lái xe",${this.stats.totalDrivers},"Phụ xe",${this.stats.totalAssistants},"Bằng lái hết hạn/sắp hết hạn",${this.stats.expiringLicenses}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTaiXePhuXe_TXP.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
