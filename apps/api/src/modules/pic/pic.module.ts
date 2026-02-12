import { Module } from '@nestjs/common';
import { PicService } from './pic.service';
import { PicController } from './pic.controller';

@Module({
  controllers: [PicController],
  providers: [PicService],
})
export class PicModule {}
