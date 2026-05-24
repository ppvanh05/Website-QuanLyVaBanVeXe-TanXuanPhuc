import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { CustomerTinTucService } from '../../../core/services/customer-tin-tuc.service';

@Component({
  selector: 'app-tintuc',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './tintuc.component.html',
  styleUrl: './tintuc.component.css'
})
export class TintucComponent implements OnInit {
  categories = ['TIN NHÀ XE', 'KHUYẾN MÃI', 'CẨM NANG DI CHUYỂN'];
  activeCategory = 'TIN NHÀ XE';
  searchQuery = '';

  featuredNews: any = null;
  latestNews: any[] = [];
  subFeaturedNews: any[] = [];
  allNews: any[] = [];

  pages: any[] = [1];
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  constructor(private newsService: CustomerTinTucService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    const loai = this.mapCategory(this.activeCategory);
    this.newsService.getPublishedNews({
      page: this.currentPage,
      limit: this.pageSize,
      loai: loai,
      search: this.searchQuery
    }).subscribe({
      next: (response) => {
        const items = response.items || [];
        const mappedItems = items.map((item: any) => this.mapNewsItem(item));

        if (this.currentPage === 1) {
          // If we are on the first page, split items into sections
          this.featuredNews = mappedItems.length > 0 ? mappedItems[0] : null;
          this.latestNews = mappedItems.length > 1 ? mappedItems.slice(1, 4) : [];
          this.subFeaturedNews = mappedItems.length > 4 ? mappedItems.slice(4, 6) : [];
          this.allNews = mappedItems.length > 6 ? mappedItems.slice(6) : [];
        } else {
          // If we are on page 2+, display all items in the "All News" grid
          this.allNews = mappedItems;
        }

        this.totalPages = response.meta?.totalPages || 1;
        this.generatePagination(this.currentPage, this.totalPages);
      },
      error: (err) => {
        console.error('Error fetching news:', err);
      }
    });
  }

  onCategoryChange(cat: string) {
    this.activeCategory = cat;
    this.currentPage = 1;
    this.loadNews();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.currentPage = 1;
    this.loadNews();
  }

  onPageChange(page: any) {
    if (page === '...') return;
    const targetPage = Number(page);
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.currentPage = targetPage;
      this.loadNews();
    }
  }

  mapCategory(cat: string): string {
    switch (cat) {
      case 'TIN NHÀ XE': return 'TinTuc';
      case 'KHUYẾN MÃI': return 'KhuyenMai';
      case 'CẨM NANG DI CHUYỂN': return 'HuongDan';
      default: return '';
    }
  }

  mapNewsItem(item: any) {
    return {
      maTinTuc: item.MaTinTuc,
      title: item.TieuDe,
      date: this.formatDate(item.NgayDang),
      description: item.MoTaNgan || '',
      image: item.AnhBia || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      tag: this.getCategoryLabel(item.LoaiTinTuc) || 'MỚI NHẤT',
      category: this.getCategoryLabel(item.LoaiTinTuc)
    };
  }

  getCategoryLabel(type: string): string {
    switch (type) {
      case 'TinTuc': return 'TIN NHÀ XE';
      case 'KhuyenMai': return 'KHUYẾN MÃI';
      case 'HuongDan': return 'CẨM NANG DI CHUYỂN';
      case 'ThongBao': return 'THÔNG BÁO';
      case 'SuKien': return 'SỰ KIỆN';
      case 'TuyenDung': return 'TUYỂN DỤNG';
      default: return 'TIN NHÀ XE';
    }
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  generatePagination(current: number, total: number) {
    const pages: any[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    this.pages = pages;
  }
}

