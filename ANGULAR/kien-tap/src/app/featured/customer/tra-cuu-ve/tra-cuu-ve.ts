import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

interface Ticket {
  maVe: string;
  soGhe: string;
  trangThaiVe: '�� thanh to�n' | '�� h?y' | 'Ch? thanh to�n';
}

interface Order {
  maDonHang: string;
  hoTenKhachHang: string;
  soDienThoai: string;
  email: string;
  thoiGianDat: string;
  soLuongVe: number;
  tenTuyen: string;
  gioKhoiHanh: string;
  departureDate: string;
  diemDon: string;
  diemTra: string;
  thoiGianCoMatTruoc: string;
  gioCanComat: string;
  tongGiaVe: number;
  phuongThucThanhToan: string;
  trangThaiDonHang: string;
  bienSoXe: string;
  maDiemDon: string;
  maDiemTra: string;
  soLanDaSua: number;
  gioiHanChinhSua: number;
  tickets: Ticket[];
}

interface LocationOption {
  maDiem: string;
  tenDiem: string;
}

interface RatingCriteriaItem {
  label: string;
  score: number;
}

const MOCK_ORDERS: Order[] = [
  {
    maDonHang: 'P5CDWE67',
    hoTenKhachHang: '�? Th? Phuong',
    soDienThoai: '0908123456',
    email: 'phuong@example.com',
    thoiGianDat: '2026-05-15 09:30',
    soLuongVe: 1,
    tenTuyen: 'H� N?i - H?i Ph�ng',
    gioKhoiHanh: '07:30',
    departureDate: '2026-05-25',
    diemDon: 'B?n xe M? ��nh',
    diemTra: 'B?n xe H?i Ph�ng',
    thoiGianCoMatTruoc: '07:00',
    gioCanComat: '07:00',
    tongGiaVe: 320000,
    phuongThucThanhToan: 'Chuy?n kho?n',
    trangThaiDonHang: '�� ho�n th�nh',
    bienSoXe: '29A-12345',
    maDiemDon: 'MD01',
    maDiemTra: 'MT01',
    soLanDaSua: 1,
    gioiHanChinhSua: 3,
    tickets: [
      { maVe: 'VE-001', soGhe: 'A01', trangThaiVe: '�� thanh to�n' }
    ]
  },
  {
    maDonHang: 'P5CDWE88',
    hoTenKhachHang: 'Tr?n Ng?c B?o Nghi',
    soDienThoai: '0912345678',
    email: 'bao.nghi@example.com',
    thoiGianDat: '2026-05-16 10:15',
    soLuongVe: 2,
    tenTuyen: 'H� N?i - S�i G�n',
    gioKhoiHanh: '08:00',
    departureDate: '2026-06-02',
    diemDon: 'B?n xe Gi�p B�t',
    diemTra: 'B?n xe S�i G�n',
    thoiGianCoMatTruoc: '07:30',
    gioCanComat: '07:30',
    tongGiaVe: 980000,
    phuongThucThanhToan: 'Th? ng�n h�ng',
    trangThaiDonHang: 'Ch? kh?i h�nh',
    bienSoXe: '29B-67890',
    maDiemDon: 'MD02',
    maDiemTra: 'MT02',
    soLanDaSua: 0,
    gioiHanChinhSua: 2,
    tickets: [
      { maVe: 'VE-002', soGhe: 'B01', trangThaiVe: '�� thanh to�n' },
      { maVe: 'VE-003', soGhe: 'B02', trangThaiVe: '�� thanh to�n' }
    ]
  }
];

const LOCATION_OPTIONS: LocationOption[] = [
  { maDiem: 'MD01', tenDiem: 'B?n xe M? ��nh' },
  { maDiem: 'MD02', tenDiem: 'B?n xe Gi�p B�t' },
  { maDiem: 'MD03', tenDiem: 'B?n xe Gia L�m' },
  { maDiem: 'MT01', tenDiem: 'B?n xe H?i Ph�ng' },
  { maDiem: 'MT02', tenDiem: 'B?n xe S�i G�n' },
  { maDiem: 'MT03', tenDiem: 'B?n xe �� N?ng' }
];

