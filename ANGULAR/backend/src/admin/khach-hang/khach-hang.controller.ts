import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { Prisma } from '@prisma/client';

@Controller('khach-hang')
export class KhachHangController {
  constructor(private readonly khachHangService: KhachHangService) {}

  // GET /khach-hang → Lấy tất cả khách hàng
  @Get()
  getAll() {
    return this.khachHangService.getAll();
  }

  // GET /khach-hang/trang-thai/:trangThai → Lọc theo trạng thái (HoatDong | DaKhoa)
  @Get('trang-thai/:trangThai')
  getByTrangThai(@Param('trangThai') trangThai: string) {
    return this.khachHangService.getByTrangThai(trangThai);
  }

  // GET /khach-hang/:id → Lấy thông tin 1 khách hàng
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.khachHangService.getById(id);
  }

  // GET /khach-hang/:id/ve → Lịch sử vé của khách hàng
  @Get(':id/ve')
  getVe(@Param('id') id: string) {
    return this.khachHangService.getVeByKhachHang(id);
  }

  // GET /khach-hang/:id/nhat-ky → Nhật ký hoạt động của khách hàng
  @Get(':id/nhat-ky')
  getNhatKy(@Param('id') id: string) {
    return this.khachHangService.getNhatKyByKhachHang(id);
  }

  // PUT /khach-hang/:id → Cập nhật thông tin cơ bản
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Prisma.KHACH_HANGUncheckedUpdateInput) {
    return this.khachHangService.update(id, dto);
  }

  // PATCH /khach-hang/:id/khoa → Khóa tài khoản (cần lý do)
  @Patch(':id/khoa')
  khoaTaiKhoan(@Param('id') id: string, @Body() dto: { LyDoKhoa: string }) {
    return this.khachHangService.khoaTaiKhoan(id, dto);
  }

  // PATCH /khach-hang/:id/mo-khoa → Mở khóa tài khoản
  @Patch(':id/mo-khoa')
  moKhoaTaiKhoan(@Param('id') id: string) {
    return this.khachHangService.moKhoaTaiKhoan(id);
  }
}
