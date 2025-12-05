import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(nip: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { NIP: nip },
      include: { karyawan: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // ❗ CEK USER AKTIF
    if (!user.is_active) {
      throw new UnauthorizedException('Akun user tidak aktif');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password tidak valid');
    }

    // ❗ CEK KARYAWAN AKTIF (jika ada relasi)
    if (user.karyawan && !user.karyawan.is_active) {
      throw new UnauthorizedException('Karyawan sudah tidak aktif');
    }

    return user;
  }

  async login(nip: string, password: string) {
    const user = await this.validateUser(nip, password);

    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { karyawan: true },
    });

    if (!fullUser) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const payload = {
      sub: fullUser.id,
      nip: fullUser.NIP,
      role: fullUser.role,
      id_karyawan: fullUser.karyawan?.id ?? null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: fullUser.id,
        nip: fullUser.NIP,
        role: fullUser.role,
        id_karyawan: fullUser.karyawan?.id ?? null,
      },
    };
  }

  async flutterLogin(nip: string, password: string) {
    // =======================================
    // 1. Cari user berdasarkan NIP
    // =======================================
    const user = await this.prisma.user.findUnique({
      where: { NIP: nip },
      include: {
        karyawan: true, // ikut ambil data karyawan
      },
    });

    if (!user) {
      throw new UnauthorizedException('NIP tidak ditemukan');
    }

    // =======================================
    // 2. Cek password
    // =======================================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    // =======================================
    // 3. Hanya HRD yang boleh login Flutter
    // =======================================
    if (user.role !== 'HRD') {
      throw new UnauthorizedException('Aplikasi Flutter hanya untuk HRD');
    }

    // =======================================
    // 4. Payload JWT
    // =======================================
    const payload = {
      sub: user.id,
      nip: user.NIP,
      role: user.role,
    };

    // =======================================
    // 5. Generate JWT super panjang (100 tahun)
    // =======================================
    const token = this.jwtService.sign(payload, {
      expiresIn: '100y',
    });

    // =======================================
    // 6. Return ke Flutter
    // =======================================
    return {
      message: 'Login Flutter berhasil',
      token,
      user: {
        id: user.id,
        nip: user.NIP,
        role: user.role,
        is_active: user.is_active,
      },
      karyawan: user.karyawan ?? null, // bisa null kalau belum dibuat
    };
  }
}