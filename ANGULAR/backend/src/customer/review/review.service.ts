import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NhatKyHeThongService } from '../../admin/nhat-ky-he-thong/nhat-ky-he-thong.service';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private nhatKyService: NhatKyHeThongService
  ) {}

  async create(createReviewDto: any) { // Thay thế DTO bằng 'any'
    const { MaVe, MaKhachHang, SoSao, NoiDungDanhGia, mediaUrls } = createReviewDto;

    // Tạo một MaDanhGia duy nhất. Đây là một ví dụ đơn giản.
    // Trong ứng dụng thực tế, bạn nên sử dụng một chiến lược tạo ID mạnh mẽ hơn
    // hoặc để cơ sở dữ liệu tự động xử lý nếu có thể (ví dụ: sử dụng sequence hoặc trigger).
    const generatedMaDanhGia = `DG${Date.now().toString().slice(-8)}`; // Ví dụ: DG1716478901

    const result = await this.prisma.$transaction(async (tx) => {
      const newReview = await tx.dANH_GIA.create({
        data: {
          MaDanhGia: generatedMaDanhGia, // Cung cấp ID đã tạo
          SoSao,
          NoiDungDanhGia,
          ThoiGianDanhGia: new Date(),
          TrangThaiPhanHoi: 'ChuaPhanHoi', // Trạng thái mặc định
          KHACH_HANG: {
            connect: { MaKhachHang: MaKhachHang }, // Kết nối với bản ghi KHACH_HANG hiện có
          },
          VE_DIEN_TU: {
            connect: { MaVe: MaVe }, // Kết nối với bản ghi VE_DIEN_TU hiện có
          },
        },
      });

      if (mediaUrls && mediaUrls.length > 0) {
        const mediaData = mediaUrls.map((url) => ({
          MaDanhGia: newReview.MaDanhGia, // Sử dụng ID của đánh giá vừa tạo
          DuongDanFile: url,
        }));
        await tx.mEDIA_DANH_GIA.createMany({
          data: mediaData,
        });
      }

      // Find associated ticket and update statuses
      const ticket = await tx.vE_DIEN_TU.findUnique({ where: { MaVe: MaVe } });
      if (ticket && ticket.MaDonHang) {
        await tx.dON_HANG.update({
          where: { MaDonHang: ticket.MaDonHang },
          data: { TrangThaiDonHang: 'DaDanhGia' },
        });

        await tx.vE_DIEN_TU.updateMany({
          where: { MaDonHang: ticket.MaDonHang },
          data: { TrangThaiVe: 'DaDanhGia' },
        });
      }

      return newReview;
    });

    await this.nhatKyService.ghiLog({
      MaKhachHang: MaKhachHang,
      MaVe: MaVe,
      LoaiThaoTac: 'Đánh giá dịch vụ',
      NoiDungChiTiet: `Khách hàng đánh giá chuyến xe với ${SoSao} sao.`,
      TrangThai: 'Thành công',
    });

    return result;
  }

  async findAll() {
    return this.prisma.dANH_GIA.findMany({
      include: {
        MEDIA_DANH_GIA: true, // Bao gồm các media liên quan
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.dANH_GIA.findUnique({
      where: { MaDanhGia: id },
      include: {
        MEDIA_DANH_GIA: true,
      },
    });
  }

  async update(id: string, updateReviewDto: any) { // Thay thế DTO bằng 'any'
    const { mediaUrls, ...reviewData } = updateReviewDto;

    const updatedReview = await this.prisma.dANH_GIA.update({
      where: { MaDanhGia: id },
      data: reviewData,
    });

    if (mediaUrls !== undefined) {
      // Xóa tất cả media cũ và thêm media mới
      await this.prisma.mEDIA_DANH_GIA.deleteMany({
        where: { MaDanhGia: id },
      });

      if (mediaUrls.length > 0) {
        const mediaData = mediaUrls.map((url) => ({
          MaDanhGia: id,
          DuongDanFile: url,
        }));
        await this.prisma.mEDIA_DANH_GIA.createMany({
          data: mediaData,
        });
      }
    }

    return updatedReview;
  }

  async remove(id: string) {
    return this.prisma.dANH_GIA.delete({
      where: { MaDanhGia: id },
    });
  }
}