@Component({
  selector: 'app-tim-kiem-chuyen-xe',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './tra-cuu-ve.html',
  styleUrl: './tra-cuu-ve.css'
})
export class TraCuuVeComponent {
  phoneNumber: string = '';
  bookingCode: string = '';
  ticketCode: string = '';
  isLoading: boolean = false;
  foundOrder: Order | null = null;
  currentOrder: Order | null = null;
  errorMessage: string = '';
  searchError: string = '';
  currentStep: 'search' | 'results' = 'search';

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  showEditModal: boolean = false;
  showCancelModal: boolean = false;
  showReviewModal: boolean = false;
  showDiemDonDropdown: boolean = false;
  showDiemTraDropdown: boolean = false;

  editFullName: string = '';
  editPhone: string = '';
  editEmail: string = '';
  editDiemDonSearchText: string = '';
  editDiemTraSearchText: string = '';
  editMaDiemDon: string = '';
  editMaDiemTra: string = '';

  filterDiemDonOptions: LocationOption[] = [];
  filterDiemTraOptions: LocationOption[] = [];

  reviewComment: string = '';
  ratingCriteria: RatingCriteriaItem[] = [
    { label: 'Nh�n vi�n', score: 5 },
    { label: 'Xe s?ch s?', score: 5 },
    { label: 'Gi? kh?i h�nh', score: 5 },
    { label: 'Ch?t lu?ng d?ch v?', score: 5 }
  ];
  quickReviewTags: string[] = ['��ng gi?', 'Xe d?p', 'Tho?i m�i', 'Nh�n vi�n nhi?t t�nh'];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  searchTickets(): void {
    this.isLoading = true;
    this.foundOrder = null;
    this.currentOrder = null;
    this.errorMessage = '';
    this.searchError = '';

    setTimeout(() => {
      const found = MOCK_ORDERS.find(
        (order) =>
          order.maDonHang.toLowerCase() === this.bookingCode.trim().toLowerCase() &&
          order.soDienThoai.includes(this.phoneNumber.trim())
      );

      if (!found) {
        this.searchError = 'Kh�ng t�m th?y don h�ng n�o v?i th�ng tin d� cung c?p.';
        this.currentStep = 'search';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.foundOrder = found;
      this.currentOrder = { ...found };
      this.currentStep = 'results';
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  fillMockData(id: number): void {
    if (id === 1) {
      this.phoneNumber = '0908123456';
      this.bookingCode = 'P5CDWE67';
    } else {
      this.phoneNumber = '0912345678';
      this.bookingCode = 'P5CDWE88';
    }

    this.searchTickets();
  }

  backToSearch(): void {
    this.currentStep = 'search';
    this.foundOrder = null;
    this.currentOrder = null;
    this.errorMessage = '';
    this.searchError = '';
    this.showEditModal = false;
    this.showCancelModal = false;
    this.showReviewModal = false;
  }

  maskPhone(phone: string): string {
    if (!phone || phone.length < 8) {
      return phone;
    }

    const visibleStart = phone.slice(0, 3);
    const visibleEnd = phone.slice(-2);
    return `${visibleStart}****${visibleEnd}`;
  }

  maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
      return email;
    }

    const [name, domain] = email.split('@');
    const maskedName = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}***`;
    return `${maskedName}@${domain}`;
  }

  getStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'bg-success-light': status === '�� ho�n th�nh' || status === '�� d�nh gi�',
      'text-success-text': status === '�� ho�n th�nh' || status === '�� d�nh gi�',
      'bg-danger-light': status === '�� h?y',
      'text-danger-text': status === '�� h?y',
      'bg-info-light': status === 'Ch? thanh to�n',
      'text-info-text': status === 'Ch? thanh to�n',
      'bg-warning-light': status === 'Ch? kh?i h�nh' || status === 'Chua d�nh gi�',
      'text-warning-text': status === 'Ch? kh?i h�nh' || status === 'Chua d�nh gi�'
    };
  }

  calculatePresenceTime(gioKhoiHanh: string, _departureDate?: string): string {
    const [hour, minute] = gioKhoiHanh.split(':').map(Number);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return '30 ph�t tru?c gi? kh?i h�nh';
    }

    const totalMinutes = hour * 60 + minute - 30;
    const safeMinutes = (totalMinutes + 24 * 60) % (24 * 60);
    const hh = Math.floor(safeMinutes / 60).toString().padStart(2, '0');
    const mm = (safeMinutes % 60).toString().padStart(2, '0');

    return `${hh}:${mm}`;
  }

  formatPrice(price: number): string {
    return (price || 0).toLocaleString('vi-VN') + 'd';
  }

  getRefundPercentage(departureDate: string, gioKhoiHanh: string): number {
    if (!departureDate || !gioKhoiHanh) {
      return 0;
    }

    const [year, month, day] = departureDate.split('-').map(Number);
    const [hour, minute] = gioKhoiHanh.split(':').map(Number);

    const departure = new Date(year, month - 1, day, hour, minute, 0, 0);
    const now = new Date();
    const diffHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return 0;
    }

    if (diffHours >= 24) {
      return 100;
    }

    if (diffHours >= 12) {
      return 50;
    }

    return 0;
  }

  openEditOrderModal(): void {
    if (!this.currentOrder) {
      return;
    }

    this.editFullName = this.currentOrder.hoTenKhachHang;
    this.editPhone = this.currentOrder.soDienThoai;
    this.editEmail = this.currentOrder.email;
    this.editDiemDonSearchText = this.currentOrder.diemDon;
    this.editDiemTraSearchText = this.currentOrder.diemTra;
    this.editMaDiemDon = this.currentOrder.maDiemDon;
    this.editMaDiemTra = this.currentOrder.maDiemTra;
    this.filterDiemDonOptions = LOCATION_OPTIONS;
    this.filterDiemTraOptions = LOCATION_OPTIONS;
    this.showEditModal = true;
  }

  closeEditOrderModal(): void {
    this.showEditModal = false;
  }

  saveEditChanges(): void {
    if (!this.currentOrder) {
      return;
    }

    this.currentOrder.hoTenKhachHang = this.editFullName.trim() || this.currentOrder.hoTenKhachHang;
    this.currentOrder.soDienThoai = this.editPhone.trim() || this.currentOrder.soDienThoai;
    this.currentOrder.email = this.editEmail.trim() || this.currentOrder.email;

    const selectedDon = LOCATION_OPTIONS.find((item) => item.maDiem === this.editMaDiemDon);
    const selectedTra = LOCATION_OPTIONS.find((item) => item.maDiem === this.editMaDiemTra);

    if (selectedDon) {
      this.currentOrder.diemDon = selectedDon.tenDiem;
      this.currentOrder.maDiemDon = selectedDon.maDiem;
    }

    if (selectedTra) {
      this.currentOrder.diemTra = selectedTra.tenDiem;
      this.currentOrder.maDiemTra = selectedTra.maDiem;
    }

    this.currentOrder.soLanDaSua = (this.currentOrder.soLanDaSua || 0) + 1;
    this.showEditModal = false;
    this.showToast('C?p nh?t th�ng tin v� th�nh c�ng.', 'success');
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancelTicket(): void {
    if (!this.currentOrder) {
      return;
    }

    this.currentOrder.trangThaiDonHang = '�� h?y';
    this.showCancelModal = false;
    this.showToast('Y�u c?u h?y v� d� du?c g?i.', 'success');
  }

  openReviewModal(): void {
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  setRating(index: number, score: number): void {
    this.ratingCriteria[index].score = score;
  }

  addReviewTag(tag: string): void {
    if (this.reviewComment.includes(tag)) {
      this.reviewComment = this.reviewComment.replace(tag, '').replace(/\s{2,}/g, ' ').trim();
      return;
    }

    this.reviewComment = this.reviewComment ? `${this.reviewComment}, ${tag}` : tag;
  }

  submitReview(): void {
    if (!this.currentOrder) {
      return;
    }

    this.currentOrder.trangThaiDonHang = '�� d�nh gi�';
    this.showReviewModal = false;
    this.showToast('C?m on b?n d� d�nh gi� d?ch v?.', 'success');
  }

  printTicket(ticket: Ticket): void {
    if (typeof window !== 'undefined') {
      window.print();
    }

    this.showToast(`�ang in v� ${ticket.maVe}.`, 'success');
  }

  selectDiemDon(option: LocationOption): void {
    this.editMaDiemDon = option.maDiem;
    this.editDiemDonSearchText = option.tenDiem;
    this.showDiemDonDropdown = false;
    this.filterDiemDonOptions = [option];
  }

  selectDiemTra(option: LocationOption): void {
    this.editMaDiemTra = option.maDiem;
    this.editDiemTraSearchText = option.tenDiem;
    this.showDiemTraDropdown = false;
    this.filterDiemTraOptions = [option];
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 2500);
  }
}
