'use client';

import { useState, useEffect, useCallback } from 'react';

interface FrequentFood {
  id: number;
  name: string;
  caloriesPerServing: number;
  servingSize: string;
  logCount?: number;
}

interface QuickLogDashboardProps {
  userId: string;
  selectedDate: string;
  onFoodLogged: () => void;
  refreshTrigger?: number;
}

export default function QuickLogDashboard({ userId, selectedDate, onFoodLogged, refreshTrigger = 0 }: QuickLogDashboardProps) {
  const [frequentFoods, setFrequentFoods] = useState<FrequentFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ name: '', calories: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addValues, setAddValues] = useState({ name: '', calories: '' });

  const fetchFrequentFoods = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/frequent-foods?userId=${userId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        // Sort by logCount descending to show most frequent at top
        const sorted = [...data].sort((a, b) => (b.logCount || 0) - (a.logCount || 0));
        setFrequentFoods(sorted);
      }
    } catch (error) {
      console.error('Error fetching frequent foods:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFrequentFoods();
  }, [fetchFrequentFoods, refreshTrigger]);

  const logQuickFood = async (food: FrequentFood) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          foodName: food.name,
          calories: food.caloriesPerServing,
          servings: 1,
          logDate: selectedDate,
        }),
      });
      onFoodLogged();
      await fetchFrequentFoods();
    } catch (error) {
      console.error('Error logging quick food:', error);
    }
  };

  const removeQuickLogEntry = async (food: FrequentFood) => {
    setDeletingId(food.id);
    try {
      // Delete the food from frequent foods via API
      const response = await fetch('/api/frequent-foods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          id: food.id,
          foodName: food.name,
        }),
      });

      if (response.ok) {
        // Remove from the list
        setFrequentFoods(frequentFoods.filter(f => f.id !== food.id));
        onFoodLogged();
      } else {
        alert('Failed to remove quick log entry');
      }
    } catch (error) {
      console.error('Error removing quick log entry:', error);
      alert('Error removing quick log entry');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (food: FrequentFood) => {
    setEditingId(food.id);
    setEditValues({ name: food.name, calories: food.caloriesPerServing.toString() });
  };

  const saveEdit = async (foodId: number) => {
    if (!editValues.name || !editValues.calories) {
      alert('Please fill in food name and calories');
      return;
    }

    try {
      const newCalories = parseFloat(editValues.calories);
      
      // Update the favorite food properties without logging
      const response = await fetch('/api/frequent-foods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          id: foodId,
          foodName: editValues.name,
          caloriesPerServing: newCalories,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditValues({ name: '', calories: '' });
        await fetchFrequentFoods();
        onFoodLogged();
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Error saving changes');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', calories: '' });
  };

  const addNewFavorite = async () => {
    if (!addValues.name || !addValues.calories) {
      alert('Please fill in food name and calories');
      return;
    }

    try {
      const newCalories = parseFloat(addValues.calories);
      
      // Create new favorite without logging
      const response = await fetch('/api/frequent-foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          foodName: addValues.name,
          caloriesPerServing: newCalories,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setAddValues({ name: '', calories: '' });
        await fetchFrequentFoods();
      } else {
        alert('Failed to add favorite');
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      alert('Error adding favorite');
    }
  };

  const cancelAddForm = () => {
    setShowAddForm(false);
    setAddValues({ name: '', calories: '' });
  };

  return (
    <div className="card quick-log">
      <div className="quick-log-header">
        <h2>⚡ Quick Log</h2>
        <button
          className="quick-log-add-btn"
          onClick={() => setShowAddForm(true)}
          title="Add new favorite"
        >
          +
        </button>
      </div>

      {showAddForm && (
        <div className="log-edit-form">
          <input
            type="text"
            value={addValues.name}
            onChange={(e) => setAddValues({ ...addValues, name: e.target.value })}
            placeholder="Food name"
            className="edit-input"
            autoFocus
          />
          <input
            type="number"
            value={addValues.calories}
            onChange={(e) => setAddValues({ ...addValues, calories: e.target.value })}
            placeholder="Calories per serving"
            className="edit-input"
          />
          <div className="edit-buttons">
            <button className="edit-save-btn" onClick={addNewFavorite}>Add</button>
            <button className="edit-cancel-btn" onClick={cancelAddForm}>Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="loading">Loading favorite foods...</p>}
      {frequentFoods.length > 0 ? (
        <div className="quick-log-list">
          {frequentFoods.map((food) => (
            <div key={food.id}>
              {editingId === food.id ? (
                <div className="log-edit-form">
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    placeholder="Food name"
                    className="edit-input"
                  />
                  <input
                    type="number"
                    value={editValues.calories}
                    onChange={(e) => setEditValues({ ...editValues, calories: e.target.value })}
                    placeholder="Calories"
                    className="edit-input"
                  />
                  <div className="edit-buttons">
                    <button className="edit-save-btn" onClick={() => saveEdit(food.id)}>Save</button>
                    <button className="edit-cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="quick-log-item">
                  <div className="quick-log-item-info">
                    <button
                      className="quick-log-btn-inline"
                      onClick={() => logQuickFood(food)}
                      title={`${Math.round(food.caloriesPerServing)} kcal (logged ${food.logCount || 1} times)`}
                    >
                      <span className="quick-log-item-name">{food.name}</span>
                      <span className="quick-log-item-cal">{Math.round(food.caloriesPerServing)}kcal</span>
                    </button>
                  </div>
                  <div className="quick-log-item-actions">
                    <button
                      className="quick-log-edit-btn"
                      onClick={() => startEdit(food)}
                      title="Edit this quick log entry"
                    >
                      ✎
                    </button>
                    <button
                      className="quick-log-delete-btn"
                      onClick={() => removeQuickLogEntry(food)}
                      disabled={deletingId === food.id}
                      title="Remove from quick log"
                    >
                      {deletingId === food.id ? '...' : '−'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">Log foods to see quick favorites here</p>
      )}
    </div>
  );
}
