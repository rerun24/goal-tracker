import { Resend } from 'resend';

interface Goal {
  name: string;
  category: string;
  targetPeriod: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const categoryEmoji: { [key: string]: string } = {
  workout: '💪',
  reading: '📚',
  personal: '✨',
  health: '❤️',
  learning: '🧠',
  meditation: '🧘',
  finance: '💰',
  social: '👥',
  creative: '🎨',
};

export async function sendReminderEmail(
  to: string,
  goals: Goal[]
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.error('Resend API key not configured');
    return false;
  }

  const goalList = goals
    .map((g) => `- ${categoryEmoji[g.category] || '📌'} ${g.name}`)
    .join('\n');

  const htmlList = goals
    .map((g) => `<li>${categoryEmoji[g.category] || '📌'} <strong>${g.name}</strong></li>`)
    .join('');

  try {
    const { error } = await resend.emails.send({
      from: 'Goal Tracker <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Daily Goals Await',
      text: `Good morning! Here are your goals for today:\n\n${goalList}\n\nMake today count!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; border-radius: 16px;">
          <div style="background: #ffffff; border-radius: 14px; padding: 32px;">
            <h2 style="color: #4f46e5; margin-bottom: 8px; font-size: 24px;">Good Morning!</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Here are your goals for today:</p>
            <ul style="line-height: 2; list-style: none; padding: 0; margin: 0;">${htmlList}</ul>
            <div style="margin-top: 32px; padding: 16px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px;">
              <p style="margin: 0; color: #5b21b6; font-weight: 500;">Make today count! 🚀</p>
            </div>
            <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
              Sent from Goal Tracker
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}
