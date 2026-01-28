'use client';

import { useEffect, useState } from 'react';
import GoalCard from '@/components/GoalCard';
import GoalForm from '@/components/GoalForm';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface Goal {
  id: string;
  name: string;
  category: string;
  targetCount: number;
  targetPeriod: string;
  icon: string | null;
  color: string | null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (data: Omit<Goal, 'id' | 'icon' | 'color'>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setShowForm(false);
        fetchGoals();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdate = async (data: Omit<Goal, 'id' | 'icon' | 'color'>) => {
    if (!editingGoal) return;
    try {
      const response = await fetch(`/api/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setEditingGoal(null);
        fetchGoals();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Goals
          </h1>
          <p className="text-gray-500 mt-1">Manage your goals and habits</p>
        </div>
        {!showForm && !editingGoal && (
          <Button onClick={() => setShowForm(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Goal
          </Button>
        )}
      </div>

      {/* Form */}
      {(showForm || editingGoal) && (
        <Card variant="highlight" className="animate-slide-down">
          <h2 className="text-xl font-semibold mb-6">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <GoalForm
            goal={editingGoal || undefined}
            onSubmit={editingGoal ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingGoal(null);
            }}
          />
        </Card>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card variant="gradient" className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-500 mb-6">Create your first goal to start tracking your progress</p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>Create Your First Goal</Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GoalCard
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleDelete(goal.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
