import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePicDto } from './dto/create-pic.dto';
import { UpdatePicDto } from './dto/update-pic.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPicDto: CreatePicDto) {
    try {
      const created = await this.prisma.pic.create({
        data: {
          name: createPicDto.name,
          team: createPicDto.team ?? null,
          email: createPicDto.email ?? null,
          phone: createPicDto.phone ?? null,
        },
      });
      return {
        code: 201,
        status: 'success',
        message: 'Pic created',
        id: created.id,
        name: created.name,
        team: created.team,
        email: created.email,
        phone: created.phone,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal membuat pic',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const data = await this.prisma.pic.findMany();
    const count = data.length;
    const updatedAt =
      data.reduce<Date | null>(
        (max, u) =>
          !max || (u.updatedAt && u.updatedAt > max) ? u.updatedAt : max,
        null,
      ) ?? null;
    return {
      code: 200,
      status: 'success',
      count,
      updatedAt,
      data,
    };
  }

  async findOne(id: string) {
    const pic = await this.prisma.pic.findUnique({ where: { id } });
    if (!pic) {
      throw new HttpException('Pic tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return {
      code: 200,
      status: 'success',
      id: pic.id,
      name: pic.name,
      team: pic.team,
      email: pic.email,
      phone: pic.phone,
      createdAt: pic.createdAt,
      updatedAt: pic.updatedAt,
    };
  }

  async update(id: string, updatePicDto: UpdatePicDto) {
    const existing = await this.prisma.pic.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException('Pic tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.pic.update({
      where: { id },
      data: {
        name: updatePicDto.name ?? existing.name,
        team: updatePicDto.team ?? existing.team,
        email: updatePicDto.email ?? existing.email,
        phone: updatePicDto.phone ?? existing.phone,
      },
    });
    return {
      code: 200,
      status: 'success',
      message: 'Pic updated',
      id: updated.id,
      name: updated.name,
      team: updated.team,
      email: updated.email,
      phone: updated.phone,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.pic.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpException('Pic tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      const deleted = await this.prisma.pic.delete({ where: { id } });
      return {
        code: 200,
        status: 'success',
        message: 'Pic deleted',
        id: deleted.id,
        name: deleted.name,
        email: deleted.email,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus pic',
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeAll() {
    try {
      const res = await this.prisma.pic.deleteMany();
      return {
        code: 200,
        status: 'success',
        message: 'All pics deleted',
        count: res.count,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus semua pic',
        HttpStatus.CONFLICT,
      );
    }
  }
}
