import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const created = await this.prisma.customer.create({
        data: {
          name: createCustomerDto.name,
          email: createCustomerDto.email ?? null,
          phone: createCustomerDto.phone ?? null,
        },
      });
      return {
        code: 201,
        status: 'success',
        message: 'Customer created',
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal membuat customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const data = await this.prisma.customer.findMany();
    const count = data.length;
    const updatedAt =
      data.reduce<Date | null>(
        (max, c) =>
          !max || (c.updatedAt && c.updatedAt > max) ? c.updatedAt : max,
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
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new HttpException('Customer tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return {
      code: 200,
      status: 'success',
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException('Customer tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        name: updateCustomerDto.name ?? existing.name,
        email: updateCustomerDto.email ?? existing.email,
        phone: updateCustomerDto.phone ?? existing.phone,
      },
    });
    return {
      code: 200,
      status: 'success',
      message: 'Customer updated',
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.customer.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpException(
          'Customer tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );
      }
      const deleted = await this.prisma.customer.delete({ where: { id } });
      return {
        code: 200,
        status: 'success',
        message: 'Customer deleted',
        id: deleted.id,
        name: deleted.name,
        email: deleted.email,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus customer',
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeAll() {
    try {
      const res = await this.prisma.customer.deleteMany();
      return {
        code: 200,
        status: 'success',
        message: 'All customers deleted',
        count: res.count,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus semua customer',
        HttpStatus.CONFLICT,
      );
    }
  }
}
