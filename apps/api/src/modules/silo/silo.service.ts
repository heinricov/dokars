import { Injectable } from '@nestjs/common';
import { CreateSiloDto } from './dto/create-silo.dto';
import { UpdateSiloDto } from './dto/update-silo.dto';

@Injectable()
export class SiloService {
  create(createSiloDto: CreateSiloDto) {
    return 'This action adds a new silo';
  }

  findAll() {
    return `This action returns all silo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} silo`;
  }

  update(id: number, updateSiloDto: UpdateSiloDto) {
    return `This action updates a #${id} silo`;
  }

  remove(id: number) {
    return `This action removes a #${id} silo`;
  }
}
