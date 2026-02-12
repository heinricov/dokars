import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSiloDto } from './dto/create-silo.dto';
import { UpdateSiloDto } from './dto/update-silo.dto';
import { PrismaService } from '../../database/prisma.service';
import { put, del, list } from '@vercel/blob';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { promises as fsp } from 'node:fs';
type UploadedFile = {
  filename: string;
  destination?: string;
  path?: string;
};

@Injectable()
export class SiloService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSiloDto: CreateSiloDto, file?: UploadedFile) {
    try {
      let imageUrl: string | null = null;
      if (file) {
        const name = createSiloDto.name ?? 'unknown';
        const localDir = path.join(process.cwd(), 'image', 'silos', name);
        fs.mkdirSync(localDir, { recursive: true });
        const localPath =
          file.destination && file.filename
            ? path.join(file.destination, file.filename)
            : path.join(localDir, file.filename);

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
          throw new HttpException(
            'Konfigurasi blob tidak tersedia',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        const blobKey = `image/silos/${name}/${file.filename}`;
        const result = await put(blobKey, await fsp.readFile(localPath), {
          access: 'public',
          token,
        });
        imageUrl = result.url;
      }

      const created = await this.prisma.silo.create({
        data: {
          name: createSiloDto.name,
          description: createSiloDto.description ?? null,
          image_url: imageUrl ?? createSiloDto.image_url ?? null,
        },
      });
      return {
        code: 201,
        status: 'success',
        message: 'Silo created',
        id: created.id,
        name: created.name,
        description: created.description,
        image_url: created.image_url,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal membuat silo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const data = await this.prisma.silo.findMany();
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
    const silo = await this.prisma.silo.findUnique({ where: { id } });
    if (!silo) {
      throw new HttpException('Silo tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return {
      code: 200,
      status: 'success',
      id: silo.id,
      name: silo.name,
      description: silo.description,
      image_url: silo.image_url,
      createdAt: silo.createdAt,
      updatedAt: silo.updatedAt,
    };
  }

  async update(id: string, updateSiloDto: UpdateSiloDto, file?: UploadedFile) {
    const existing = await this.prisma.silo.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException('Silo tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    let imageUrl: string | undefined;
    if (file) {
      const name = updateSiloDto.name ?? existing.name ?? 'unknown';
      const localDir = path.join(process.cwd(), 'image', 'silos', name);
      fs.mkdirSync(localDir, { recursive: true });
      const localPath =
        file.destination && file.filename
          ? path.join(file.destination, file.filename)
          : path.join(localDir, file.filename);

      const prevUrl = existing.image_url ?? '';
      if (prevUrl) {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (token) {
          await del(prevUrl, { token }).catch(() => undefined);
        }
        const prevFileName = prevUrl.split('/').pop() ?? '';
        if (prevFileName) {
          const prevLocalPath = path.join(localDir, prevFileName);
          await fsp.rm(prevLocalPath, { force: true }).catch(() => undefined);
        }
        const entries = (await fsp
          .readdir(localDir)
          .catch(() => [])) as string[];
        await Promise.all(
          entries
            .filter((name) => name !== file.filename)
            .map((name) =>
              fsp
                .rm(path.join(localDir, name), { force: true })
                .catch(() => undefined),
            ),
        );
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        throw new HttpException(
          'Konfigurasi blob tidak tersedia',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const blobKey = `image/silos/${name}/${file.filename}`;
      const result = await put(blobKey, await fsp.readFile(localPath), {
        access: 'public',
        token,
      });
      imageUrl = result.url;
    }
    const updated = await this.prisma.silo.update({
      where: { id },
      data: {
        name: updateSiloDto.name ?? existing.name,
        description: updateSiloDto.description ?? existing.description,
        image_url: imageUrl ?? updateSiloDto.image_url ?? existing.image_url,
      },
    });
    return {
      code: 200,
      status: 'success',
      message: 'Silo updated',
      id: updated.id,
      name: updated.name,
      description: updated.description,
      image_url: updated.image_url,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.silo.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpException('Silo tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      const name = existing.name ?? 'unknown';
      const siloDir = path.join(process.cwd(), 'image', 'silos', name);
      await fsp.rm(siloDir, { recursive: true, force: true });
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        const prefix = `image/silos/${name}/`;
        const listing = await list({ prefix, token });
        for (const b of listing.blobs ?? []) {
          await del(b.url, { token });
        }
      }
      const deleted = await this.prisma.silo.delete({ where: { id } });
      return {
        code: 200,
        status: 'success',
        message: 'Silo deleted',
        id: deleted.id,
        name: deleted.name,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus silo',
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeAll() {
    try {
      const silos = await this.prisma.silo.findMany({ select: { name: true } });
      const uniqueNames = Array.from(
        new Set(silos.map((s) => s.name ?? 'unknown')),
      );
      for (const name of uniqueNames) {
        const siloDir = path.join(process.cwd(), 'image', 'silos', name);
        await fsp.rm(siloDir, { recursive: true, force: true });
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (token) {
          const prefix = `image/silos/${name}/`;
          const listing = await list({ prefix, token });
          for (const b of listing.blobs ?? []) {
            await del(b.url, { token });
          }
        }
      }
      const res = await this.prisma.silo.deleteMany();
      return {
        code: 200,
        status: 'success',
        message: 'All silos deleted',
        count: res.count,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus semua silo',
        HttpStatus.CONFLICT,
      );
    }
  }
}
