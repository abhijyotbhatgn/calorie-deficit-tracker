'use client';

import { useState, useEffect } from 'react';

interface WeeklySummaryData {
  weekStartDate: string;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  totalDeficit: number;
  averageDailyDeficit: number;
  daysLogged: number;
}

interface WeeklySummaryProps {
  userId: string;
  selectedDate: string;
  refreshTrigger?: number;
}

export default function WeeklySummary({ userId, selectedDate, refreshTrigger = 0 }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeeklySummary();
  }, [userId, selectedDate, refreshTrigger]);

  const getWeekStartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  const fetchWeeklySummary = async () => {
    setLoading(true);
    try {
      const weekStartDate = getWeekStartDate(selectedDate);
      const response = await fetch(
        `/api/weekly-summary?userId=${userId}&weekStartDate=${weekStartDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card weekly-summary">
      <h2>📊 Weekly Summary</h2>
      {loading && <p className="loading">Loading summary...</p>}
      {summary ? (
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">Total Consumed</span>
            <span className="summary-value">{Math.round(summary.totalCaloriesConsumed)}</span>
            <span className="summary-unit">kcal</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Total Burned</span>
            <span className="summary-value">{Math.round(summary.totalCaloriesBurned)}</span>
            <span className="summary-unit">kcal</span>
          </div>
          <div className="summary-stat highlight">
            <span className="summary-label">Total Deficit</span>
            <span className="summary-value">{Math.round(summary.totalDeficit)}</span>
            <span className="summary-unit">kcal</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Avg Daily Deficit</span>
            <span className="summary-value">{Math.round(summary.averageDailyDeficit)}</span>
            <span className="summary-unit">kcal</span>
          </div>
        </div>
      ) : (
        <p className="empty-state">No data yet for this week</p>
      )}
    </div>
  );
}
