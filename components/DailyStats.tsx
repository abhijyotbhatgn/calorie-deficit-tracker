'use client';

import { useState, useEffect } from 'react';

interface DailyLog {
  id: number;
  foodName: string;
  caloriesConsumed: number;
  servings: number;
  createdAt: string;
}

interface DailyStatsProps {
  userId: string;
  selectedDate: string;
  refreshTrigger: number;
  onFoodDeleted?: () => void;
}

export default function DailyStats({ userId, selectedDate, refreshTrigger, onFoodDeleted }: DailyStatsProps) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ name: '', calories: '', servings: '' });

  useEffect(() => {
    fetchLogs();
  }, [selectedDate, refreshTrigger]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/logs?userId=${userId}&logDate=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalCalories(data.totalCalories);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (logId: number) => {
    setDeletingId(logId);
    try {
      const response = await fetch(`/api/logs?id=${logId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const logToDelete = logs.find(l => l.id === logId);
        if (logToDelete) {
          setTotalCalories(totalCalories - logToDelete.caloriesConsumed);
        }
        setLogs(logs.filter(log => log.id !== logId));
        if (onFoodDeleted) onFoodDeleted();
      } else {
        alert('Failed to delete food log');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Error deleting food log');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (log: DailyLog) => {
    setEditingId(log.id);
    setEditValues({
      name: log.foodName,
      calories: log.caloriesConsumed.toString(),
      servings: log.servings.toString(),
    });
  };

  const saveEdit = async (logId: number) => {
    if (!editValues.name || !editValues.calories) {
      alert('Please fill in food name and calories');
      return;
    }

    try {
      // Delete old entry and create new one
      await fetch(`/api/logs?id=${logId}`, { method: 'DELETE' });
      
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          foodName: editValues.name,
          calories: parseFloat(editValues.calories),
          servings: parseFloat(editValues.servings),
          logDate: selectedDate,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchLogs();
        if (onFoodDeleted) onFoodDeleted();
      } else {
        alert('Failed to update food log');
      }
    } catch (error) {
      console.error('Error updating log:', error);
      alert('Error updating food log');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', calories: '', servings: '' });
  };

  return (
    <div className="card daily-stats">
      <div className="stats-section consumed-section">
        <h3>📊 Consumed</h3>
        <div className="stats-display">
          <div className="stat-item">
            <span className="stat-label">Total Calories</span>
            <span className="stat-value">{Math.round(totalCalories)}</span>
            <span className="stat-unit">kcal</span>
          </div>
        </div>

        {loading && <p className="loading">Loading logs...</p>}

        {logs.length > 0 ? (
          <div className="logs-list">
        <h4>📋 Food Log</h4>
            {logs.map((log) => (
              <div key={log.id}>
                {editingId === log.id ? (
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
                    <input
                      type="number"
                      step="0.5"
                      value={editValues.servings}
                      onChange={(e) => setEditValues({ ...editValues, servings: e.target.value })}
                      placeholder="Servings"
                      className="edit-input"
                    />
                    <div className="edit-buttons">
                      <button className="edit-save-btn" onClick={() => saveEdit(log.id)}>Save</button>
                      <button className="edit-cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="log-item">
                    {log.servings !== 1 && (
                      <span className="servings-badge">{log.servings}</span>
                    )}
                    <div className="log-food">
                      <span className="log-name">{log.foodName}</span>
                    </div>
                    <div className="log-actions">
                      <span className="log-calories">{Math.round(log.caloriesConsumed)} kcal</span>
                      <button
                        className="log-edit-btn"
                        onClick={() => startEdit(log)}
                        title="Edit this food log entry"
                      >
                        ✎
                      </button>
                      <button
                        className="log-delete-btn"
                        onClick={() => deleteLog(log.id)}
                        disabled={deletingId === log.id}
                        title="Delete this food log entry"
                      >
                        {deletingId === log.id ? '...' : '✕'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No foods logged yet for {selectedDate}</p>
        )}
      </div>
    </div>
  );
}
