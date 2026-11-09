import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AbsenService } from './absen.service';
import { PrismaService } from '../prisma/prisma.service';
import { JenisAbsen, StatusAbsen } from '@prisma/client';

describe('AbsenService.create', () => {
  let service: AbsenService;

  const prismaMock = {
    karyawan: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    absensiConfig: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    izin: {
      findFirst: jest.fn(),
    },
    lembur: {
      findFirst: jest.fn(),
    },
    absen: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    absenSummary: {
        upsert: jest.fn(),
        findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbsenService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AbsenService);
    jest.clearAllMocks();
  });

    it('should create absen DATANG HADIR', async () => {
    prismaMock.karyawan.findUnique.mockResolvedValue({
      id: 1,
      NIP: 'EMP001',
      is_active: true,
    });

    // Mock Configs for TODAY
    prismaMock.absensiConfig.findMany.mockResolvedValue([
      {
        id: 10,
        jenis: JenisAbsen.DATANG,
        jam_mulai: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        jam_selesai: new Date(Date.now() + 1000 * 60 * 60), // in 1 hour
      },
    ]);

    // Mock Checks
    prismaMock.izin.findFirst.mockResolvedValue(null);
    prismaMock.absen.findFirst.mockResolvedValue(null); // No existing absen
    prismaMock.lembur.findFirst.mockResolvedValue(null);

    // Mock Create
    prismaMock.absen.create.mockResolvedValue({
      id: 100,
      status: StatusAbsen.HADIR,
      karyawan: { id: 1 },
      waktu: new Date(),
      jenis: JenisAbsen.DATANG
    });

    // Mock SyncAbsenSummary Queries
    prismaMock.absen.findMany.mockResolvedValue([
        { jenis: JenisAbsen.DATANG, waktu: new Date() }
    ]);
    prismaMock.absensiConfig.findFirst.mockResolvedValue({
         id: 10, jam_mulai: new Date(Date.now() - 3600000), jam_selesai: new Date(Date.now() + 3600000)
    });
    prismaMock.absenSummary.upsert.mockResolvedValue({});

    const result = await service.create({
      id_karyawan: 'EMP001',
    } as any);

    console.log(result); 

    expect(result.message).toBe('Absensi berhasil dicatat');
    expect(prismaMock.absen.create).toHaveBeenCalled();
    expect(prismaMock.absenSummary.upsert).toHaveBeenCalled();
  });

  it('should create absen DATANG TERLAMBAT (Sync Logic)', async () => {
    // Note: In new logic, 'create' sets status TEMPORARILY.
    // Sync determines final status in Summary.
    // The test usually checks the return of 'create', which returns the created record.
    // And also we can check if Sync was called.

    const now = new Date();
    // Config: jam_mulai 2 hours ago. 
    // Batas absen? Logic: if now > batas_absen -> temporary status TERLAMBAT
    
    prismaMock.karyawan.findUnique.mockResolvedValue({
      id: 1,
      NIP: 'EMP001',
      is_active: true,
    });

    const config = {
        id: 10,
        jenis: JenisAbsen.DATANG,
        jam_mulai: new Date(now.getTime() - 2 * 60 * 60 * 1000), 
        jam_selesai: new Date(now.getTime() + 60 * 60 * 1000),
        batas_absen: new Date(now.getTime() - 60 * 60 * 1000), // Batas was 1 hour ago
    };

    prismaMock.absensiConfig.findMany.mockResolvedValue([config]);

    prismaMock.izin.findFirst.mockResolvedValue(null);
    prismaMock.absen.findFirst.mockResolvedValue(null);
    prismaMock.lembur.findFirst.mockResolvedValue(null);

    prismaMock.absen.create.mockResolvedValue({
      id: 101,
      status: StatusAbsen.TERLAMBAT, // Service logic should set this
      karyawan: { id: 1 },
      waktu: now,
      jenis: JenisAbsen.DATANG
    });
    
    // Mocks for Sync
    prismaMock.absen.findMany.mockResolvedValue([
        { jenis: JenisAbsen.DATANG, waktu: now, config }
    ]);
    // findFirst for configs (Datang/Pulang)
    prismaMock.absensiConfig.findFirst.mockResolvedValue(config);
    prismaMock.absenSummary.upsert.mockResolvedValue({});


    const result = await service.create({
      id_karyawan: 'EMP001',
    } as any);

    console.log(result);

    // Verify 'create' saved it as TERLAMBAT
    // Note: The mock `create` returns what we tell it. 
    // We should verify `create` called with status TERLAMBAT.
    
    expect(prismaMock.absen.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            status: StatusAbsen.TERLAMBAT
        })
    }));

    // Verify Sync set 'terlambat: true'
    expect(prismaMock.absenSummary.upsert).toHaveBeenCalledWith(expect.objectContaining({
        update: expect.objectContaining({
            terlambat: true,
            status: StatusAbsen.HADIR // Logic table: Datang telat -> HADIR w/ flag
        })
    }));
  });

});
