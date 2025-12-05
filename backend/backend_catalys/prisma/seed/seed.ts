import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding...');

  // === Buat Divisi ===
  let divisi = await prisma.divisi.findFirst();
  if (!divisi) {
    divisi = await prisma.divisi.create({
      data: { nama_divisi: 'Admin' },
    });
    console.log('Divisi Admin dibuat');
  }

  // === Buat Grade ===
  let grade = await prisma.grade.findFirst();
  if (!grade) {
    grade = await prisma.grade.create({
      data: { grade: 'Admin' },
    });
    console.log('Grade Admin dibuat');
  }

  // === Buat Karyawan ===
  let karyawan = await prisma.karyawan.findFirst({
    where: { NIP: 'ADMIN001' },
  });

  if (!karyawan) {
    karyawan = await prisma.karyawan.create({
      data: {
        NIP: 'ADMIN001',
        nama: 'Administrator',
        alamat: 'Kantor Pusat',
        id_divisi: divisi.id,
        id_grade: grade.id,
        foto: 'default.jpg',
      },
    });
    console.log('Karyawan Admin dibuat');
  }

  // === Buat User ===
  const userExists = await prisma.user.findFirst({
    where: { NIP: 'ADMIN001' },
  });

  if (!userExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        role: 'admin',
        NIP: 'ADMIN001',
        karyawan: {
          connect: { id: karyawan.id },
        },
      },
    });

    console.log('User Admin dibuat');
  } else {
    console.log('User Admin sudah ada');
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
