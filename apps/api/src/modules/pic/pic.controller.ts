import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PicService } from './pic.service';
import { CreatePicDto } from './dto/create-pic.dto';
import { UpdatePicDto } from './dto/update-pic.dto';

@Controller('pic')
export class PicController {
  constructor(private readonly picService: PicService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pic_image'))
  create(@Body() createPicDto: CreatePicDto) {
    return this.picService.create(createPicDto);
  }

  @Get()
  findAll() {
    return this.picService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.picService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('pic_image'))
  update(@Param('id') id: string, @Body() updatePicDto: UpdatePicDto) {
    return this.picService.update(id, updatePicDto);
  }

  @Delete()
  removeAll() {
    return this.picService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.picService.remove(id);
  }
}
