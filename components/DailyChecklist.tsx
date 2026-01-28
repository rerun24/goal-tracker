'use client';

import { useState } from 'react';
import Card from './ui/Card';

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

interface DailyChecklistProps {
  date: string;
  goals: GoalLog[];
  onUpdateLog: (
    goalId: string,
    completed: boolean,
    notes?: string
  ) => Promise<void>;
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
  workout: 'from-orange-500 to-red-500',
  reading: 'from-blue-500 to-indigo-500',
  personal: 'from-purple-500 to-pink-500',
  health: 'from-rose-500 to-pink-500',
  learning: 'from-cyan-500 to-blue-500',
  meditation: 'from-teal-500 to-emerald-500',
  finance: 'from-green-500 to-emerald-500',
  social: 'from-violet-500 to-purple-500',
  creative: 'from-amber-500 to-orange-500',
};

export default function DailyChecklist({
  date,
  goals,
  onUpdateLog,
}: DailyChecklistProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<{ [key: string]: string }>({});

  const handleToggle = async (goal: GoalLog) => {
    setUpdating(goal.goalId);
    try {
      await onUpdateLog(goal.goalId, !goal.completed, noteText[goal.goalId] || goal.notes);
    } finally {
      setUpdating(null);
    }
  };

  const handleNoteSave = async (goal: GoalLog) => {
    setUpdating(goal.goalId);
    try {
      await onUpdateLog(goal.goalId, goal.completed, noteText[goal.goalId] || '');
      setExpandedGoal(null);
    } finally {
      setUpdating(null);
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getIcon = (goal: GoalLog) => goal.icon || categoryIcons[goal.category] || '📌';
  const getGradient = (goal: GoalLog) => goal.color ? `from-[${goal.color}] to-[${goal.color}]` : categoryColors[goal.category] || 'from-gray-500 to-gray-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {formatDate(date)}
        </h2>
        <p className="text-gray-500">
          {completedCount} of {goals.length} goals completed
        </p>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              strokeWidth="8"
              fill="none"
              className="stroke-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="stroke-primary-500 transition-all duration-500"
              style={{
                strokeDasharray: `${2 * Math.PI * 56}`,
                strokeDashoffset: `${2 * Math.PI * 56 * (1 - progressPercent / 100)}`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card variant="gradient" className="text-center py-12">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-600 font-medium">No goals scheduled for today</p>
          <p className="text-gray-400 text-sm mt-1">Add some goals to get started!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <div
              key={goal.goalId}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card
                padding="none"
                variant={goal.completed ? 'success' : 'default'}
                className="overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Color Bar */}
                  <div className={`w-1.5 bg-gradient-to-b ${getGradient(goal)}`} />

                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(goal)} flex items-center justify-center text-2xl shadow-lg`}>
                        {goal.completed ? '✓' : getIcon(goal)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-lg ${goal.completed ? 'text-emerald-700' : 'text-gray-900'}`}>
                          {goal.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {goal.category} • {goal.targetCount}x per {goal.targetPeriod}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedGoal(expandedGoal === goal.goalId ? null : goal.goalId)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Add note"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggle(goal)}
                          disabled={updating === goal.goalId}
                          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                            goal.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-white border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500'
                          } ${updating === goal.goalId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updating === goal.goalId ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className={`w-6 h-6 ${goal.completed ? 'animate-check' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {expandedGoal === goal.goalId && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                        <textarea
                          value={noteText[goal.goalId] ?? goal.notes}
                          onChange={(e) => setNoteText({ ...noteText, [goal.goalId]: e.target.value })}
                          placeholder="Add a note about this goal..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setExpandedGoal(null)}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleNoteSave(goal)}
                            disabled={updating === goal.goalId}
                            className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Existing Note Display */}
                    {goal.notes && expandedGoal !== goal.goalId && (
                      <p className="mt-2 text-sm text-gray-500 italic">
                        &quot;{goal.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
