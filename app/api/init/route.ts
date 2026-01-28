import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  // Simple auth check using cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create a fresh connection for this request
  const prisma = new PrismaClient();

  try {
    // Connect explicitly
    await prisma.$connect();

    // Create Goal table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Goal" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'personal',
        "targetCount" INTEGER NOT NULL,
        "targetPeriod" TEXT NOT NULL,
        "icon" TEXT,
        "color" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create GoalLog table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GoalLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" DATE NOT NULL,
        "goalId" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE,
        UNIQUE("date", "goalId")
      );
    `);

    // Create ReminderSettings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReminderSettings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "time" TEXT NOT NULL DEFAULT '08:30',
        "enabled" BOOLEAN NOT NULL DEFAULT true,
        "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$disconnect();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Init error:', error);
    await prisma.$disconnect();
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST with authorization to initialize database' });
}
