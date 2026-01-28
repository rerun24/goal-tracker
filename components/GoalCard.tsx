'use client';

import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

interface Goal {
  id: string;
  name: string;
  category: string;
  targetCount: number;
  targetPeriod: string;
  icon: string | null;
  color: string | null;
}

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
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

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const icon = goal.icon || categoryIcons[goal.category] || '📌';
  const gradient = categoryColors[goal.category] || 'from-gray-500 to-gray-600';

  const periodLabel = {
    day: 'daily',
    week: 'per week',
    month: 'per month',
    year: 'per year',
  }[goal.targetPeriod] || goal.targetPeriod;

  return (
    <Card padding="none" hover className="overflow-hidden group">
      <div className="flex items-stretch">
        <div className={`w-1.5 bg-gradient-to-b ${gradient}`} />
        <div className="flex-1 p-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                {goal.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {goal.category}
                </span>
                <span className="text-sm text-gray-500">
                  {goal.targetCount}x {periodLabel}
                </span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
              <Button
                variant={confirmDelete ? 'danger' : 'ghost'}
                size="sm"
                onClick={handleDelete}
              >
                {confirmDelete ? 'Confirm' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
