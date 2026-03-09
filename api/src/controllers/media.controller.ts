import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/errors';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ValidationError('No file uploaded');

    const isAudio = req.file.mimetype.startsWith('audio/');
    const subDir = isAudio ? 'audio' : 'images';
    const url = `${BASE_URL}/uploads/${subDir}/${req.file.filename}`;

    const media = await prisma.media.create({
      data: {
        url,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: isAudio ? 'audio' : 'image',
        uploadedById: req.user!.id,
      },
    });

    created(res, media, 'File uploaded');
  } catch (err) {
    next(err);
  }
}

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const media = await prisma.media.findMany({
      where: type ? { type: type as string } : {},
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { name: true } } },
    });
    ok(res, media);
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) throw new NotFoundError('Media');

    // Delete physical file
    const isAudio = media.type === 'audio';
    const filePath = path.join(UPLOAD_DIR, isAudio ? 'audio' : 'images', media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.media.delete({ where: { id: media.id } });
    ok(res, null, 'Media deleted');
  } catch (err) {
    next(err);
  }
}
