'use client';

import { useState } from 'react';
import Button from './ui/Button';

interface Goal {
  id?: string;
  name: string;
  category: string;
  goalType: string;
  targetCount: number;
  targetPeriod: string;
  icon?: string | null;
  color?: string | null;
}

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (data: Omit<Goal, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const categories = [
  { value: 'workout', label: 'Workout', icon: '💪' },
  { value: 'reading', label: 'Reading', icon: '📚' },
  { value: 'personal', label: 'Personal', icon: '✨' },
  { value: 'health', label: 'Health', icon: '❤️' },
  { value: 'learning', label: 'Learning', icon: '🧠' },
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'creative', label: 'Creative', icon: '🎨' },
];

const periods = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const goalTypes = [
  {
    value: 'boolean',
    label: 'Checkoff',
    description: 'Complete once per day (e.g., "Did I workout today?")',
    icon: '✓'
  },
  {
    value: 'count',
    label: 'Counter',
    description: 'Track multiple completions per day (e.g., "2 books read")',
    icon: '#'
  },
];

export default function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState(goal?.name || '');
  const [category, setCategory] = useState(goal?.category || 'personal');
  const [goalType, setGoalType] = useState(goal?.goalType || 'boolean');
  const [targetCount, setTargetCount] = useState(goal?.targetCount || 1);
  const [targetPeriod, setTargetPeriod] = useState(goal?.targetPeriod || 'day');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, category, goalType, targetCount, targetPeriod });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Goal Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning workout, Read to Kaia"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          required
        />
      </div>

      {/* Goal Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Goal Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {goalTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setGoalType(type.value)}
              className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                goalType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold ${
                  goalType === type.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {type.icon}
                </span>
                <span className={`font-semibold ${
                  goalType === type.value ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {type.label}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {type.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                category === cat.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Frequency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 mb-2">
            Target Count
          </label>
          <input
            id="targetCount"
            type="number"
            min={1}
            max={365}
            value={targetCount}
            onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>
        <div>
          <label htmlFor="targetPeriod" className="block text-sm font-medium text-gray-700 mb-2">
            Per Period
          </label>
          <select
            id="targetPeriod"
            value={targetPeriod}
            onChange={(e) => setTargetPeriod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Frequency Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{name || 'This goal'}</span>
          {' will appear '}
          <span className="font-medium text-primary-600">
            {targetCount}x per {targetPeriod}
          </span>
          {' in your daily checklist'}
          {goalType === 'count' && (
            <span className="text-gray-500">
              {' (you can log multiple completions each day)'}
            </span>
          )}
          {'.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {goal ? 'Update Goal' : 'Create Goal'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
