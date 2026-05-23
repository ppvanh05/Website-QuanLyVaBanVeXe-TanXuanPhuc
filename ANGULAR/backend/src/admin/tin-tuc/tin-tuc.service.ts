import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TinTucService {
  constructor(private prisma: PrismaService) {}

  // ===== LẤY TẤT CẢ TIN TỨC =====
  async getAll() {
    return this.prisma.tIN_TUC.findMany({
      orderBy: { NgayDang: 'desc' },
    });
  }

  // ===== LẤY THEO ID =====
  async getById(id: string) {
    return this.prisma.tIN_TUC.findUnique({
      where: { MaTinTuc: id },
    });
  }

  // ===== LẤY THEO TRẠNG THÁI =====
  async getByTrangThai(trangThai: string) {
    return this.prisma.tIN_TUC.findMany({
      where: { TrangThai: trangThai },
      orderBy: { NgayDang: 'desc' },
    });
  }

  // ===== LẤY THEO LOẠI TIN TỨC =====
  async getByLoai(loaiTinTuc: string) {
    return this.prisma.tIN_TUC.findMany({
      where: { LoaiTinTuc: loaiTinTuc },
      orderBy: { NgayDang: 'desc' },
    });
  }

  // ===== TẠO MỚI =====
  async create(dto: Prisma.TIN_TUCUncheckedCreateInput) {
    return this.prisma.tIN_TUC.create({
      data: {
        MaTinTuc: dto.MaTinTuc,
        TieuDe: dto.TieuDe,
        AnhBia: dto.AnhBia ?? null,
        LoaiTinTuc: dto.LoaiTinTuc,
        MoTaNgan: dto.MoTaNgan ?? null,
        NoiDungChiTiet: dto.NoiDungChiTiet ?? null,
        NgayDang: dto.NgayDang ? new Date(dto.NgayDang as any) : null,
        TrangThai: dto.TrangThai,
        MaQuanTriVien: dto.MaQuanTriVien ?? null,
      },
    });
  }

  // ===== CẬP NHẬT =====
  async update(id: string, dto: Prisma.TIN_TUCUncheckedUpdateInput) {
    const data: any = { ...dto };
    if (dto.NgayDang) {
      data.NgayDang = new Date(dto.NgayDang as any);
    }

    return this.prisma.tIN_TUC.update({
      where: { MaTinTuc: id },
      data,
    });
  }

  // ===== CẬP NHẬT TRẠNG THÁI =====
  async updateTrangThai(id: string, trangThai: string) {
    const data: any = { TrangThai: trangThai };
    // Nếu đổi sang "Đã đăng" thì ghi ngày đăng hiện tại
    if (trangThai === 'DaDang') {
      data.NgayDang = new Date();
    }
    return this.prisma.tIN_TUC.update({
      where: { MaTinTuc: id },
      data,
    });
  }

  // ===== XÓA =====
  async delete(id: string) {
    return this.prisma.tIN_TUC.delete({
      where: { MaTinTuc: id },
    });
  }
}
