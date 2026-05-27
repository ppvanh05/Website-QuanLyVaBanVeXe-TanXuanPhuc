import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: any) { // Thay thế DTO bằng 'any'
    const { MaVe, MaKhachHang, SoSao, NoiDungDanhGia, mediaUrls } = createReviewDto;

    // Tạo một MaDanhGia duy nhất. Đây là một ví dụ đơn giản.
    // Trong ứng dụng thực tế, bạn nên sử dụng một chiến lược tạo ID mạnh mẽ hơn
    // hoặc để cơ sở dữ liệu tự động xử lý nếu có thể (ví dụ: sử dụng sequence hoặc trigger).
    const generatedMaDanhGia = `DG${Date.now().toString().slice(-8)}`; // Ví dụ: DG1716478901

    const newReview = await this.prisma.dANH_GIA.create({
      data: {
        MaDanhGia: generatedMaDanhGia, // Cung cấp ID đã tạo
        SoSao,
        NoiDungDanhGia,
        ThoiGianDanhGia: new Date(),
        TrangThaiPhanHoi: 'Pending', // Trạng thái mặc định
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
        // Các trường khác của MEDIA_DANH_GIA có thể được thêm vào đây nếu cần
      }));
      await this.prisma.mEDIA_DANH_GIA.createMany({
        data: mediaData,
      });
    }

    return newReview;
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
