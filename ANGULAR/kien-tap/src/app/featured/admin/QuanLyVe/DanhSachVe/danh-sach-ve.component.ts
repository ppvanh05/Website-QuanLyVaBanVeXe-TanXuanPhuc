import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';

interface Ticket {
  id: string;
  customer: string;
  phone: string;
  route: string;
  arrivalDate: string;
  date: string;
  total: string;
  paymentStatus: 'Chờ thanh toán' | 'Đã thanh toán' | 'Đã hủy' | 'Chờ hoàn tiền' | 'Đã hoàn tiền';
  ticketStatus: 'Chờ thanh toán' | 'Chờ khởi hành' | 'Đã hoàn thành' | 'Đã hủy';
}

@Component({
  selector: 'app-danh-sach-ve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './danh-sach-ve.component.html',
  styleUrls: ['./danh-sach-ve.component.css']
})
export class DanhSachVeComponent {
  // Biến lưu trữ giá trị đang nhập ở bộ lọc
  filters = {
    searchTerm: '',
    route: 'Tất cả tuyến',
    departureDate: '',
    arrivalDate: '',
    paymentStatus: 'Tất cả',
    ticketStatus: 'Tất cả'
  };

  // Danh sách hiển thị thực tế trên bảng (sau khi lọc)
  displayTickets: Ticket[] = [];
  
  // Phân trang
  currentPage: number = 1;
  pageSize: number = 15;

  tickets: Ticket[] = this.generateMockTickets();

  constructor(private toastService: ToastService) {
    this.displayTickets = [...this.tickets];
  }

  private generateMockTickets(): Ticket[] {
    const list: Ticket[] = [];
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Nguyễn Thị F', 'Lý Văn G', 'Vũ Thị H', 'Đặng Văn I', 'Bùi Thị K'];
    const routes = [
      'Bình Dương → BX Miền Đông', 'BX Miền Đông → Bình Dương',
      'Bình Dương → BX Miền Tây', 'BX Miền Tây → Bình Dương',
      'Bình Dương → Bến Cát', 'Bến Cát → Bình Dương'
    ];
    
    // Tạo 673 vé
    for (let i = 1; i <= 673; i++) {
      let pStatus: any = 'Đã thanh toán';
      let tStatus: any = 'Đã hoàn thành';

      // 5 vé đầu tiên luôn là Chờ thanh toán để hiện ở trang 1
      if (i <= 5) {
        tStatus = 'Chờ thanh toán';
        pStatus = 'Chờ thanh toán';
      } else if (i <= 205) {
        // 200 vé tiếp theo: Chờ khởi hành
        tStatus = 'Chờ khởi hành';
        pStatus = 'Đã thanh toán';
      } else if (i <= 505) {
        // 300 vé tiếp theo: Đã hoàn thành
        tStatus = 'Đã hoàn thành';
        pStatus = 'Đã thanh toán';
      } else if (i <= 515) {
        // ĐÚNG 10 vé Chờ hoàn tiền
        tStatus = 'Đã hủy';
        pStatus = 'Chờ hoàn tiền';
      } else {
        // Phần còn lại: Hỗn hợp
        if (i % 8 === 0) {
          tStatus = 'Đã hủy';
          pStatus = 'Đã hoàn tiền';
        } else if (i % 7 === 0) {
          tStatus = 'Đã hủy';
          pStatus = 'Đã hủy';
        } else {
          tStatus = 'Đã hoàn thành';
          pStatus = 'Đã thanh toán';
        }
      }

      const ticket: Ticket = {
        id: `TXP2605${String(1000 + i).padStart(4, '0')}`,
        customer: names[i % names.length],
        phone: `09${Math.floor(10000000 + Math.random() * 89999999).toString().substring(0, 8)}`,
        route: routes[i % routes.length],
        date: i <= 205 ? '2026-05-20' : '2026-05-15',
        arrivalDate: i <= 205 ? '2026-05-20' : '2026-05-15',
        total: `${150 + (i % 10) * 20}.000đ`,
        paymentStatus: pStatus,
        ticketStatus: tStatus
      };
      list.push(ticket);
    }
    return list;
  }

  onSearch() {
    this.displayTickets = this.tickets.filter(t => {
      const matchSearch = !this.filters.searchTerm || 
        t.id.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        t.customer.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        t.phone.includes(this.filters.searchTerm);
      
      const matchRoute = this.filters.route === 'Tất cả tuyến' || t.route === this.filters.route;
      const matchDepDate = !this.filters.departureDate || t.date === this.filters.departureDate;
      const matchArrDate = !this.filters.arrivalDate || t.arrivalDate === this.filters.arrivalDate;
      const matchPayment = this.filters.paymentStatus === 'Tất cả' || t.paymentStatus === this.filters.paymentStatus;
      const matchTicket = this.filters.ticketStatus === 'Tất cả' || t.ticketStatus === this.filters.ticketStatus;

      return matchSearch && matchRoute && matchDepDate && matchArrDate && matchPayment && matchTicket;
    });
    this.currentPage = 1; // Reset về trang 1 khi tìm kiếm
  }

