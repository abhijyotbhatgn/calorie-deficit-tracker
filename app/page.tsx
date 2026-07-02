'use client';

import { useState, useEffect } from 'react';
import FoodLogger from '@/components/FoodLogger';
import DailyStats from '@/components/DailyStats';
import QuickLogDashboard from '@/components/QuickLogDashboard';
import CaloriesBurnedLogger from '@/components/CaloriesBurnedLogger';
import WeeklySummaryEnhanced from '@/components/WeeklySummaryEnhanced';

export default function DashboardPage() {
  const [userId] = useState('user_default');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFoodLogged = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🍎 Calorie Deficit Tracker</h1>
        <p>Track your daily deficit and achieve your health goals</p>
      </header>

      <main className="dashboard-main">
        {/* Date Selector on Top */}
        <div className="date-selector-top">
          <button
            className="date-nav-btn"
            onClick={() => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - 1);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            title="Previous day"
          >
            ← Prev
          </button>
          <label htmlFor="date">Select Date:</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="date-nav-btn"
            onClick={() => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() + 1);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            title="Next day"
          >
            Next →
          </button>
        </div>

        {/* Three Column Main Section */}
        <div className="dashboard-grid-3col">
          {/* Left Column: Log Food + Quick Log */}
          <div className="dashboard-col-left">
            <FoodLogger userId={userId} selectedDate={selectedDate} onFoodLogged={handleFoodLogged} />
            <QuickLogDashboard userId={userId} selectedDate={selectedDate} onFoodLogged={handleFoodLogged} refreshTrigger={refreshTrigger} />
          </div>

          {/* Middle Column: Today (Stats + Calories Burned) */}
          <div className="dashboard-col-middle">
            <div className="today-card">
              <h2 style={{ color: '#FFD4A3', marginBottom: '20px', fontSize: '1.3rem' }}>☀️ Today</h2>
              <DailyStats userId={userId} selectedDate={selectedDate} refreshTrigger={refreshTrigger} onFoodDeleted={handleFoodLogged} />
              <CaloriesBurnedLogger userId={userId} selectedDate={selectedDate} onBurnedLogged={handleFoodLogged} />
            </div>
          </div>

          {/* Right Column: Weekly Summary */}
          <div className="dashboard-col-right">
            <WeeklySummaryEnhanced userId={userId} selectedDate={selectedDate} refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}
