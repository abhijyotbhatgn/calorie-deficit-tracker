'use client';

import { useState, useEffect } from 'react';

interface DailyData {
  date: string;
  consumed: number;
  burned: number;
  deficit: number;
}

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

export default function WeeklySummaryEnhanced({ userId, selectedDate, refreshTrigger = 0 }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<WeeklySummaryData | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeeklySummary();
  }, [selectedDate, refreshTrigger]);

  const getWeekStartDate = (dateStr: string) => {
    // Parse explicitly as UTC to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay();
    // Calculate days since Monday (Monday = 0, Tuesday = 1, ..., Sunday = 6)
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    // Go back to Monday
    const weekStartTime = date.getTime() - (daysSinceMonday * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekStartTime);
    // Format as YYYY-MM-DD
    const y = weekStart.getUTCFullYear();
    const m = String(weekStart.getUTCMonth() + 1).padStart(2, '0');
    const d = String(weekStart.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getWeekDates = (weekStartDate: string) => {
    const dates: DailyData[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        consumed: 0,
        burned: 0,
        deficit: 0,
      });
    }
    return dates;
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
        
        // Use daily breakdown data from API
        const weekDates = getWeekDates(weekStartDate);
        setDailyData(
          weekDates.map((d) => {
            const dayData = data.dailyBreakdown?.[d.date] || { consumed: 0, burned: 0 };
            return {
              ...d,
              consumed: dayData.consumed,
              burned: dayData.burned,
              deficit: dayData.burned - dayData.consumed,
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = () => {
    // Use the largest absolute deficit value, with a minimum of 2000
    const absDeficits = dailyData.map(d => Math.abs(d.deficit));
    const maxDeficit = absDeficits.length > 0 ? Math.max(...absDeficits, 1000) : 1000;
    return maxDeficit;
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const getBarHeight = (deficit: number) => {
    const max = getMaxValue();
    // Cap bar height at 45% of container to stay within baseline area
    const percentage = (Math.abs(deficit) / max) * 45;
    return Math.min(percentage, 45);
  };

  return (
    <div className="card weekly-summary-enhanced">
      <h2>📊 My week</h2>
      
      {loading && <p className="loading">Loading summary...</p>}
      
      {summary ? (
        <>
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
            <div className={`summary-stat highlight ${summary.totalDeficit >= 0 ? 'deficit-positive' : 'deficit-negative'}`}>
              <span className="summary-label">Avg Daily Deficit</span>
              <span className="summary-value">{Math.round(summary.averageDailyDeficit)}</span>
              <span className="summary-unit">kcal/day</span>
            </div>
          </div>

          {/* Weekly Deficit Badge */}
          <div className={`deficit-badge ${summary.totalDeficit >= 0 ? 'deficit-positive' : 'deficit-negative'}`}>
            <div className="deficit-badge-label">🌙 Weekly Net Deficit</div>
            <div className="deficit-badge-value">
              {summary.totalDeficit >= 0 ? '+' : ''}{Math.round(summary.totalDeficit)} kcal
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.9 }}>
              That's {Math.round(summary.totalDeficit / 7700 * 100) / 100} kg of fat loss potential
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="weekly-chart">
            <h3>📊 Daily Breakdown</h3>
            <div className="deficit-chart-container">
              <div className="chart-baseline" />
              <div className="chart-bars-wrapper">
                {dailyData.map((day) => (
                  <div key={day.date} className="chart-bar-group-deficit">
                    {Math.round(day.deficit) !== 0 && (
                      <div className="deficit-value" style={{
                        top: day.deficit >= 0 ? 'auto' : 'auto',
                        bottom: day.deficit >= 0 ? `calc(50% + ${getBarHeight(day.deficit)}% + 4px)` : 'auto',
                        backgroundColor: day.deficit >= 0 ? '#4CAF50' : '#f5576c'
                      }}>
                        {Math.round(day.deficit) > 0 ? '+' : ''}{Math.round(day.deficit)}
                      </div>
                    )}
                    <div
                      className={`chart-bar-deficit ${day.deficit >= 0 ? 'positive' : 'negative'}`}
                      style={{ height: `${getBarHeight(day.deficit)}%` }}
                      title={`Deficit: ${Math.round(day.deficit)} kcal`}
                    />
                    <div className="chart-label">
                      <div className="day-name">{getDayLabel(day.date)}</div>
                      <div className="date-short">{getDateLabel(day.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="empty-state">No data yet for this week</p>
      )}
    </div>
  );
}
