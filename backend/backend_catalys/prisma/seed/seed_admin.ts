import { PrismaClient, JenisAbsen, StatusAbsen } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    console.log('Creating divisi admin...');
    const divisi_admin = await prisma.divisi.upsert({
        where: { id: 1 },
        update: {},
        create: { nama_divisi: 'Admin' },
    });

    console.log('Creating grade admin...');
    const grade_admin = await prisma.grade.upsert({
        where: { id: 1 },
        update: {},
        create: { grade: 'Admin' },
    });

    console.log('Creating karyawan admin...');
    const admin_karyawan = await prisma.karyawan.upsert({
        where: { NIP: 'ADMIN001' },
        update: {},
        create: {
            NIP: 'ADMIN001',
            NIK: '000000000001',
            tanggal_lahir: new Date('1990-01-01'),
            nama: 'Admin Karyawan',
            alamat: 'Cianjur',
            id_divisi: divisi_admin.id,
            id_grade: grade_admin.id,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
        },
    });

    const passwordHash = await bcrypt.hash('admin123', 10);

    console.log('Creating user admin...');
    const admin_user = await prisma.user.upsert({
        where: { NIP: 'ADMIN001' },
        update: {},
        create: {
            NIP: 'ADMIN001',
            password: passwordHash,
            role: 'admin',
        },
    });
    console.log('🌱 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });