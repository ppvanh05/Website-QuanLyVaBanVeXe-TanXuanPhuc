import { Module } from '@nestjs/common';
import { TinTucService } from './tin-tuc.service';
import { TinTucController } from './tin-tuc.controller';

@Module({
  controllers: [TinTucController],
  providers: [TinTucService],
})
export class TinTucModule {}
