import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, file?: UploadedFile) {
    try {
      let imageUrl: string | null = null;
      if (file) {
        const username = createUserDto.username ?? 'unknown';
        const localDir = path.join(process.cwd(), 'image', 'users', username);
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
        const blobKey = `image/users/${username}/${file.filename}`;
        const result = await put(blobKey, await fsp.readFile(localPath), {
          access: 'public',
          token,
        });
        imageUrl = result.url;
      }

      const created = await this.prisma.users.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          image_url: imageUrl ?? '',
        },
      });

      return {
        code: 201,
        status: 'success',
        message: 'User created',
        id: created.id,
        username: created.username,
        email: created.email,
        image_url: created.image_url,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal membuat user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const data = await this.prisma.users.findMany();
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
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return {
      code: 200,
      status: 'success',
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, file?: UploadedFile) {
    const existing = await this.prisma.users.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpException('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    let imageUrl: string | undefined;
    if (file) {
      const username = updateUserDto.username ?? existing.username ?? 'unknown';
      const localDir = path.join(process.cwd(), 'image', 'users', username);
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
      const blobKey = `image/users/${username}/${file.filename}`;
      const result = await put(blobKey, await fsp.readFile(localPath), {
        access: 'public',
        token,
      });
      imageUrl = result.url;
    }

    const updated = await this.prisma.users.update({
      where: { id },
      data: {
        username: updateUserDto.username ?? existing.username,
        email: updateUserDto.email ?? existing.email,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      },
    });

    return {
      code: 200,
      status: 'success',
      message: 'User updated',
      id: updated.id,
      username: updated.username,
      email: updated.email,
      image_url: updated.image_url,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.users.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpException('User tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      const username = existing.username ?? 'unknown';
      const userDir = path.join(process.cwd(), 'image', 'users', username);
      await fsp.rm(userDir, { recursive: true, force: true });
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        const prefix = `image/users/${username}/`;
        const listing = await list({ prefix, token });
        for (const b of listing.blobs ?? []) {
          await del(b.url, { token });
        }
      }

      const deleted = await this.prisma.users.delete({ where: { id } });
      return {
        code: 200,
        status: 'success',
        message: 'User deleted',
        id: deleted.id,
        username: deleted.username,
        email: deleted.email,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus user',
        HttpStatus.CONFLICT,
      );
    }
  }

  async removeAll() {
    try {
      const users = await this.prisma.users.findMany({
        select: { username: true },
      });
      const uniqueUsernames = Array.from(
        new Set(users.map((u) => u.username ?? 'unknown')),
      );
      for (const username of uniqueUsernames) {
        const userDir = path.join(process.cwd(), 'image', 'users', username);
        await fsp.rm(userDir, { recursive: true, force: true });
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (token) {
          const prefix = `image/users/${username}/`;
          const listing = await list({ prefix, token });
          for (const b of listing.blobs ?? []) {
            await del(b.url, { token });
          }
        }
      }
      const res = await this.prisma.users.deleteMany();
      return {
        code: 200,
        status: 'success',
        message: 'All users deleted',
        count: res.count,
      };
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Gagal menghapus semua user',
        HttpStatus.CONFLICT,
      );
    }
  }
}
