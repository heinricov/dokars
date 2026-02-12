import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PicModule } from './modules/pic/pic.module';

@Module({
  imports: [UserModule, PicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
