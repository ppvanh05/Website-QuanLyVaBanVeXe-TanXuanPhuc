import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RestrictedKeyword {
  id: string;             // Mã từ khóa
  keyword: string;        // Nội dung từ khóa
  violationLevel: 'High' | 'Medium' | 'Low'; // Mức độ vi phạm
  status: 'Active' | 'Inactive';             // Trạng thái áp dụng
  updatedAt: string;      // Thời gian cập nhật danh sách
  updatedBy: string;      // Người cập nhật
}

@Component({
  selector: 'app-quan-ly-tu-khoa-cam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quan-ly-tu-khoa-cam.component.html',
  styleUrls: ['./quan-ly-tu-khoa-cam.component.css']
})
export class QuanLyTuKhoaCamComponent implements OnInit {
  protected readonly Math = Math;

  // Bộ lọc & Tìm kiếm
  searchQuery: string = '';
  filterLevel: 'all' | 'High' | 'Medium' | 'Low' = 'all';

  // Tab lọc trạng thái (Tất cả / Đang áp dụng / Ngưng áp dụng)
  activeTab: 'all' | 'active' | 'inactive' = 'all';

  // Danh sách từ khóa gốc và danh sách hiển thị
  keywords: RestrictedKeyword[] = [];
  filteredKeywords: RestrictedKeyword[] = [];
  displayKeywords: RestrictedKeyword[] = [];

  // Phân trang
  currentPage: number = 1;
  pageSize: number = 10;

  // Trạng thái Modal (Thêm/Sửa)
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedKeyword: RestrictedKeyword | null = null;

  // Form Model
  formModel = {
    keyword: '',
    violationLevel: 'Medium' as 'High' | 'Medium' | 'Low',
    status: 'Active' as 'Active' | 'Inactive'
  };

