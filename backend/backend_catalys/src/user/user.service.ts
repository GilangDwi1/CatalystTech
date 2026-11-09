import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, isActive?: string) {
    // Convert query string ke boolean
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined; // kalau undefined, artinya tidak difilter

    return this.prisma.user.findMany({
      where: {
        ...(activeFilter !== undefined && { is_active: activeFilter }),
        OR: search
          ? [
              { NIP: { contains: search } },
              { karyawan: { nama: { contains: search } } },
            ]
          : undefined,
      },
      select: {
        id: true,
        NIP: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        is_active: true,
        karyawan: {
          select: {
            nama: true,
            divisi: { select: { nama_divisi: true } },
            grade: { select: { grade: true } },
          },
        },
      },
      orderBy: { NIP: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        NIP: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        karyawan: {
          select: {
            nama: true,
            divisi: true,
            grade: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    return user;
  }

  async findByNIP(nip: string) {
    const user = await this.prisma.user.findUnique({
      where: { NIP: nip },
      select: {
        id: true,
        NIP: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        karyawan: {
          select: {
            nama: true,
            divisi: true,
            grade: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User dengan NIP ${nip} tidak ditemukan`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    // Cek apakah karyawan sudah memiliki user
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: createUserDto.id_karyawan }, { NIP: createUserDto.NIP }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Karyawan sudah memiliki akun user atau NIP sudah digunakan',
      );
    }

    // Cek apakah karyawan ada
    const karyawan = await this.prisma.karyawan.findUnique({
      where: { id: createUserDto.id_karyawan },
    });

    if (!karyawan) {
      throw new NotFoundException(
        `Karyawan dengan ID ${createUserDto.id_karyawan} tidak ditemukan`,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        id: createUserDto.id_karyawan,
        NIP: createUserDto.NIP,
        password: hashedPassword,
        role: createUserDto.role,
        karyawan: {
          connect: { id: createUserDto.id_karyawan }, // <- ini penting
        },
      },
      select: {
        id: true,
        NIP: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        karyawan: {
          select: {
            nama: true,
            divisi: true,
            grade: true,
          },
        },
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Jika ada password baru, hash password
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          NIP: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          karyawan: {
            select: {
              nama: true,
              divisi: true,
              grade: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
  }
}