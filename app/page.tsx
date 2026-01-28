'use client';

import { useEffect, useState, useCallback } from 'react';
import DailyChecklist from '@/components/DailyChecklist';
import Button from '@/components/ui/Button';
import { getLocalDateString, addDays } from '@/lib/date';

interface GoalLog {
  goalId: string;
  name: string;
  category: string;
  targetCount: number;
  targetPeriod: string;
  icon: string | null;
  color: string | null;
  completed: boolean;
  notes: string;
}

export default function HomePage() {
  const [date, setDate] = useState(() => getLocalDateString());
  const [goals, setGoals] = useState<GoalLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/logs?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleUpdateLog = async (
    goalId: string,
    completed: boolean,
    notes?: string
  ) => {
    // Optimistic update
    setGoals((prev) =>
      prev.map((g) =>
        g.goalId === goalId ? { ...g, completed, notes: notes || g.notes } : g
      )
    );

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, goalId, completed, notes }),
      });
    } catch (error) {
      console.error('Error updating log:', error);
      // Revert on error
      fetchLogs();
    }
  };

  const goToDay = (offset: number) => {
    setDate(addDays(date, offset));
  };

  const isToday = date === getLocalDateString();

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => goToDay(-1)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        {!isToday && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDate(getLocalDateString())}
          >
            Go to Today
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => goToDay(1)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <DailyChecklist
          date={date}
          goals={goals}
          onUpdateLog={handleUpdateLog}
        />
      )}
    </div>
  );
}
