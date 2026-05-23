import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class TuKhoaCamService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  // ===== LẤY TOÀN BỘ TỪ KHÓA =====
  async getAll() {
    return this.prisma.tU_KHOA_HAN_CHE.findMany({
      orderBy: { MaTuKhoa: 'asc' },
    });
  }

  // ===== TÌM THEO ID =====
  async getById(id: string) {
    const tk = await this.prisma.tU_KHOA_HAN_CHE.findUnique({
      where: { MaTuKhoa: id },
    });
    if (!tk) {
      throw new NotFoundException(`Không tìm thấy từ khóa cấm với mã ${id}`);
    }
    return tk;
  }

  // ===== TẠO MỚI TỪ KHÓA CẤM =====
  async create(dto: Prisma.TU_KHOA_HAN_CHEUncheckedCreateInput) {
    // Kiểm tra xem từ khóa đã tồn tại chưa (case-insensitive)
    const exactKeyword = dto.NoiDungTuKhoa.trim();
    const existing = await this.prisma.tU_KHOA_HAN_CHE.findFirst({
      where: {
        NoiDungTuKhoa: {
          equals: exactKeyword,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Từ khóa "${exactKeyword}" đã tồn tại trong danh sách!`);
    }

    // Tự động phát sinh mã từ khóa dạng TKCxxx
    const listTk = await this.prisma.tU_KHOA_HAN_CHE.findMany({
      select: { MaTuKhoa: true },
    });

    let maxIdNumber = 100000;
    listTk.forEach(tk => {
      const match = tk.MaTuKhoa.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxIdNumber) {
          maxIdNumber = num;
        }
      }
    });

    const newId = `TKC${maxIdNumber + 1}`;

    const res = await this.prisma.tU_KHOA_HAN_CHE.create({
      data: {
        MaTuKhoa: newId,
        NoiDungTuKhoa: exactKeyword,
        LoaiViPham: dto.LoaiViPham,
        TrangThai: dto.TrangThai ?? 'DangApDung',
        ThoiGianCapNhat: new Date(),
        MaQuanTriVien: dto.MaQuanTriVien ?? null,
      },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Thêm từ khóa cấm mới: "${res.NoiDungTuKhoa}" (Mức độ: ${res.LoaiViPham}, Trạng thái: ${res.TrangThai})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaTuKhoa', giaTriCu: null, giaTriMoi: res.MaTuKhoa },
        { truong: 'NoiDungTuKhoa', giaTriCu: null, giaTriMoi: res.NoiDungTuKhoa },
        { truong: 'LoaiViPham', giaTriCu: null, giaTriMoi: res.LoaiViPham },
        { truong: 'TrangThai', giaTriCu: null, giaTriMoi: res.TrangThai },
      ],
    });

    return res;
  }

  // ===== CẬP NHẬT TỪ KHÓA =====
  async update(id: string, dto: Prisma.TU_KHOA_HAN_CHEUncheckedUpdateInput) {
    const original = await this.getById(id);

    if (dto.NoiDungTuKhoa) {
      const exactKeyword = (dto.NoiDungTuKhoa as string).trim();
      const existing = await this.prisma.tU_KHOA_HAN_CHE.findFirst({
        where: {
          NoiDungTuKhoa: {
            equals: exactKeyword,
            mode: 'insensitive',
          },
          NOT: {
            MaTuKhoa: id,
          },
        },
      });
      if (existing) {
        throw new BadRequestException(`Từ khóa "${exactKeyword}" đã tồn tại ở bản ghi khác!`);
      }
      dto.NoiDungTuKhoa = exactKeyword;
    }

    const res = await this.prisma.tU_KHOA_HAN_CHE.update({
      where: { MaTuKhoa: id },
      data: {
        ...dto,
        ThoiGianCapNhat: new Date(),
      },
    });

    const changes: any[] = [];
    if (dto.NoiDungTuKhoa && dto.NoiDungTuKhoa !== original?.NoiDungTuKhoa) {
      changes.push({ truong: 'NoiDungTuKhoa', giaTriCu: original?.NoiDungTuKhoa || '', giaTriMoi: dto.NoiDungTuKhoa as string });
    }
    if (dto.LoaiViPham && dto.LoaiViPham !== original?.LoaiViPham) {
      changes.push({ truong: 'LoaiViPham', giaTriCu: original?.LoaiViPham || '', giaTriMoi: dto.LoaiViPham as string });
    }
    if (dto.TrangThai && dto.TrangThai !== original?.TrangThai) {
      changes.push({ truong: 'TrangThai', giaTriCu: original?.TrangThai || '', giaTriMoi: dto.TrangThai as string });
    }

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Cập nhật từ khóa cấm: "${res.NoiDungTuKhoa}" (Mã: ${id}). Chi tiết: ${changes.map(c => `${c.truong}: ${c.giaTriCu} -> ${c.giaTriMoi}`).join(', ') || 'Không thay đổi trường cốt lõi'}`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: changes,
    });

    return res;
  }

  // ===== XÓA TỪ KHÓA CẤM =====
  async delete(id: string) {
    const original = await this.getById(id);
    const res = await this.prisma.tU_KHOA_HAN_CHE.delete({
      where: { MaTuKhoa: id },
    });

    await this.nhatKyService.ghiLog({
      MaNhanVien: 'NVDP001',
      LoaiThaoTac: 'Quản lý tài khoản',
      NoiDungChiTiet: `Xóa từ khóa cấm: "${original?.NoiDungTuKhoa || ''}" (Mã: ${id})`,
      TrangThai: 'Thành công',
      DuLieuThayDoi: [
        { truong: 'MaTuKhoa', giaTriCu: id, giaTriMoi: null },
      ],
    });

    return res;
  }
}

