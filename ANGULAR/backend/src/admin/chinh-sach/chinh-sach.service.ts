import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class ChinhSachService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) { }

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
    const res = await this.prisma.cHINH_SACH.create({
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

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý chính sách',
      NoiDungChiTiet: `Thêm mới chính sách chung: ${res.TieuDe} (Mã: ${res.MaChinhSach_ND})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaChinhSach_ND', giaTriCu: null, giaTriMoi: res.MaChinhSach_ND },
        { truong: 'TieuDe', giaTriCu: null, giaTriMoi: res.TieuDe },
        { truong: 'LoaiChinhSach', giaTriCu: null, giaTriMoi: res.LoaiChinhSach },
        { truong: 'TrangThai', giaTriCu: null, giaTriMoi: res.TrangThai },
      ],
    });

    return res;
  }

  async updateChinhSach(id: string, dto: Prisma.CHINH_SACHUncheckedUpdateInput) {
    const original = await this.getChinhSachById(id);
    const data: any = { ...dto };
    if (dto.NgayApDung) {
      data.NgayApDung = new Date(dto.NgayApDung as any);
    }
    const res = await this.prisma.cHINH_SACH.update({
      where: { MaChinhSach_ND: id },
      data,
    });

    const changes: any[] = [];
    if (dto.TieuDe && dto.TieuDe !== original?.TieuDe) {
      changes.push({ truong: 'TieuDe', giaTriCu: original?.TieuDe || '', giaTriMoi: dto.TieuDe as string });
    }
    if (dto.NoiDung && dto.NoiDung !== original?.NoiDung) {
      changes.push({ truong: 'NoiDung', giaTriCu: original?.NoiDung || '', giaTriMoi: dto.NoiDung as string });
    }
    if (dto.TrangThai && dto.TrangThai !== original?.TrangThai) {
      changes.push({ truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: dto.TrangThai as string });
    }

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý chính sách',
      NoiDungChiTiet: `Cập nhật chính sách chung: ${res.TieuDe} (Mã: ${id}). Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    });

    return res;
  }

  async deleteChinhSach(id: string) {
    const original = await this.getChinhSachById(id);
    const res = await this.prisma.cHINH_SACH.delete({
      where: { MaChinhSach_ND: id },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý chính sách',
      NoiDungChiTiet: `Xóa chính sách chung: ${original?.TieuDe || ''} (Mã: ${id})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaChinhSach_ND', giaTriCu: id, giaTriMoi: null },
      ],
    });

    return res;
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
    const res = await this.prisma.cHINH_SACH_HUY_VE.create({
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

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý chính sách',
      NoiDungChiTiet: `Thêm mới chính sách hủy vé: ${res.TenChinhSach} (Mã: ${res.MaChinhSach})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaChinhSach', giaTriCu: null, giaTriMoi: res.MaChinhSach },
        { truong: 'TenChinhSach', giaTriCu: null, giaTriMoi: res.TenChinhSach },
        { truong: 'GioiHanGioTruocKhoiHanh', giaTriCu: null, giaTriMoi: res.GioiHanGioTruocKhoiHanh },
        { truong: 'TyLePhiHuy', giaTriCu: null, giaTriMoi: res.TyLePhiHuy },
      ],
    });

    return res;
  }

  async updateChinhSachHuyVe(id: string, dto: Prisma.CHINH_SACH_HUY_VEUncheckedUpdateInput) {
    const original = await this.getChinhSachHuyVeById(id);
    const data: any = { ...dto };
    if (dto.NgayApDung) {
      data.NgayApDung = new Date(dto.NgayApDung as any);
    }
    const res = await this.prisma.cHINH_SACH_HUY_VE.update({
      where: { MaChinhSach: id },
      data,
    });

    const changes: any[] = [];
    if (dto.TenChinhSach && dto.TenChinhSach !== original?.TenChinhSach) {
      changes.push({ truong: 'TenChinhSach', giaTriCu: original?.TenChinhSach || '', giaTriMoi: dto.TenChinhSach as string });
    }
    if (dto.GioiHanGioTruocKhoiHanh !== undefined && Number(dto.GioiHanGioTruocKhoiHanh) !== original?.GioiHanGioTruocKhoiHanh) {
      changes.push({ truong: 'GioiHanGioTruocKhoiHanh', giaTriCu: String(original?.GioiHanGioTruocKhoiHanh || 0), giaTriMoi: String(dto.GioiHanGioTruocKhoiHanh) });
    }
    if (dto.TyLePhiHuy !== undefined && Number(dto.TyLePhiHuy) !== original?.TyLePhiHuy) {
      changes.push({ truong: 'TyLePhiHuy', giaTriCu: String(original?.TyLePhiHuy || 0), giaTriMoi: String(dto.TyLePhiHuy) });
    }
    if (dto.TrangThai && dto.TrangThai !== original?.TrangThai) {
      changes.push({ truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: dto.TrangThai as string });
    }

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý chính sách',
      NoiDungChiTiet: `Cập nhật chính sách hủy vé: ${res.TenChinhSach} (Mã: ${id}). Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    });

    return res;
  }

  async deleteChinhSachHuyVe(id: string) {
    const original = await this.getChinhSachHuyVeById(id);
    const res = await this.prisma.cHINH_SACH_HUY_VE.delete({
      where: { MaChinhSach: id },
    });

    this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý chính sách',
      NoiDungChiTiet: `Xóa chính sách hủy vé: ${original?.TenChinhSach || ''} (Mã: ${id})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaChinhSach', giaTriCu: id, giaTriMoi: null },
      ],
    });

    return res;
  }
}