  // Thống kê (KPIs) - luôn tính từ toàn bộ keywords, không phụ thuộc tab
  stats = {
    total: 0,
    active: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  // Thông báo Toast
  notification = {
    show: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: ''
  };

  ngOnInit() {
    this.keywords = this.generateMockKeywords();
    this.calculateStats();
    this.applyFilters();
  }

  generateMockKeywords(): RestrictedKeyword[] {
    return [
      { id: 'TKC001', keyword: 'lừa đảo', violationLevel: 'High', status: 'Active', updatedAt: '2026-05-20 14:30', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC002', keyword: 'ăn quịt', violationLevel: 'High', status: 'Active', updatedAt: '2026-05-19 09:15', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC003', keyword: 'mất dạy', violationLevel: 'High', status: 'Active', updatedAt: '2026-05-19 11:20', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC004', keyword: 'chửi thề', violationLevel: 'High', status: 'Active', updatedAt: '2026-05-18 16:45', updatedBy: 'Nguyễn Thị Mod' },
      { id: 'TKC005', keyword: 'đm', violationLevel: 'High', status: 'Active', updatedAt: '2026-05-18 10:10', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC006', keyword: 'chửi bậy', violationLevel: 'High', status: 'Active', updatedAt: '2026-05-17 15:30', updatedBy: 'Nguyễn Thị Mod' },
      { id: 'TKC007', keyword: 'quảng cáo', violationLevel: 'Medium', status: 'Active', updatedAt: '2026-05-17 08:22', updatedBy: 'Nguyễn Thị Mod' },
      { id: 'TKC008', keyword: 'http://', violationLevel: 'Medium', status: 'Active', updatedAt: '2026-05-16 11:45', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC009', keyword: 'https://', violationLevel: 'Medium', status: 'Active', updatedAt: '2026-05-15 14:12', updatedBy: 'Nguyễn Thị Mod' },
      { id: 'TKC010', keyword: 'www.', violationLevel: 'Medium', status: 'Active', updatedAt: '2026-05-14 09:05', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC011', keyword: 'mua bán', violationLevel: 'Low', status: 'Active', updatedAt: '2026-05-13 16:50', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC012', keyword: 'giá rẻ nhất', violationLevel: 'Low', status: 'Active', updatedAt: '2026-05-13 16:50', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC013', keyword: 'liên hệ zalo', violationLevel: 'Medium', status: 'Inactive', updatedAt: '2026-05-12 10:15', updatedBy: 'Nguyễn Thị Mod' },
      { id: 'TKC014', keyword: 'đánh cắp', violationLevel: 'High', status: 'Inactive', updatedAt: '2026-05-11 13:40', updatedBy: 'Lê Văn Admin' },
      { id: 'TKC015', keyword: 'khuyến mãi sốc', violationLevel: 'Low', status: 'Active', updatedAt: '2026-05-10 11:30', updatedBy: 'Nguyễn Thị Mod' }
    ];
  }

  // Đặt tab lọc trạng thái
  setTab(tab: 'all' | 'active' | 'inactive') {
    this.activeTab = tab;
    this.applyFilters();
  }

  // Cập nhật các chỉ số thống kê (luôn từ toàn bộ keywords)
  calculateStats() {
    this.stats = {
      total: this.keywords.length,
      active: this.keywords.filter(k => k.status === 'Active').length,
      high: this.keywords.filter(k => k.violationLevel === 'High').length,
      medium: this.keywords.filter(k => k.violationLevel === 'Medium').length,
      low: this.keywords.filter(k => k.violationLevel === 'Low').length
    };
  }

  // Áp dụng bộ lọc tìm kiếm
  applyFilters() {
    let result = [...this.keywords];

    // 1. Lọc theo tab trạng thái
    if (this.activeTab === 'active') {
      result = result.filter(k => k.status === 'Active');
    } else if (this.activeTab === 'inactive') {
      result = result.filter(k => k.status === 'Inactive');
    }

    // 2. Tìm kiếm theo từ khóa hoặc mã từ khóa
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(k =>
        k.keyword.toLowerCase().includes(q) ||
        k.id.toLowerCase().includes(q)
      );
    }

    // 3. Lọc theo mức độ vi phạm
    if (this.filterLevel !== 'all') {
      result = result.filter(k => k.violationLevel === this.filterLevel);
    }

    // Sắp xếp theo mã mới nhất
    result.sort((a, b) => b.id.localeCompare(a.id));

    this.filteredKeywords = result;
    this.currentPage = 1;
    this.calculateStats();
    this.updateDisplayList();
  }

  updateDisplayList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayKeywords = this.filteredKeywords.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredKeywords.length / this.pageSize) || 1;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayList();
    }
  }

  getPageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePageSize(event: any) {
    this.pageSize = parseInt(event.target.value, 10) || 10;
    this.currentPage = 1;
    this.updateDisplayList();
  }

  // Mở modal Thêm mới
  openAddModal() {
    this.isEditing = false;
    this.selectedKeyword = null;
    this.formModel = {
      keyword: '',
      violationLevel: 'Medium',
      status: 'Active'
    };
    this.showModal = true;
  }

  // Mở modal Sửa
  openEditModal(keyword: RestrictedKeyword) {
    this.isEditing = true;
    this.selectedKeyword = keyword;
    this.formModel = {
      keyword: keyword.keyword,
      violationLevel: keyword.violationLevel,
      status: keyword.status
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedKeyword = null;
  }

  // Chuyển đổi trạng thái trong modal (nút Khóa / Kích hoạt)
  toggleStatusInModal() {
    if (this.formModel.status === 'Active') {
      this.formModel.status = 'Inactive';
    } else {
      this.formModel.status = 'Active';
    }
  }

  // Lưu thông tin (Thêm hoặc Cập nhật)
  saveKeyword() {
    const keywordText = this.formModel.keyword.trim().toLowerCase();

    if (!keywordText) {
      this.showToast('warning', 'Cảnh báo', 'Vui lòng nhập nội dung từ khóa hạn chế.');
      return;
    }

    // Kiểm tra trùng lặp
    const isDuplicate = this.keywords.some(k =>
      k.keyword.toLowerCase() === keywordText &&
      (!this.isEditing || k.id !== this.selectedKeyword?.id)
    );

    if (isDuplicate) {
      this.showToast('error', 'Lỗi trùng lặp', `Từ khóa "${keywordText}" đã tồn tại trong danh sách.`);
      return;
    }

    if (this.isEditing && this.selectedKeyword) {
      // Cập nhật từ khóa
      const index = this.keywords.findIndex(k => k.id === this.selectedKeyword!.id);
      if (index !== -1) {
        const oldKeywordName = this.keywords[index].keyword;
        this.keywords[index] = {
          ...this.keywords[index],
          keyword: keywordText,
          violationLevel: this.formModel.violationLevel,
          status: this.formModel.status,
          updatedAt: this.getCurrentDateTimeString(),
          updatedBy: 'Lê Văn Admin'
        };
        this.showToast('success', 'Cập nhật thành công', `Đã sửa từ khóa "${oldKeywordName}" thành "${keywordText}"`);
      }
    } else {
      // Thêm mới từ khóa
      const maxIdNum = this.keywords.length > 0
        ? Math.max(...this.keywords.map(k => parseInt(k.id.replace('TKC', ''), 10)))
        : 0;
      const newId = `TKC${String(maxIdNum + 1).padStart(3, '0')}`;

      const newKeyword: RestrictedKeyword = {
        id: newId,
        keyword: keywordText,
        violationLevel: this.formModel.violationLevel,
        status: this.formModel.status,
        updatedAt: this.getCurrentDateTimeString(),
        updatedBy: 'Lê Văn Admin'
      };

      this.keywords.unshift(newKeyword);
      this.showToast('success', 'Thêm thành công', `Đã thêm từ khóa mới "${keywordText}" vào danh sách.`);
    }

    this.applyFilters();
    this.closeModal();
  }

  // Tiện ích lấy thời gian hiện tại định dạng YYYY-MM-DD HH:MM
  getCurrentDateTimeString(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  // Quản lý Toast thông báo
  showToast(type: 'success' | 'warning' | 'error', title: string, message: string) {
    this.notification = {
      show: true,
      type,
      title,
      message
    };
    // Tự động đóng toast sau 3.5s
    setTimeout(() => {
      this.closeToast();
    }, 3500);
  }

  closeToast() {
    this.notification.show = false;
  }
}
