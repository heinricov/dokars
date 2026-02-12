import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    try {
      const created = await this.prisma.invoice_receipt.create({
        data: {
          user_id: createInvoiceDto.user_id,
          register_no: createInvoiceDto.register_no,
          submit_date: new Date(createInvoiceDto.submit_date),
          silo_id: createInvoiceDto.silo_id,
          pic_id: createInvoiceDto.pic_id,
          vendor_id: createInvoiceDto.vendor_id ?? null,
          invoice_no: createInvoiceDto.invoice_no ?? null,
          po_no: createInvoiceDto.po_no ?? null,
          latest_date: createInvoiceDto.latest_date
            ? new Date(createInvoiceDto.latest_date)
            : null,
          note: createInvoiceDto.note ?? null,
          scan_date: createInvoiceDto.scan_date
            ? new Date(createInvoiceDto.scan_date)
            : null,
          upload_date: createInvoiceDto.upload_date
            ? new Date(createInvoiceDto.upload_date)
            : null,
          is_urgent: createInvoiceDto.is_urgent ?? false,
          is_done: createInvoiceDto.is_done ?? false,
        },
      });
      return {
        code: 201,
        status: 'success',
        message: 'Invoice created',
        id: created.id,
        register_no: created.register_no,
        submit_date: created.submit_date,
        invoice_no: created.invoice_no,
        po_no: created.po_no,
        is_urgent: created.is_urgent,
        is_done: created.is_done,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal membuat invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const data = await this.prisma.invoice_receipt.findMany();
    const count = data.length;
    const updatedAt =
      data.reduce<Date | null>(
        (max, r) =>
          !max || (r.updatedAt && r.updatedAt > max) ? r.updatedAt : max,
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
    const receipt = await this.prisma.invoice_receipt.findUnique({
      where: { id },
    });
    if (!receipt) {
      throw new HttpException('Invoice tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return {
      code: 200,
      status: 'success',
      id: receipt.id,
      register_no: receipt.register_no,
      submit_date: receipt.submit_date,
      invoice_no: receipt.invoice_no,
      po_no: receipt.po_no,
      is_urgent: receipt.is_urgent,
      is_done: receipt.is_done,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice_receipt.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new HttpException('Invoice tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    const updated = await this.prisma.invoice_receipt.update({
      where: { id },
      data: {
        user_id: updateInvoiceDto.user_id ?? existing.user_id,
        register_no: updateInvoiceDto.register_no ?? existing.register_no,
        submit_date: updateInvoiceDto.submit_date
          ? new Date(updateInvoiceDto.submit_date)
          : existing.submit_date,
        silo_id: updateInvoiceDto.silo_id ?? existing.silo_id,
        pic_id: updateInvoiceDto.pic_id ?? existing.pic_id,
        vendor_id:
          updateInvoiceDto.vendor_id !== undefined
            ? updateInvoiceDto.vendor_id
            : existing.vendor_id,
        invoice_no: updateInvoiceDto.invoice_no ?? existing.invoice_no,
        po_no: updateInvoiceDto.po_no ?? existing.po_no,
        latest_date: updateInvoiceDto.latest_date
          ? new Date(updateInvoiceDto.latest_date)
          : existing.latest_date,
        note: updateInvoiceDto.note ?? existing.note,
        scan_date: updateInvoiceDto.scan_date
          ? new Date(updateInvoiceDto.scan_date)
          : existing.scan_date,
        upload_date: updateInvoiceDto.upload_date
          ? new Date(updateInvoiceDto.upload_date)
          : existing.upload_date,
        is_urgent:
          updateInvoiceDto.is_urgent !== undefined
            ? updateInvoiceDto.is_urgent
            : existing.is_urgent,
        is_done:
          updateInvoiceDto.is_done !== undefined
            ? updateInvoiceDto.is_done
            : existing.is_done,
      },
    });
    return {
      code: 200,
      status: 'success',
      message: 'Invoice updated',
      id: updated.id,
      register_no: updated.register_no,
      submit_date: updated.submit_date,
      invoice_no: updated.invoice_no,
      po_no: updated.po_no,
      is_urgent: updated.is_urgent,
      is_done: updated.is_done,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.invoice_receipt.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new HttpException(
          'Invoice tidak ditemukan',
          HttpStatus.NOT_FOUND,
        );
      }
      const deleted = await this.prisma.invoice_receipt.delete({
        where: { id },
      });
      return {
        code: 200,
        status: 'success',
        message: 'Invoice deleted',
        id: deleted.id,
        register_no: deleted.register_no,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus invoice',
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeAll() {
    try {
      const res = await this.prisma.invoice_receipt.deleteMany();
      return {
        code: 200,
        status: 'success',
        message: 'All invoices deleted',
        count: res.count,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus semua invoice',
        HttpStatus.CONFLICT,
      );
    }
  }
}
