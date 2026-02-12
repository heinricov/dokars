import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PicService } from './pic.service';
import { CreatePicDto } from './dto/create-pic.dto';
import { UpdatePicDto } from './dto/update-pic.dto';

@Controller('pic')
export class PicController {
  constructor(private readonly picService: PicService) {}

  @Post()
  create(@Body() createPicDto: CreatePicDto) {
    return this.picService.create(createPicDto);
  }

  @Get()
  findAll() {
    return this.picService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.picService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePicDto: UpdatePicDto) {
    return this.picService.update(+id, updatePicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.picService.remove(+id);
  }
}
