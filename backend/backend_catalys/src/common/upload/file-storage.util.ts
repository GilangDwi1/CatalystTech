// src/common/upload/file-storage.util.ts

import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const fileStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatar');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    cb(null, fileName);
  },
});
