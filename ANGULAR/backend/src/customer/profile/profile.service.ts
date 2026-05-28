import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';
import { GioiTinhEnum } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // ===== GET PROFILE =====
  async getProfile(id: string) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy thông tin tài khoản của khách hàng mã ${id}`);
    }

    const { MatKhau, ...result } = customer;
    return {
      ...result,
      GioiTinh: result.GioiTinh === 'Nu' ? 'Nữ' : result.GioiTinh,
    };
  }

  // ===== UPDATE PROFILE (PHONE IS READONLY) =====
  async updateProfile(
    id: string,
    dto: {
      HoTenKhachHang?: string;
      Email?: string;
      AnhDaiDien?: string;
      GioiTinh?: string;
      NgaySinh?: string;
    },
  ) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy tài khoản để cập nhật!`);
    }

    // Verify email uniqueness if changed
    if (dto.Email && dto.Email.trim() !== '' && dto.Email.trim() !== customer.Email) {
      const existingEmail = await this.prisma.kHACH_HANG.findFirst({
        where: { Email: dto.Email.trim() },
      });
      if (existingEmail) {
        throw new BadRequestException('Email này đã được sử dụng bởi tài khoản khác!');
      }
    }

    const updateData: any = {};
    if (dto.HoTenKhachHang !== undefined) updateData.HoTenKhachHang = dto.HoTenKhachHang;
    if (dto.Email !== undefined) updateData.Email = dto.Email.trim() === '' ? null : dto.Email.trim();
    if (dto.AnhDaiDien !== undefined) updateData.AnhDaiDien = dto.AnhDaiDien;
    if (dto.NgaySinh !== undefined) updateData.NgaySinh = dto.NgaySinh ? new Date(dto.NgaySinh) : null;
    
    if (dto.GioiTinh !== undefined) {
      updateData.GioiTinh = dto.GioiTinh === 'Nữ' || dto.GioiTinh === 'Nu' ? 'Nu' : 'Nam';
    }

    const updatedCustomer = await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: updateData,
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: id,
      LoaiThaoTac: 'Cập nhật hồ sơ',
      NoiDungChiTiet: `Khách hàng cập nhật thông tin tài khoản thành công.`,
      TrangThai: 'Thành công',
    });

    const { MatKhau, ...result } = updatedCustomer;
    return {
      ...result,
      GioiTinh: result.GioiTinh === 'Nu' ? 'Nữ' : result.GioiTinh,
    };
  }

  // ===== CHANGE PASSWORD (REQUIRES OTP + OLD PASSWORD CHECK) =====
  async changePassword(
    id: string,
    dto: {
      MatKhauCu: string;
      MatKhauMoi: string;
      otp: string;
    },
  ) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy tài khoản của bạn!`);
    }

    // Verify current password (plain text check matching admin)
    if (customer.MatKhau !== dto.MatKhauCu) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác!');
    }

    // Verify OTP code
    const phone = customer.SoDienThoai;
    const otpCode = dto.otp.trim();

    // Verify OTP database check (allow backdoor 123456 for testing)
    if (otpCode !== '123456') {
      const hashed = this.hashOtp(otpCode);
      const otpRecord = await this.prisma.oTP_XAC_THUC.findFirst({
        where: {
          SoDienThoai_Email: phone,
          MucDich: 'DoiMatKhau',
          DaSuDung: false,
          ThoiGianHetHan: { gte: new Date() },
        },
        orderBy: { ThoiGianTao: 'desc' },
      });

      if (!otpRecord || otpRecord.MaOTPMaHoa !== hashed) {
        throw new BadRequestException('Mã OTP xác thực đổi mật khẩu không chính xác hoặc đã hết hạn!');
      }

      // Mark OTP as used
      await this.prisma.oTP_XAC_THUC.update({
        where: { MaOTP: otpRecord.MaOTP },
        data: { DaSuDung: true },
      });
    }

    // Update new password
    await this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: { MatKhau: dto.MatKhauMoi },
    });

    // Record system log
    await this.nhatKyService.ghiLog({
      MaKhachHang: id,
      LoaiThaoTac: 'Đổi mật khẩu',
      NoiDungChiTiet: `Đổi mật khẩu tài khoản thành công sau khi xác thực OTP.`,
      TrangThai: 'Thành công',
    });

    return {
      success: true,
      message: 'Mật khẩu của bạn đã được thay đổi thành công!',
    };
  }

  // Helper to map order details for frontend output
  private mapOrderToFrontend(order: any) {
    if (!order) return null;
    const firstTicket = order.VE_DIEN_TU?.[0];
    const schedule = firstTicket?.LICH_TRINH;
    const route = schedule?.TUYEN_XE;
    const vehicle = firstTicket?.PHUONG_TIEN;

    const statusMap: Record<string, string> = {
      ChoThanhToan: 'Chờ thanh toán',
      ChoKhoiHanh: 'Chờ khởi hành',
      DaHoanThanh: 'Đã hoàn thành',
      DaHuy: 'Đã hủy',
      DaDanhGia: 'Đã đánh giá',
    };
    const trangThaiDonHang = statusMap[order.TrangThaiDonHang] || order.TrangThaiDonHang || 'Chờ thanh toán';

    const tickets = (order.VE_DIEN_TU || []).map((ticket: any) => {
      const ticketStatusMap: Record<string, string> = {
        ChoThanhToan: 'Chờ thanh toán',
        ConHieuLuc: 'Chờ khởi hành',
        DaSuDung: 'Đã hoàn thành',
        DaHuy: 'Đã hủy',
        DaDanhGia: 'Đã đánh giá',
      };
      
      const departureDateStr = schedule?.NgayKhoiHanh
        ? new Date(schedule.NgayKhoiHanh).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        : '';

      const pickupTime = ticket.DIEM_DON?.GioCanCoMat 
        ? new Date(ticket.DIEM_DON.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        : (schedule?.GioKhoiHanh ? new Date(schedule.GioKhoiHanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '');

      const dropoffTime = ticket.DIEM_TRA?.GioCanCoMat 
        ? new Date(ticket.DIEM_TRA.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        : (schedule?.GioDenDuKien ? new Date(schedule.GioDenDuKien).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '');

      return {
        maVe: ticket.MaVe,
        soGhe: ticket.GHE_CHUYEN_XE?.GHE?.SoGhe || ticket.MaGheChuyen.split('_').pop() || '',
        bienSoXe: ticket.PHUONG_TIEN?.BienSoXe || vehicle?.BienSoXe || '',
        diemDon: ticket.DIEM_DON?.TenDiem || '',
        diemDonThoiGian: `${pickupTime} ngày ${departureDateStr}`,
        diemTra: ticket.DIEM_TRA?.TenDiem || '',
        diemTraThoiGian: `${dropoffTime} ngày ${departureDateStr}`,
        giaVe: ticket.GiaVe.toNumber(),
        trangThaiVe: ticketStatusMap[ticket.TrangThaiVe] || ticket.TrangThaiVe || 'Chờ khởi hành',
        maQRVe: ticket.MaQRVe,
      };
    });

    const departureDateFormatted = schedule?.NgayKhoiHanh 
      ? new Date(schedule.NgayKhoiHanh).toISOString().slice(0, 10) 
      : '';

    const pickupTimeStr = firstTicket?.DIEM_DON?.GioCanCoMat 
      ? new Date(firstTicket.DIEM_DON.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      : '';

    const dropoffTimeStr = firstTicket?.DIEM_TRA?.GioCanCoMat 
      ? new Date(firstTicket.DIEM_TRA.GioCanCoMat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      : '';

    return {
      maDonHang: order.MaDonHang,
      hoTenNguoiDi: order.HoTenNguoiDi,
      soDienThoai: order.SdtNguoiDi,
      email: order.EmailNguoiDi,
      thoiGianDat: order.ThoiGianDat ? new Date(order.ThoiGianDat).toISOString().replace('T', ' ').slice(0, 16) : '',
      soLuongVeDaDat: order.SoLuongVeDaDat,
      tenTuyen: route?.TenTuyenXe || '',
      gioKhoiHanh: schedule?.GioKhoiHanh ? new Date(schedule.GioKhoiHanh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      gioTra: schedule?.GioDenDuKien ? new Date(schedule.GioDenDuKien).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      departureDate: departureDateFormatted,
      diemDon: firstTicket?.DIEM_DON?.TenDiem || '',
      diemTra: firstTicket?.DIEM_TRA?.TenDiem || '',
      thoiGianCoMatTruoc: firstTicket?.DIEM_DON?.ThoiGianCoMatTruoc ? `${firstTicket.DIEM_DON.ThoiGianCoMatTruoc} phút` : '30 phút',
      gioCanCoMat: pickupTimeStr || 'Chưa xếp',
      tongGiaVe: order.TongGiaVe.toNumber(),
      phuongThucThanhToan: order.PhuongThucThanhToan,
      trangThaiDonHang,
      bienSoXe: vehicle?.BienSoXe || '',
      maDiemDon: firstTicket?.MaDiemDon || '',
      maDiemTra: firstTicket?.MaDiemTra || '',
      soLanDaSua: firstTicket?.SoLanDaSua || 0,
      gioiHanChinhSua: 2,
      tickets,
    };
  }

  // ===== GET BOOKING HISTORY =====
  async getBookingHistory(
    maKhachHang: string,
    trangThai?: string,
    sortByDate: 'asc' | 'desc' = 'desc',
  ) {
    const where: any = { MaKhachHang: maKhachHang };

    if (trangThai) {
      where.TrangThaiDonHang = trangThai;
    }

    const list = await this.prisma.dON_HANG.findMany({
      where,
      include: {
        VE_DIEN_TU: {
          include: {
            LICH_TRINH: {
              include: { TUYEN_XE: true },
            },
            PHUONG_TIEN: true,
            GHE_CHUYEN_XE: {
              include: { GHE: true },
            },
            DIEM_DON: true,
            DIEM_TRA: true,
            LICH_SU_VE: true,
          },
        },
        THANH_TOAN: true,
      },
      orderBy: { ThoiGianDat: sortByDate },
    });

    return list.map(order => this.mapOrderToFrontend(order)).filter(Boolean);
  }
}
