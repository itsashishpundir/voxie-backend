import { Response } from 'express';

export function ok<T>(res: Response, data: T, message?: string) {
  return res.status(200).json({ success: true, message, data });
}

export function created<T>(res: Response, data: T, message?: string) {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function paginated<T>(
  res: Response,
  data: T[],
  meta: { total: number; page: number; limit: number }
) {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
      hasMore: meta.page * meta.limit < meta.total,
    },
  });
}
