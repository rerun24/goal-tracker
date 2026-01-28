import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Parse YYYY-MM-DD string to get components without timezone conversion
function parseDateString(dateStr: string): { date: Date; dayOfWeek: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at noon UTC to avoid any date boundary issues
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  // Calculate day of week from the date components directly
  const tempDate = new Date(year, month - 1, day);
  const dayOfWeek = tempDate.getDay();
  return { date, dayOfWeek };
}

// Helper to check if a goal should appear on a given date
function isGoalScheduledForDate(
  goal: { targetCount: number; targetPeriod: string },
  dayOfWeek: number,
  dayOfMonth: number
): boolean {
  switch (goal.targetPeriod) {
    case 'day':
      // Daily goals always show
      return true;
    case 'week':
      // Distribute across the week
      if (goal.targetCount >= 7) return true;
      const weekInterval = 7 / goal.targetCount;
      for (let i = 0; i < goal.targetCount; i++) {
        const scheduledDay = Math.floor(i * weekInterval) % 7;
        if (scheduledDay === dayOfWeek) return true;
      }
      return false;
    case 'month':
      // Distribute across the month
      if (goal.targetCount >= 30) return true;
      const monthInterval = 30 / goal.targetCount;
      for (let i = 0; i < goal.targetCount; i++) {
        const scheduledDay = Math.floor(i * monthInterval) % 30 + 1;
        if (scheduledDay === dayOfMonth) return true;
      }
      return false;
    case 'year':
      // For yearly goals, show every day to give flexibility
      return true;
    default:
      return true;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    const { date, dayOfWeek } = parseDateString(dateStr);
    const [, , day] = dateStr.split('-').map(Number);
    const dayOfMonth = day;

    // Get all goals
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Filter to goals scheduled for this day
    const scheduledGoals = goals.filter((goal) =>
      isGoalScheduledForDate(goal, dayOfWeek, dayOfMonth)
    );

    // Get logs for this date
    const logs = await prisma.goalLog.findMany({
      where: {
        date: date,
        goalId: { in: scheduledGoals.map((g) => g.id) },
      },
    });

    // Combine goals with their logs
    const result = scheduledGoals.map((goal) => {
      const log = logs.find((l) => l.goalId === goal.id);
      return {
        goalId: goal.id,
        name: goal.name,
        category: goal.category,
        targetCount: goal.targetCount,
        targetPeriod: goal.targetPeriod,
        icon: goal.icon,
        color: goal.color,
        completed: log?.completed || false,
        notes: log?.notes || '',
        logId: log?.id || null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, goalId, completed, notes } = body;

    if (!date || !goalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { date: dateObj } = parseDateString(date);

    const log = await prisma.goalLog.upsert({
      where: {
        date_goalId: {
          date: dateObj,
          goalId,
        },
      },
      create: {
        date: dateObj,
        goalId,
        completed: completed || false,
        notes: notes || null,
      },
      update: {
        completed: completed || false,
        notes: notes || null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error updating log:', error);
    return NextResponse.json(
      { error: 'Failed to update log' },
      { status: 500 }
    );
  }
}
