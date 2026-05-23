import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChinhSachModule } from './chinh-sach/chinh-sach.module';

@Module({
  imports: [PrismaModule, TicketsModule, ChinhSachModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
