import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AbsensiConfigService } from './absensi-config.service';
import { PrismaService } from '../prisma/prisma.service';
import { AbsenService } from '../absen/absen.service';
import { StatusAbsen } from '@prisma/client';

describe('AbsensiConfigService', () => {
  let service: AbsensiConfigService;
  let prisma: PrismaService;
  let absenService: AbsenService;

  const prismaMock = {
    absensiConfig: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    izin: {
      findMany: jest.fn(),
    },
    absen: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    karyawan: {
      findMany: jest.fn(),
    },
    absenSummary: {
      findMany: jest.fn(),
    },
    lembur: {
      findMany: jest.fn(),
    },
  };

  const absenServiceMock = {
    syncAbsenSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsensiConfigService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: AbsenService,
          useValue: absenServiceMock,
        },
      ],
    }).compile();

    service = module.get<AbsensiConfigService>(AbsensiConfigService);
    prisma = module.get<PrismaService>(PrismaService);
    absenService = module.get<AbsenService>(AbsenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // TEST: tanggal masa lalu
  // =============================
  it('should throw error if tanggal is in the past', async () => {
    const dto: any = {
      tanggal: '2020-01-01',
      jam_mulai: '08:00',
      jam_selesai: '17:00',
      jenis: 'DATANG',
      dibuat_oleh: 1,
      batas_absen: '09:00'
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  // =============================
  // TEST: detailKehadiran using AbsenSummary
  // =============================
  it('should return detailKehadiran from AbsenSummary', async () => {
      const today = new Date();
      
      // Mock Data
      prismaMock.karyawan.findMany.mockResolvedValue([
          { id: 1, nama: 'Budi' },
          { id: 2, nama: 'Siti' }
      ]);

      prismaMock.absensiConfig.findMany.mockResolvedValue([
          { id: 10, jenis: 'DATANG' } // There is a config
      ]);

      prismaMock.absenSummary.findMany.mockResolvedValue([
          {
              id_karyawan: 1,
              datang: new Date(),
              pulang: null,
              status: StatusAbsen.HADIR,
              terlambat: true,
              pulang_cepat: false,
              durasi_lembur: 0
          }
      ]);

      const result = await service.detailKehadiran('2025-01-01');

      console.log(result);

      // Budi should be HADIR & Terlambat
      const budi = result.data.find(d => d.nama === 'Budi');
      expect(budi.status).toBe(StatusAbsen.HADIR);
      expect(budi.terlambat).toBe(true);

      // Siti (no summary) should be ALPHA (since config exists)
      const siti = result.data.find(d => d.nama === 'Siti');
      expect(siti.status).toBe(StatusAbsen.ALPHA);
      
      // Summary aggregation check
      expect(result.summary.hadir).toBe(1);
      expect(result.summary.terlambat).toBe(1);
      expect(result.summary.alpha).toBe(1);

  });
});
