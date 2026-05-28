import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CustomerExceptionFilter } from '../customer-exception.filter';

@Controller('customer/reviews')
@UseFilters(CustomerExceptionFilter)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() createReviewDto: any) {
    const data = await this.reviewService.create(createReviewDto);
    return {
      success: true,
      message: 'Tạo đánh giá thành công!',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.reviewService.findAll();
    return {
      success: true,
      message: 'Lấy danh sách đánh giá thành công!',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.reviewService.findOne(id);
    return {
      success: true,
      message: 'Lấy chi tiết đánh giá thành công!',
      data,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: any) {
    const data = await this.reviewService.update(id, updateReviewDto);
    return {
      success: true,
      message: 'Cập nhật đánh giá thành công!',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.reviewService.remove(id);
    return {
      success: true,
      message: 'Xóa đánh giá thành công!',
      data,
    };
  }
}
