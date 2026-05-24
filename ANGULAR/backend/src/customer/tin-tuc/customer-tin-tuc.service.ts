import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerTinTucService {
  constructor(private prisma: PrismaService) {}

  async getPublishedNews(params: {
    page?: number;
    limit?: number;
    loai?: string;
    search?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TIN_TUCWhereInput = {
      TrangThai: 'DaDang',
    };

    // Filter by type if provided
    if (params.loai && params.loai.trim() !== '') {
      where.LoaiTinTuc = params.loai;
    }

    // Filter by search keyword in Title or Short Description
    if (params.search && params.search.trim() !== '') {
      const searchKeyword = params.search.trim();
      where.OR = [
        { TieuDe: { contains: searchKeyword, mode: 'insensitive' } },
        { MoTaNgan: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination metadata
    const totalItems = await this.prisma.tIN_TUC.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    // Get the news items
    const items = await this.prisma.tIN_TUC.findMany({
      where,
      orderBy: { NgayDang: 'desc' },
      skip,
      take: limit,
    });

    return {
      items,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async getNewsById(id: string) {
    // Find the news item
    const news = await this.prisma.tIN_TUC.findFirst({
      where: {
        MaTinTuc: id,
        TrangThai: 'DaDang',
      },
    });

    if (!news) {
      return null;
    }

    // Find 3 other related news in the same category
    const relatedNews = await this.prisma.tIN_TUC.findMany({
      where: {
        TrangThai: 'DaDang',
        LoaiTinTuc: news.LoaiTinTuc,
        NOT: { MaTinTuc: id },
      },
      orderBy: { NgayDang: 'desc' },
      take: 3,
    });

    // Find 3 latest news overall
    const latestNews = await this.prisma.tIN_TUC.findMany({
      where: {
        TrangThai: 'DaDang',
        NOT: { MaTinTuc: id },
      },
      orderBy: { NgayDang: 'desc' },
      take: 3,
    });

    return {
      news,
      relatedNews,
      latestNews,
    };
  }
}
