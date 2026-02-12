import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SiloService } from './silo.service';
import { CreateSiloDto } from './dto/create-silo.dto';
import { UpdateSiloDto } from './dto/update-silo.dto';

@Controller('silo')
export class SiloController {
  constructor(private readonly siloService: SiloService) {}

  @Post()
  create(@Body() createSiloDto: CreateSiloDto) {
    return this.siloService.create(createSiloDto);
  }

  @Get()
  findAll() {
    return this.siloService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siloService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiloDto: UpdateSiloDto) {
    return this.siloService.update(+id, updateSiloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siloService.remove(+id);
  }
}
