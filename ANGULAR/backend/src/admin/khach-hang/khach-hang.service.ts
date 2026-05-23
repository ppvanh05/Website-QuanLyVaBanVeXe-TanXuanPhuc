import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class KhachHangService {
  constructor(private prisma: PrismaService) {}

  // ===== LẤY TẤT CẢ KHÁCH HÀNG =====
  async getAll() {
    return this.prisma.kHACH_HANG.findMany({
      orderBy: { NgayDangKy: 'desc' },
      select: {
        MaKhachHang: true,
        HoTenKhachHang: true,
        SoDienThoai: true,
        Email: true,
        AnhDaiDien: true,
        GioiTinh: true,
        NgaySinh: true,
        TrangThaiTaiKhoan: true,
        NgayDangKy: true,
      },
    });
  }

  // ===== LẤY THEO ID =====
  async getById(id: string) {
    const kh = await this.prisma.kHACH_HANG.findUnique({
      where: { MaKhachHang: id },
    });
    if (!kh) throw new NotFoundException(`Không tìm thấy khách hàng với mã ${id}`);
    return kh;
  }

  // ===== LẤY THEO TRẠNG THÁI =====
  async getByTrangThai(trangThai: string) {
    return this.prisma.kHACH_HANG.findMany({
      where: { TrangThaiTaiKhoan: trangThai },
      orderBy: { NgayDangKy: 'desc' },
    });
  }

  // ===== CẬP NHẬT THÔNG TIN CƠ BẢN =====
  async update(id: string, dto: Prisma.KHACH_HANGUncheckedUpdateInput) {
    await this.getById(id); // kiểm tra tồn tại
    const data: any = { ...dto };
    if (dto.NgaySinh) {
      data.NgaySinh = new Date(dto.NgaySinh as any);
    }
    return this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data,
    });
  }

  // ===== KHÓA TÀI KHOẢN =====
  async khoaTaiKhoan(id: string, dto: { LyDoKhoa: string }) {
    const kh = await this.getById(id);

    // Kiểm tra đã khóa chưa
    if (kh.TrangThaiTaiKhoan === 'DaKhoa') {
      throw new BadRequestException('Tài khoản này đã bị khóa trước đó!');
    }

    // Kiểm tra khách hàng còn vé chưa đi không
    const veConHieuLuc = await this.prisma.vE_DIEN_TU.findFirst({
      where: {
        DON_HANG: {
          MaKhachHang: id,
        },
        TrangThaiVe: 'ConHieuLuc',
      },
    });

    if (veConHieuLuc) {
      throw new BadRequestException(
        `Tài khoản đang có vé chưa hoàn thành (Mã vé: ${veConHieuLuc.MaVe}). Vui lòng xử lý xong vé trước khi khóa tài khoản!`,
      );
    }

    return this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: {
        TrangThaiTaiKhoan: 'DaKhoa',
      },
    });
  }

  // ===== MỞ KHÓA TÀI KHOẢN =====
  async moKhoaTaiKhoan(id: string) {
    const kh = await this.getById(id);

    if (kh.TrangThaiTaiKhoan === 'HoatDong') {
      throw new BadRequestException('Tài khoản này đang hoạt động bình thường!');
    }

    return this.prisma.kHACH_HANG.update({
      where: { MaKhachHang: id },
      data: {
        TrangThaiTaiKhoan: 'HoatDong',
      },
    });
  }

  // ===== LẤY LỊCH SỬ VÉ CỦA KHÁCH HÀNG =====
  async getVeByKhachHang(id: string) {
    return this.prisma.vE_DIEN_TU.findMany({
      where: {
        DON_HANG: {
          MaKhachHang: id,
        },
      },
      include: {
        LICH_TRINH: {
          include: {
            TUYEN_XE: true,
          },
        },
        GHE_CHUYEN_XE: true,
      },
      orderBy: {
        ThoiGianXuatVe: 'desc',
      },
    });
  }

  // ===== LẤY NHẬT KÝ HOẠT ĐỘNG CỦA KHÁCH HÀNG =====
  async getNhatKyByKhachHang(id: string) {
    return this.prisma.nHAT_KY_HE_THONG.findMany({
      where: { MaKhachHang: id },
      orderBy: { ThoiGian: 'desc' },
    });
  }
}
