'use client';

import { useState, useRef, useEffect } from 'react';

interface FoodLoggerProps {
  userId: string;
  selectedDate: string;
  onFoodLogged: () => void;
}

interface FoodSearchResult {
  id: number;
  name: string;
  caloriesPerServing: number;
  servingSize: string;
}

export default function FoodLogger({ userId, selectedDate, onFoodLogged }: FoodLoggerProps) {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [servings, setServings] = useState('1');
  const [addToQuickLog, setAddToQuickLog] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (foodName.length > 1) {
      searchTimeout.current = setTimeout(() => {
        searchFoods();
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [foodName]);

  const searchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/foods?q=${encodeURIComponent(foodName)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchWithAI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/foods/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodDescription: foodName }),
      });
      if (response.ok) {
        const data = await response.json();
        setCalories(data.caloriesPerServing.toString());
        setFoodName(data.foodName);
      }
    } catch (error) {
      console.error('Error searching with AI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: FoodSearchResult) => {
    setFoodName(food.name);
    setCalories(food.caloriesPerServing.toString());
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName || !calories) {
      alert('Please fill in food name and calories');
      return;
    }

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          foodName,
          calories: parseFloat(calories),
          servings: parseFloat(servings),
          logDate: selectedDate,
        }),
      });

      if (response.ok) {
        // Add to Quick Log if checkbox is checked
        if (addToQuickLog) {
          try {
            await fetch('/api/frequent-foods', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                foodName,
                caloriesPerServing: parseFloat(calories),
              }),
            });
          } catch (error) {
            console.error('Error adding to quick log:', error);
          }
        }

        setFoodName('');
        setCalories('');
        setServings('1');
        setAddToQuickLog(false);
        onFoodLogged();
      } else {
        alert('Failed to log food');
      }
    } catch (error) {
      console.error('Error logging food:', error);
      alert('Error logging food');
    }
  };

  return (
    <div className="card food-logger">
      <h2>🍽️ Log Food</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="food-name">Food Name</label>
          <input
            id="food-name"
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="e.g., Apple, Chicken Breast..."
            autoComplete="off"
          />
          {loading && <span className="loading-spinner">⏳</span>}
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((food) => (
                <li key={food.id} onClick={() => handleSelectFood(food)} className="search-result-item">
                  <span className="food-name-result">{food.name}</span>
                  <span className="food-cal-result">{food.caloriesPerServing} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="calories">Calories per Serving</label>
          <input
            id="calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 95"
          />
          <button
            type="button"
            className="ai-search-btn"
            onClick={searchWithAI}
            disabled={!foodName || loading}
          >
            🤖 AI Search
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="servings">Servings</label>
          <input
            id="servings"
            type="number"
            step="0.5"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="e.g., 1"
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="add-to-quick-log" className="checkbox-label">
            <input
              id="add-to-quick-log"
              type="checkbox"
              checked={addToQuickLog}
              onChange={(e) => setAddToQuickLog(e.target.checked)}
            />
            <span>Add to Quick Log</span>
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Log
        </button>
      </form>
    </div>
  );
}
