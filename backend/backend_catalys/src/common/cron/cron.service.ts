import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AbsenService } from '../../absen/absen.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly absensiService: AbsenService) {} // inject service absensi

  // Jalankan setiap 5 menit
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleGenerateAlpha() {
    this.logger.log('🔄 Running generateAlphaForFinishedConfigs...');
    try {
      await this.absensiService.generateAlphaForFinishedConfigs();
      this.logger.log('✅ generateAlphaForFinishedConfigs completed');
    } catch (err) {
      this.logger.error('❌ Error in generateAlphaForFinishedConfigs', err);
    }
  }
}
