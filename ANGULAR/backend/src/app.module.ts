import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChinhSachModule } from './admin/chinh-sach/chinh-sach.module';
import { BaoCaoModule } from './admin/bao-cao/bao-cao.module';
import { TinTucModule } from './admin/tin-tuc/tin-tuc.module';
import { KhachHangModule } from './admin/khach-hang/khach-hang.module';
import { CustomerTinTucModule } from './customer/tin-tuc/customer-tin-tuc.module';
import { ReviewModule } from './customer/review/review.module';

@Module({
  imports: [
    PrismaModule,
    TicketsModule,
    ChinhSachModule,
    BaoCaoModule,
    TinTucModule,
    KhachHangModule,
    CustomerTinTucModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

