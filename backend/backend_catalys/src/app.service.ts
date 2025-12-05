import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      name: 'Face Recognition API',
      version: '1.0.0',
      description: 'API untuk sistem absensi dengan face recognition',
      endpoints: {
        auth: '/auth',
        karyawan: '/karyawan',
        absensi: '/absensi',
        perizinan: '/perizinan',
        divisi: '/divisi',
        grade: '/grade'
      }
    };
  }
}
