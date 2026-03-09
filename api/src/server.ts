import app from './app';
import { prisma } from './lib/prisma';

const PORT = parseInt(process.env.PORT ?? '3000');

async function main() {
  await prisma.$connect();
  console.log('[DB] Connected to database');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[API] Voxie API running on http://0.0.0.0:${PORT}`);
    console.log(`[API] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[API] Environment: ${process.env.NODE_ENV ?? 'development'}`);
  });
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
