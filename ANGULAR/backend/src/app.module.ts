import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChinhSachModule } from './chinh-sach/chinh-sach.module';
import { BaoCaoModule } from './bao-cao/bao-cao.module';

@Module({
  imports: [PrismaModule, TicketsModule, ChinhSachModule, BaoCaoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

