'use client';

import { useState } from 'react';

interface CaloriesBurnedLoggerProps {
  userId: string;
  selectedDate: string;
  onBurnedLogged?: () => void;
}

export default function CaloriesBurnedLogger({ userId, selectedDate, onBurnedLogged }: CaloriesBurnedLoggerProps) {
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calories || isNaN(parseFloat(calories)) || parseFloat(calories) <= 0) {
      alert('Please enter a valid calorie amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/health-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          syncDate: selectedDate,
          caloriesConsumed: 0, // Will be calculated from logs
          caloriesBurned: parseFloat(calories),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setCalories('');
        setTimeout(() => setSubmitted(false), 2000);
        if (onBurnedLogged) onBurnedLogged();
      } else {
        alert('Failed to log calories burned');
      }
    } catch (error) {
      console.error('Error logging calories burned:', error);
      alert('Error logging calories burned');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="burned-section">
      <h3>🔥 Burned</h3>
      <form onSubmit={handleSubmit} className="burned-form">
        <div className="form-group">
          <label htmlFor="calories-burned">Enter Calories Burned Today:</label>
          <div className="input-group">
            <input
              id="calories-burned"
              type="number"
              min="0"
              step="1"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g., 2500"
              disabled={loading}
            />
            <span className="input-unit">kcal</span>
          </div>
        </div>
        <button
          type="submit"
          className={`submit-btn ${submitted ? 'success' : ''}`}
          disabled={loading}
        >
          {loading ? '⏳ Saving...' : submitted ? '✓ Saved!' : 'Enter'}
        </button>
      </form>
      <p className="info-text">
        💡 Tip: Apple Watch automatically tracks this. For now, estimate your daily burn or use fitness apps like MyFitnessPal.
      </p>
    </div>
  );
}
