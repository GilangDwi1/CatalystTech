import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function getOrCreateDivisi(nama_divisi: string) {
  let divisi = await prisma.divisi.findFirst({
    where: { nama_divisi },
  });

  if (!divisi) {
    divisi = await prisma.divisi.create({
      data: { nama_divisi },
    });
  }

  return divisi;
}

async function getOrCreateGrade(grade: string) {
  let result = await prisma.grade.findFirst({
    where: { grade },
  });

  if (!result) {
    result = await prisma.grade.create({
      data: { grade },
    });
  }

  return result;
}

function generateNik(prefix: string, idx: number) {
  const prefixMap: Record<string, string> = {
    QA: '01',
    PRD: '02',
    SEE: '03',
  };

  return `3201${prefixMap[prefix]}${idx.toString().padStart(10, '0')}`;
}

async function createKaryawan(
  prefix: string,
  start: number,
  total: number,
  divisiId: number,
  gradeId: number,
) {
  for (let i = 0; i < total; i++) {
    const idx = start + i;

    const nip = `${prefix}-${idx.toString().padStart(4, '0')}`;
    const nik = generateNik(prefix, idx);

    await prisma.karyawan.upsert({
      where: { NIK: nik }, // ✅ pakai NIK
      update: {
        NIP: nip,
        nama: `Karyawan ${prefix} ${idx}`,
        alamat: `Alamat ${prefix} ${idx}`,
        id_divisi: divisiId,
        id_grade: gradeId,
        is_active: true,
      },
      create: {
        NIP: nip,
        NIK: nik,
        nama: `Karyawan ${prefix} ${idx}`,
        alamat: `Alamat ${prefix} ${idx}`,
        id_divisi: divisiId,
        id_grade: gradeId,
        is_active: true,
      },
    });
  }
}

async function main() {
  // =====================
  // DIVISI
  // =====================
  const divisiQA = await getOrCreateDivisi('QA');
  const divisiProduction = await getOrCreateDivisi('Production');

  const divisiSeewer = await prisma.divisi.findFirst({
    where: { nama_divisi: 'Seewer' },
  });

  if (!divisiSeewer) {
    throw new Error('❌ Divisi Seewer belum ada');
  }

  // =====================
  // GRADE
  // =====================
  const gradeSedang = await getOrCreateGrade('Sedang');
  const gradeBuruk = await getOrCreateGrade('Buruk');

  const gradeBaik = await prisma.grade.findFirst({
    where: { grade: 'Baik' },
  });

  if (!gradeBaik) {
    throw new Error('❌ Grade Baik belum ada');
  }

  // =====================
  // KARYAWAN
  // =====================
  await createKaryawan('QA', 1, 10, divisiQA.id, gradeSedang.id);
  await createKaryawan('PRD', 1, 10, divisiProduction.id, gradeBuruk.id);
  await createKaryawan('SEE', 1, 10, divisiSeewer.id, gradeBaik.id);

  console.log('✅ Seeder karyawan sukses');
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
