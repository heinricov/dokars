import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PicModule } from './modules/pic/pic.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './database/prisma.module';
import { SiloModule } from './modules/silo/silo.module';

@Module({
  imports: [PrismaModule, UserModule, PicModule, SiloModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
