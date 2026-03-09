import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { errorHandler } from './middleware/error';

import authRoutes from './routes/auth.routes';
import coursesRoutes from './routes/courses.routes';
import unitsRoutes from './routes/units.routes';
import lessonsRoutes from './routes/lessons.routes';
import exercisesRoutes from './routes/exercises.routes';
import vocabularyRoutes from './routes/vocabulary.routes';
import progressRoutes from './routes/progress.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import mediaRoutes from './routes/media.routes';
import adminRoutes from './routes/admin.routes';
import exerciseTypesRoutes from './routes/exerciseTypes.routes';

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(',');
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth requests' }));
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300 }));

// ── Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Static uploads ────────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/courses/:courseId/units', unitsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/units/:unitId/lessons', lessonsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/lessons/:lessonId/exercises', exercisesRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/courses/:courseId/vocabulary', vocabularyRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exercise-types', exerciseTypesRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
