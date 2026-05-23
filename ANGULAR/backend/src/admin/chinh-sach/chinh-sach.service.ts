import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChinhSachService {
  constructor(private prisma: PrismaService) {}

  // ===== CHINH_SACH (Chính sách chung) =====

  async getAllChinhSach() {
    return this.prisma.cHINH_SACH.findMany({
      orderBy: { NgayApDung: 'desc' },
    });
  }

  async getChinhSachById(id: string) {
    return this.prisma.cHINH_SACH.findUnique({
      where: { MaChinhSach_ND: id },
    });
  }

  async createChinhSach(dto: Prisma.CHINH_SACHUncheckedCreateInput) {
    return this.prisma.cHINH_SACH.create({
      data: {
        MaChinhSach_ND: dto.MaChinhSach_ND,
        TieuDe: dto.TieuDe,
        LoaiChinhSach: dto.LoaiChinhSach,
        NoiDung: dto.NoiDung,
        NgayApDung: new Date(dto.NgayApDung as any),
        TrangThai: dto.TrangThai ?? 'DangApDung',
        MaQuanTriVien: dto.MaQuanTriVien,
      },
    });
  }

  async updateChinhSach(id: string, dto: Prisma.CHINH_SACHUncheckedUpdateInput) {
    const data: any = { ...dto };
    if (dto.NgayApDung) {
      data.NgayApDung = new Date(dto.NgayApDung as any);
    }
    return this.prisma.cHINH_SACH.update({
      where: { MaChinhSach_ND: id },
      data,
    });
  }

  async deleteChinhSach(id: string) {
    return this.prisma.cHINH_SACH.delete({
      where: { MaChinhSach_ND: id },
    });
  }

  // ===== CHINH_SACH_HUY_VE (Chính sách hủy vé) =====

  async getAllChinhSachHuyVe() {
    return this.prisma.cHINH_SACH_HUY_VE.findMany({
      orderBy: { NgayApDung: 'desc' },
    });
  }

  async getChinhSachHuyVeById(id: string) {
    return this.prisma.cHINH_SACH_HUY_VE.findUnique({
      where: { MaChinhSach: id },
    });
  }

  async createChinhSachHuyVe(dto: Prisma.CHINH_SACH_HUY_VEUncheckedCreateInput) {
    return this.prisma.cHINH_SACH_HUY_VE.create({
      data: {
        MaChinhSach: dto.MaChinhSach,
        TenChinhSach: dto.TenChinhSach,
        GioiHanGioTruocKhoiHanh: Number(dto.GioiHanGioTruocKhoiHanh),
        TyLePhiHuy: Number(dto.TyLePhiHuy),
        MoTa: dto.MoTa ?? null,
        TrangThai: dto.TrangThai ?? 'DangApDung',
        NgayApDung: new Date(dto.NgayApDung as any),
      },
    });
  }

  async updateChinhSachHuyVe(id: string, dto: Prisma.CHINH_SACH_HUY_VEUncheckedUpdateInput) {
    const data: any = { ...dto };
    if (dto.NgayApDung) {
      data.NgayApDung = new Date(dto.NgayApDung as any);
    }
    return this.prisma.cHINH_SACH_HUY_VE.update({
      where: { MaChinhSach: id },
      data,
    });
  }

  async deleteChinhSachHuyVe(id: string) {
    return this.prisma.cHINH_SACH_HUY_VE.delete({
      where: { MaChinhSach: id },
    });
  }
}
