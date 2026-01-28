'use client';

import { useState } from 'react';
import Button from './ui/Button';

interface Goal {
  id?: string;
  name: string;
  category: string;
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

export default function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState(goal?.name || '');
  const [category, setCategory] = useState(goal?.category || 'personal');
  const [targetCount, setTargetCount] = useState(goal?.targetCount || 1);
  const [targetPeriod, setTargetPeriod] = useState(goal?.targetPeriod || 'day');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, category, targetCount, targetPeriod });
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
          {' in your daily checklist.'}
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
