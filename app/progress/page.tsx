'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import ProgressChart from '@/components/ProgressChart';
import { getLocalDateString } from '@/lib/date';

interface ChartDataPoint {
  date: string;
  completionRate: number;
  completed: number;
  total: number;
}

interface GoalStat {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  color: string | null;
  completed: number;
  expected: number;
  target: number;
  targetPeriod: string;
  periodLabel: string;
  rate: number;
}

interface Stats {
  chartData: ChartDataPoint[];
  currentStreak: number;
  overallRate: number;
  totalCompleted: number;
  totalExpected: number;
  goalStats: GoalStat[];
}

const categoryIcons: { [key: string]: string } = {
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

const categoryColors: { [key: string]: string } = {
  workout: 'bg-gradient-to-r from-orange-500 to-red-500',
  reading: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  personal: 'bg-gradient-to-r from-purple-500 to-pink-500',
  health: 'bg-gradient-to-r from-rose-500 to-pink-500',
  learning: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  meditation: 'bg-gradient-to-r from-teal-500 to-emerald-500',
  finance: 'bg-gradient-to-r from-green-500 to-emerald-500',
  social: 'bg-gradient-to-r from-violet-500 to-purple-500',
  creative: 'bg-gradient-to-r from-amber-500 to-orange-500',
};

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/stats?days=${days}&today=${getLocalDateString()}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [days]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card variant="gradient" className="text-center py-12">
        <p className="text-gray-500">Failed to load progress data.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Progress
          </h1>
          <p className="text-gray-500 mt-1">Track your goal completion over time</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="highlight" className="text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-5xl mb-2">🔥</div>
            <p className="text-4xl font-bold text-primary-600">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600 mt-1 font-medium">Day Streak</p>
          </div>
        </Card>
        <Card className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="36" strokeWidth="6" fill="none" className="stroke-gray-200" />
              <circle
                cx="40"
                cy="40"
                r="36"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className="stroke-emerald-500 transition-all duration-500"
                style={{
                  strokeDasharray: `${2 * Math.PI * 36}`,
                  strokeDashoffset: `${2 * Math.PI * 36 * (1 - stats.overallRate / 100)}`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{stats.overallRate}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
        </Card>
        <Card className="text-center">
          <p className="text-4xl font-bold text-gray-900">{stats.totalCompleted}</p>
          <p className="text-sm text-gray-500 mt-1">
            of {stats.totalExpected} goals completed
          </p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.totalCompleted / stats.totalExpected) * 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h2 className="text-lg font-semibold mb-6">Daily Completion Rate</h2>
        {stats.chartData.length > 0 ? (
          <ProgressChart data={stats.chartData} />
        ) : (
          <p className="text-gray-500 text-center py-12">
            No data available for this period.
          </p>
        )}
      </Card>

      {/* Goal Breakdown */}
      {stats.goalStats && stats.goalStats.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-6">Goal Breakdown</h2>
          <div className="space-y-4">
            {stats.goalStats.map((goal) => (
              <div key={goal.id} className="group">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${categoryColors[goal.category] || 'bg-gray-500'} flex items-center justify-center text-lg shadow-sm`}>
                    {goal.icon || categoryIcons[goal.category] || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900 truncate">{goal.name}</span>
                      <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                        {goal.completed}/{goal.expected} ({goal.rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${categoryColors[goal.category] || 'bg-gray-500'}`}
                        style={{ width: `${Math.min(100, goal.rate)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{goal.periodLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
