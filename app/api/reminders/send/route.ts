import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendReminderEmail } from '@/lib/email';

export async function POST() {
  try {
    const settings = await prisma.reminderSettings.findFirst();

    if (!settings || !settings.enabled || !settings.email) {
      return NextResponse.json({ message: 'Reminders disabled or email not set' });
    }

    // Get all goals
    const goals = await prisma.goal.findMany();

    if (goals.length === 0) {
      return NextResponse.json({ message: 'No goals configured' });
    }

    const success = await sendReminderEmail(settings.email, goals);

    if (success) {
      return NextResponse.json({ message: 'Reminder sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send reminder' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
