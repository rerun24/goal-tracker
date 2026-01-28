import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Parse YYYY-MM-DD string and return date at noon UTC
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

// Format date to YYYY-MM-DD string
function formatDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get day of week from YYYY-MM-DD string (0 = Sunday)
function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
}

// Get day of month from YYYY-MM-DD string
function getDayOfMonth(dateStr: string): number {
  const [, , day] = dateStr.split('-').map(Number);
  return day;
}

// Check if goal is scheduled for a specific date
function isGoalScheduledForDate(
  goal: { targetCount: number; targetPeriod: string },
  dayOfWeek: number,
  dayOfMonth: number
): boolean {
  switch (goal.targetPeriod) {
    case 'day':
      return true;
    case 'week':
      if (goal.targetCount >= 7) return true;
      const weekInterval = 7 / goal.targetCount;
      for (let i = 0; i < goal.targetCount; i++) {
        const scheduledDay = Math.floor(i * weekInterval) % 7;
        if (scheduledDay === dayOfWeek) return true;
      }
      return false;
    case 'month':
      if (goal.targetCount >= 30) return true;
      const monthInterval = 30 / goal.targetCount;
      for (let i = 0; i < goal.targetCount; i++) {
        const scheduledDay = Math.floor(i * monthInterval) % 30 + 1;
        if (scheduledDay === dayOfMonth) return true;
      }
      return false;
    case 'year':
      return true;
    default:
      return true;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = parseInt(daysParam);
    const todayParam = searchParams.get('today');

    let endDate: Date;
    let todayStr: string;

    if (todayParam) {
      endDate = parseDateString(todayParam);
      todayStr = todayParam;
    } else {
      endDate = new Date();
      todayStr = formatDateString(endDate);
    }

    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - days);

    // Get all logs in the date range
    const logs = await prisma.goalLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        goal: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get all goals for expected counts
    const goals = await prisma.goal.findMany();

    // Calculate daily completion rates
    const dailyStats: { [key: string]: { completed: number; total: number } } = {};

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = formatDateString(d);
      const dayOfWeek = getDayOfWeek(dateStr);
      const dayOfMonth = getDayOfMonth(dateStr);

      // Count expected goals for this day
      let expectedGoals = 0;
      goals.forEach((goal) => {
        if (isGoalScheduledForDate(goal, dayOfWeek, dayOfMonth)) {
          expectedGoals++;
        }
      });

      dailyStats[dateStr] = { completed: 0, total: expectedGoals };
    }

    // Fill in completed counts
    logs.forEach((log) => {
      const dateStr = formatDateString(log.date);
      if (dailyStats[dateStr] && log.completed) {
        dailyStats[dateStr].completed++;
      }
    });

    // Convert to array for charts
    const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      completed: stats.completed,
      total: stats.total,
    }));

    // Calculate streak using client's today
    let currentStreak = 0;

    for (let i = chartData.length - 1; i >= 0; i--) {
      const dayData = chartData[i];
      if (dayData.date > todayStr) continue;

      if (dayData.total > 0 && dayData.completed === dayData.total) {
        currentStreak++;
      } else if (dayData.date < todayStr) {
        break;
      }
    }

    // Overall stats
    const totalCompleted = logs.filter((l) => l.completed).length;
    const totalExpected = Object.values(dailyStats).reduce((sum, d) => sum + d.total, 0);
    const overallRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    // Per-goal stats with progress toward target
    const goalStats = goals.map((goal) => {
      const goalLogs = logs.filter((l) => l.goalId === goal.id && l.completed);
      const completed = goalLogs.length;

      // Calculate expected based on period
      let expected: number;
      let periodLabel: string;

      switch (goal.targetPeriod) {
        case 'day':
          expected = days;
          periodLabel = `${goal.targetCount}x daily`;
          break;
        case 'week':
          expected = Math.ceil((days / 7) * goal.targetCount);
          periodLabel = `${goal.targetCount}x per week`;
          break;
        case 'month':
          expected = Math.ceil((days / 30) * goal.targetCount);
          periodLabel = `${goal.targetCount}x per month`;
          break;
        case 'year':
          expected = goal.targetCount;
          periodLabel = `${goal.targetCount} per year`;
          break;
        default:
          expected = goal.targetCount;
          periodLabel = `${goal.targetCount}x`;
      }

      return {
        id: goal.id,
        name: goal.name,
        category: goal.category,
        icon: goal.icon,
        color: goal.color,
        completed,
        expected,
        target: goal.targetCount,
        targetPeriod: goal.targetPeriod,
        periodLabel,
        rate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
      };
    });

    return NextResponse.json({
      chartData,
      currentStreak,
      overallRate,
      totalCompleted,
      totalExpected,
      goalStats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
