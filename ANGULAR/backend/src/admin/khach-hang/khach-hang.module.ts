import { Module } from '@nestjs/common';
import { KhachHangService } from './khach-hang.service';
import { KhachHangController } from './khach-hang.controller';

@Module({
  controllers: [KhachHangController],
  providers: [KhachHangService],
})
export class KhachHangModule {}
