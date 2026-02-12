import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { Request, Express } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('user_image', {
      storage: diskStorage({
        destination: (
          req: Request<any, any, { username?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const username = req.body?.username ?? 'unknown';
          const dest = path.join(process.cwd(), 'image', 'users', username);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (
          req: Request<any, any, { username?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const ext = path.extname(file.originalname);
          const name = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '-')
            .toLowerCase();
          cb(null, `${name}-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, file);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('user_image', {
      storage: diskStorage({
        destination: (
          req: Request<any, any, { username?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const username = req.body?.username ?? 'unknown';
          const dest = path.join(process.cwd(), 'image', 'users', username);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (
          req: Request<any, any, { username?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const ext = path.extname(file.originalname);
          const name = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '-')
            .toLowerCase();
          cb(null, `${name}-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, file);
  }

  @Delete()
  removeAll() {
    return this.userService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
