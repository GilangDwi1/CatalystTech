// src/common/upload/multer.config.ts

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { fileStorage } from './file-storage.util';
import { imageFileFilter } from './file-filter.util';

export const multerAvatarConfig: MulterOptions = {
  storage: fileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};
