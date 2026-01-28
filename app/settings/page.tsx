'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ReminderSettings {
  id: string;
  email: string;
  time: string;
  enabled: boolean;
  timezone: string;
}

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/reminders');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings?.email) {
      setMessage({ type: 'error', text: 'Please enter an email address first.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reminders/send', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test email sent!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to send test email.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure your reminder preferences</p>
      </div>

      {/* Email Reminders Card */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-lg">Email Reminders</h2>
            <p className="text-sm text-gray-500">Get daily reminders for your goals</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Enable Reminders</p>
              <p className="text-sm text-gray-500">Receive a daily email with your goals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.enabled || false}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, enabled: e.target.checked } : null
                  )
                }
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={settings?.email || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, email: e.target.value } : null
                )
              }
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Time & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <input
                id="time"
                type="time"
                value={settings?.time || '08:30'}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, time: e.target.value } : null
                  )
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                value={settings?.timezone || 'America/Los_Angeles'}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, timezone: e.target.value } : null
                  )
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-xl ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving}>
              Save Settings
            </Button>
            <Button variant="secondary" onClick={handleTestEmail} disabled={saving}>
              Send Test Email
            </Button>
          </div>
        </div>
      </Card>

      {/* Cron Setup Card */}
      <Card variant="gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-lg">External Cron Setup</h2>
            <p className="text-sm text-gray-500">Required for email reminders to work</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Set up a free cron job at{' '}
          <a
            href="https://cron-job.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline font-medium"
          >
            cron-job.org
          </a>{' '}
          with these settings:
        </p>

        <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-20">URL:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 flex-1 break-all">
              https://your-app.onrender.com/api/cron
            </code>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-20">Method:</span>
            <span className="text-gray-700">POST</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-20">Schedule:</span>
            <span className="text-gray-700">Every hour (app checks if it&apos;s time)</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-gray-500 w-20">Header:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 flex-1 break-all">
              Authorization: Bearer YOUR_CRON_SECRET
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
}
