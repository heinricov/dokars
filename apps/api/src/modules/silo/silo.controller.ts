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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { Request, Express } from 'express';
import { SiloService } from './silo.service';
import { CreateSiloDto } from './dto/create-silo.dto';
import { UpdateSiloDto } from './dto/update-silo.dto';

@Controller('silo')
export class SiloController {
  constructor(private readonly siloService: SiloService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image_url', {
      storage: diskStorage({
        destination: (
          req: Request<any, any, { name?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const name = req.body?.name ?? 'unknown';
          const dest = path.join(process.cwd(), 'image', 'silos', name);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (
          req: Request<any, any, { name?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const ext = path.extname(file.originalname);
          const base = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '-')
            .toLowerCase();
          cb(null, `${base}-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() createSiloDto: CreateSiloDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.siloService.create(createSiloDto, file);
  }

  @Get()
  findAll() {
    return this.siloService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siloService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image_url', {
      storage: diskStorage({
        destination: (
          req: Request<any, any, { name?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const name = req.body?.name ?? 'unknown';
          const dest = path.join(process.cwd(), 'image', 'silos', name);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (
          req: Request<any, any, { name?: string }>,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const ext = path.extname(file.originalname);
          const base = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '-')
            .toLowerCase();
          cb(null, `${base}-${Date.now()}${ext}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateSiloDto: UpdateSiloDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.siloService.update(id, updateSiloDto, file);
  }

  @Delete()
  removeAll() {
    return this.siloService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siloService.remove(id);
  }
}
