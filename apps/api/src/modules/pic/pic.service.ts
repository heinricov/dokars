import { Injectable } from '@nestjs/common';
import { CreatePicDto } from './dto/create-pic.dto';
import { UpdatePicDto } from './dto/update-pic.dto';

@Injectable()
export class PicService {
  create(createPicDto: CreatePicDto) {
    return 'This action adds a new pic';
  }

  findAll() {
    return `This action returns all pic`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pic`;
  }

  update(id: number, updatePicDto: UpdatePicDto) {
    return `This action updates a #${id} pic`;
  }

  remove(id: number) {
    return `This action removes a #${id} pic`;
  }
}
