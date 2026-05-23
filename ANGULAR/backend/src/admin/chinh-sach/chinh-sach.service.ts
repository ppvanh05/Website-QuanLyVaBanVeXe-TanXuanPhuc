import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChinhSachDto } from './dto/create-chinh-sach.dto';
import { CreateChinhSachHuyVeDto } from './dto/create-chinh-sach-huy-ve.dto';

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

  async createChinhSach(dto: CreateChinhSachDto) {
    return this.prisma.cHINH_SACH.create({
      data: {
        MaChinhSach_ND: dto.MaChinhSach_ND,
        TieuDe: dto.TieuDe,
        LoaiChinhSach: dto.LoaiChinhSach,
        NoiDung: dto.NoiDung,
        NgayApDung: new Date(dto.NgayApDung),
        TrangThai: dto.TrangThai,
        MaQuanTriVien: dto.MaQuanTriVien,
      },
    });
  }

  async updateChinhSach(id: string, dto: Partial<CreateChinhSachDto>) {
    const data: any = { ...dto };
    if (dto.NgayApDung) {
      data.NgayApDung = new Date(dto.NgayApDung);
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

  async createChinhSachHuyVe(dto: CreateChinhSachHuyVeDto) {
    return this.prisma.cHINH_SACH_HUY_VE.create({
      data: {
        MaChinhSach: dto.MaChinhSach,
        TenChinhSach: dto.TenChinhSach,
        GioiHanGioTruocKhoiHanh: dto.GioiHanGioTruocKhoiHanh,
        TyLePhiHuy: dto.TyLePhiHuy,
        MoTa: dto.MoTa ?? null,
        TrangThai: dto.TrangThai,
        NgayApDung: new Date(dto.NgayApDung),
      },
    });
  }

  async updateChinhSachHuyVe(id: string, dto: Partial<CreateChinhSachHuyVeDto>) {
    const data: any = { ...dto };
    if (dto.NgayApDung) {
      data.NgayApDung = new Date(dto.NgayApDung);
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
