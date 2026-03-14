// src/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/photos',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Faqat rasm fayllari qabul qilinadi!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
};

// Homework fayl uchun (pdf, doc, zip...)
export const homeworkFileOptions = {
  storage: diskStorage({
    destination: './uploads/files',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(pdf|msword|zip|jpeg|jpg|png|gif|plain)$/) && 
        !file.mimetype.includes('document')) {
      return cb(new Error('Fayl turi qabul qilinmaydi!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB
};

// Video uchun
export const videoFileOptions = {
  storage: diskStorage({
    destination: './uploads/videos',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(mp4|mpeg|quicktime|x-msvideo|webm)$/)) {
      return cb(new Error('Faqat video fayllar qabul qilinadi!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB
};

export const homeworkResponseOptions = {
  storage: diskStorage({
    destination: './uploads/homeworks',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Fayl turi qabul qilinmaydi!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB
};

export const homeworkResultOptions = {
  storage: diskStorage({
    destination: './uploads/results',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Fayl turi qabul qilinmaydi!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB
};