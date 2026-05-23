import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChinhSachModule } from './admin/chinh-sach/chinh-sach.module';
import { BaoCaoModule } from './admin/bao-cao/bao-cao.module';
import { TinTucModule } from './admin/tin-tuc/tin-tuc.module';
import { KhachHangModule } from './admin/khach-hang/khach-hang.module';
import { DieuHanhModule } from './admin/dieu-hanh/dieu-hanh.module';

@Module({
  imports: [PrismaModule, TicketsModule, ChinhSachModule, BaoCaoModule, TinTucModule, KhachHangModule, DieuHanhModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

