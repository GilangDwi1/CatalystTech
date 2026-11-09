import { Module } from '@nestjs/common';
import { FaceRecognitionService } from './face-recognition.service';
import { FaceRecognitionCacheService } from './face-recognition.cache.service';

@Module({
  providers: [FaceRecognitionService, FaceRecognitionCacheService],
  exports: [FaceRecognitionService],
})
export class FaceRecognitionModule {}