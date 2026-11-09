import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { KaryawanModule } from './karyawan/karyawan.module';
import { IzinModule } from './izin/izin.module';
import { DivisiGradeModule } from './divisi-grade/divisi-grade.module';
import { FaceRecognitionModule } from './face-recognition/face-recognition.module';
import { AbsensiConfigModule } from './absensi-config/absensi-config.module';
import { FaceEmbeddingModule } from './face-embedding/face-embedding.module';
import { LemburModule } from './lembur/lembur.module';
import { LemburConfigModule } from './lembur-config/lembur-config.module';
import { AbsenModule } from './absen/absen.module'; 
import { FacesModule } from './faces/faces.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

const staticPath = join(__dirname, '..', 'uploads');
console.log('Serving static files from:', staticPath);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ScheduleModule.forRoot(),
    KaryawanModule,
    AbsensiConfigModule,
    AbsenModule,
    IzinModule,
    DivisiGradeModule,
    FaceRecognitionModule,
    UserModule,
    FacesModule,
    FaceEmbeddingModule,
    LemburModule,
    LemburConfigModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
