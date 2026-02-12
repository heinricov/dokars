import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
    try {
      const created = await this.prisma.vendor.create({
        data: {
          name: createVendorDto.name,
          pic: createVendorDto.pic ?? null,
          email: createVendorDto.email ?? null,
          phone: createVendorDto.phone ?? null,
        },
      });
      return {
        code: 201,
        status: 'success',
        message: 'Vendor created',
        id: created.id,
        name: created.name,
        pic: created.pic,
        email: created.email,
        phone: created.phone,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal membuat vendor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const data = await this.prisma.vendor.findMany();
    const count = data.length;
    const updatedAt =
      data.reduce<Date | null>(
        (max, v) =>
          !max || (v.updatedAt && v.updatedAt > max) ? v.updatedAt : max,
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
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new HttpException('Vendor tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return {
      code: 200,
      status: 'success',
      id: vendor.id,
      name: vendor.name,
      pic: vendor.pic,
      email: vendor.email,
      phone: vendor.phone,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException('Vendor tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.vendor.update({
      where: { id },
      data: {
        name: updateVendorDto.name ?? existing.name,
        pic: updateVendorDto.pic ?? existing.pic,
        email: updateVendorDto.email ?? existing.email,
        phone: updateVendorDto.phone ?? existing.phone,
      },
    });
    return {
      code: 200,
      status: 'success',
      message: 'Vendor updated',
      id: updated.id,
      name: updated.name,
      pic: updated.pic,
      email: updated.email,
      phone: updated.phone,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.vendor.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpException('Vendor tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      const deleted = await this.prisma.vendor.delete({ where: { id } });
      return {
        code: 200,
        status: 'success',
        message: 'Vendor deleted',
        id: deleted.id,
        name: deleted.name,
        email: deleted.email,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus vendor',
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeAll() {
    try {
      const res = await this.prisma.vendor.deleteMany();
      return {
        code: 200,
        status: 'success',
        message: 'All vendors deleted',
        count: res.count,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus semua vendor',
        HttpStatus.CONFLICT,
      );
    }
  }
}
