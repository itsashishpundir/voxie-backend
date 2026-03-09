import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok } from '../utils/response';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId, period = 'week' } = req.query;

    let weekStart: Date;
    const now = new Date();

    if (period === 'week') {
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      weekStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // all time — use total XP from progress
      const entries = await prisma.userProgress.findMany({
        where: courseId ? { courseId: courseId as string } : {},
        orderBy: { totalXp: 'desc' },
        take: 50,
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      });

      return ok(res, entries.map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        name: e.user.name,
        avatarUrl: e.user.avatarUrl,
        xp: e.totalXp,
        streak: e.currentStreak,
      })));
    }

    const entries = await prisma.leaderboardEntry.groupBy({
      by: ['userId'],
      where: {
        ...(courseId ? { courseId: courseId as string } : {}),
        weekStart: { gte: weekStart },
      },
      _sum: { weekXp: true },
      orderBy: { _sum: { weekXp: 'desc' } },
      take: 50,
    });

    const userIds = entries.map((e) => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const result = entries.map((e, i) => {
      const user = userMap.get(e.userId);
      return {
        rank: i + 1,
        userId: e.userId,
        name: user?.name ?? 'Unknown',
        avatarUrl: user?.avatarUrl ?? null,
        xp: e._sum.weekXp ?? 0,
      };
    });

    ok(res, result);
  } catch (err) {
    next(err);
  }
}