  onReset() {
    this.filters = {
      searchTerm: '',
      route: 'Tất cả tuyến',
      departureDate: '',
      arrivalDate: '',
      paymentStatus: 'Tất cả',
      ticketStatus: 'Tất cả'
    };
    this.displayTickets = [...this.tickets];
    this.currentPage = 1;
  }

  get paginatedTickets() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.displayTickets.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.displayTickets.length / this.pageSize);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers() {
    const pages = [];
    const total = this.totalPages;
    
    // Hiển thị tối đa 5 trang xung quanh trang hiện tại
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(total, start + 4);
    
    if (end === total) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal Chi tiết vé
  showDetailsModal: boolean = false;
  selectedTicket: Ticket | null = null;

  openDetailsModal(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  // Các thao tác trong modal chi tiết
  onCollectMoney() {
    this.toastService.show('Đang thực hiện thu tiền cho vé ' + this.selectedTicket?.id, 'info');
    if (this.selectedTicket) {
      this.selectedTicket.paymentStatus = 'Đã thanh toán';
      this.selectedTicket.ticketStatus = 'Chờ khởi hành';
    }
  }

  onRefund() {
    if (confirm('Bạn đã thực hiện hoàn tiền thủ công cho khách hàng này chưa?')) {
      if (this.selectedTicket) {
        this.selectedTicket.paymentStatus = 'Đã hoàn tiền';
        this.selectedTicket.ticketStatus = 'Đã hủy';
      }
      this.toastService.show('Đã cập nhật trạng thái: Đã hoàn tiền.', 'success');
    }
  }

  // Modal OTP Hủy vé
  showOtpModal: boolean = false;
  otpValue: string = '';

  openOtpModal() {
    this.showOtpModal = true;
    this.otpValue = '';
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }

  confirmCancelWithOtp() {
    if (this.otpValue.length === 6) {
      this.toastService.show('Xác thực thành công! Hệ thống không thể hoàn tiền tự động. Vé ' + this.selectedTicket?.id + ' đã được chuyển sang trạng thái "Chờ hoàn tiền" để nhân viên xử lý thủ công.', 'success');
      if (this.selectedTicket) {
        this.selectedTicket.paymentStatus = 'Chờ hoàn tiền';
        this.selectedTicket.ticketStatus = 'Đã hủy';
      }
      this.closeOtpModal();
    } else {
      this.toastService.show('Vui lòng nhập đúng mã OTP 6 chữ số.', 'warning');
    }
  }

  onCancelTicket() {
    // Nếu vé đã thanh toán thì yêu cầu OTP
    if (this.selectedTicket?.paymentStatus === 'Đã thanh toán') {
      this.openOtpModal();
    } else {
      // Nếu chưa thanh toán thì cho hủy luôn sau khi confirm
      if (confirm('Bạn có chắc chắn muốn hủy vé chưa thanh toán này?')) {
        if (this.selectedTicket) {
          this.selectedTicket.paymentStatus = 'Đã hủy';
          this.selectedTicket.ticketStatus = 'Đã hủy';
        }
        this.closeDetailsModal();
      }
    }
  }

  onResendNotification() {
    this.toastService.show('Đã gửi lại SMS/Email cho khách hàng ' + this.selectedTicket?.customer, 'success');
  }

  // Modal In vé (kế thừa từ logic cũ nhưng mở từ Details)
  showPrintModal: boolean = false;

  openPrintModalFromDetails() {
    this.showPrintModal = true;
    // Không đóng details modal để giữ context, hoặc đóng tùy ý.
    // Ở đây tôi giữ details mở, print modal sẽ đè lên trên.
  }

  closePrintModal() {
    this.showPrintModal = false;
  }

  exportPDF() {
    this.toastService.show('Đang khởi tạo tệp PDF cho vé ' + this.selectedTicket?.id, 'info');
  }

  printTicket() {
    window.print();
  }

  updateFilter(key: string, event: any) {
    (this.filters as any)[key] = event.target.value;
  }

  getPaymentClass(status: string) {
    switch (status) {
      case 'Đã thanh toán': return 'status-paid';
      case 'Chờ thanh toán': return 'status-waiting';
      case 'Chờ hoàn tiền': return 'status-refund-pending';
      case 'Đã hoàn tiền': return 'status-refunded';
      case 'Đã hủy': return 'status-cancelled';
      default: return '';
    }
  }

  getTicketStatusClass(status: string) {
    switch (status) {
      case 'Chờ thanh toán': return 'status-waiting';
      case 'Chờ khởi hành': return 'status-upcoming';
      case 'Đã hoàn thành': return 'status-completed';
      case 'Đã hủy': return 'status-cancelled';
      default: return '';
    }
  }
}
