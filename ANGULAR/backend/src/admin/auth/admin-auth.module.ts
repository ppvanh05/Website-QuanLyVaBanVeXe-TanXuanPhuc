import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { NhatKyHeThongModule } from '../nhat-ky-he-thong/nhat-ky-he-thong.module';

@Module({
  imports: [NhatKyHeThongModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
