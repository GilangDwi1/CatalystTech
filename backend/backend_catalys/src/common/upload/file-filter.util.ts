// src/common/upload/file-filter.util.ts

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: any,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
