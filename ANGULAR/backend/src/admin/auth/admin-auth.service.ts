import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../nhat-ky-he-thong/nhat-ky-he-thong.service';
import { AdminJwtHelper } from './admin-jwt.helper';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService,
  ) {}

  async login(dto: { email: string; matKhau: string }) {
    const email = dto.email.trim();

    const admin = await this.prisma.nHAN_VIEN.findFirst({
      where: {
        Email: email,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    if (admin.TrangThai === 'DaKhoa') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa!');
    }

    // Compare plain passwords
    if (admin.MatKhau !== dto.matKhau) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // Generate token
    const token = AdminJwtHelper.sign({
      maNhanVien: admin.MaNhanVien,
      email: admin.Email || '',
      loaiTaiKhoan: admin.LoaiTaiKhoan,
      tenHienThi: admin.TenHienThi || admin.Ten || '',
      quyen: admin.Quyen,
    });

    // Record log
    await this.nhatKyService.ghiLog({
      MaNhanVien: admin.MaNhanVien,
      LoaiThaoTac: 'Đăng nhập',
      NoiDungChiTiet: `Nhân viên đăng nhập thành công vào hệ thống Admin.`,
      TrangThai: 'Thành công',
    }).catch(err => console.error('Failed to log admin login:', err));

    const { MatKhau, ...adminData } = admin;
    
    // Map data
    let loai = admin.LoaiTaiKhoan as string;
    if (loai === 'NhanVienBanVe') loai = 'BanVe';
    else if (loai === 'NhanVienDieuPhoi') loai = 'DieuPhoi';

    return {
      token,
      admin: {
        ...adminData,
        LoaiTaiKhoan: loai,
      },
    };
  }
}
