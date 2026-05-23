import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ChinhSachService } from './chinh-sach.service';
import { CreateChinhSachDto } from './dto/create-chinh-sach.dto';
import { CreateChinhSachHuyVeDto } from './dto/create-chinh-sach-huy-ve.dto';

@Controller('chinh-sach')
export class ChinhSachController {
  constructor(private readonly chinhSachService: ChinhSachService) {}

  // ===== CHINH_SACH_HUY_VE =====

  @Get('huy-ve/all')
  getAllChinhSachHuyVe() {
    return this.chinhSachService.getAllChinhSachHuyVe();
  }

  @Get('huy-ve/:id')
  getChinhSachHuyVeById(@Param('id') id: string) {
    return this.chinhSachService.getChinhSachHuyVeById(id);
  }

  @Post('huy-ve')
  createChinhSachHuyVe(@Body() dto: CreateChinhSachHuyVeDto) {
    return this.chinhSachService.createChinhSachHuyVe(dto);
  }

  @Put('huy-ve/:id')
  updateChinhSachHuyVe(
    @Param('id') id: string,
    @Body() dto: Partial<CreateChinhSachHuyVeDto>,
  ) {
    return this.chinhSachService.updateChinhSachHuyVe(id, dto);
  }

  @Delete('huy-ve/:id')
  deleteChinhSachHuyVe(@Param('id') id: string) {
    return this.chinhSachService.deleteChinhSachHuyVe(id);
  }

  // ===== CHINH_SACH =====

  @Get()
  getAllChinhSach() {
    return this.chinhSachService.getAllChinhSach();
  }

  @Get(':id')
  getChinhSachById(@Param('id') id: string) {
    return this.chinhSachService.getChinhSachById(id);
  }

  @Post()
  createChinhSach(@Body() dto: CreateChinhSachDto) {
    return this.chinhSachService.createChinhSach(dto);
  }

  @Put(':id')
  updateChinhSach(
    @Param('id') id: string,
    @Body() dto: Partial<CreateChinhSachDto>,
  ) {
    return this.chinhSachService.updateChinhSach(id, dto);
  }

  @Delete(':id')
  deleteChinhSach(@Param('id') id: string) {
    return this.chinhSachService.deleteChinhSach(id);
  }
}
