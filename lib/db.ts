import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'calorie_tracker.json');

interface Food {
  id: number;
  name: string;
  caloriesPerServing: number;
  servingSize: string;
  createdAt: string;
}

interface DailyLog {
  id: number;
  userId: string;
  foodId?: number;
  foodName: string;
  caloriesConsumed: number;
  servings: number;
  logDate: string;
  source: string;
  createdAt: string;
}

interface HealthSync {
  id: number;
  userId: string;
  syncDate: string;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  deficit: number;
  source: string;
  syncedAt: string;
}

interface FrequentFood {
  id: number;
  userId: string;
  foodId?: number;
  foodName?: string;
  caloriesPerServing?: number;
  logCount: number;
  lastLoggedAt: string;
}

interface WeeklySummary {
  id: number;
  userId: string;
  weekStartDate: string;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  totalDeficit: number;
  averageDailyDeficit: number;
  generatedAt: string;
}

interface Database {
  foods: Food[];
  daily_logs: DailyLog[];
  health_sync: HealthSync[];
  frequent_foods: FrequentFood[];
  weekly_summary: WeeklySummary[];
}

let dbData: Database | null = null;

function loadDb(): Database {
  if (dbData) return dbData;

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const fileData = fs.readFileSync(dbPath, 'utf-8');
    try {
      dbData = JSON.parse(fileData);
    } catch {
      dbData = initDb();
    }
  } else {
    dbData = initDb();
  }

  return dbData!;
}

function initDb(): Database {
  return {
    foods: [],
    daily_logs: [],
    health_sync: [],
    frequent_foods: [],
    weekly_summary: [],
  };
}

function saveDb() {
  if (!dbData) return;
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
}

export async function initializeDatabase() {
  loadDb();
  saveDb();
  console.log('Database initialized successfully at:', dbPath);
}

export const db = {
  // Food queries
  addFood: async (name: string, caloriesPerServing: number, servingSize: string) => {
    const database = loadDb();
    
    if (database.foods.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Food already exists');
    }
    
    const id = Math.max(0, ...database.foods.map(f => f.id)) + 1;
    database.foods.push({
      id,
      name,
      caloriesPerServing,
      servingSize,
      createdAt: new Date().toISOString(),
    });
    saveDb();
    return { success: true, id };
  },

  searchFoods: async (query: string): Promise<Food[]> => {
    const database = loadDb();
    const lowerQuery = query.toLowerCase();
    return database.foods
      .filter(f => f.name.toLowerCase().includes(lowerQuery))
      .slice(0, 20);
  },

  // Daily log queries
  logFood: async (
    userId: string,
    foodId: number | null,
    foodName: string,
    calories: number,
    servings: number = 1,
    logDate: string,
    source: string = 'manual'
  ) => {
    const database = loadDb();
    const id = Math.max(0, ...database.daily_logs.map(l => l.id)) + 1;
    database.daily_logs.push({
      id,
      userId,
      foodId: foodId || undefined,
      foodName,
      caloriesConsumed: calories * servings,
      servings,
      logDate,
      source,
      createdAt: new Date().toISOString(),
    });
    saveDb();
    return { success: true, id };
  },

  getDailyLogs: async (userId: string, logDate: string): Promise<DailyLog[]> => {
    const database = loadDb();
    return database.daily_logs
      .filter(l => l.userId === userId && l.logDate === logDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  deleteLog: async (logId: number) => {
    const database = loadDb();
    const index = database.daily_logs.findIndex(l => l.id === logId);
    if (index >= 0) {
      database.daily_logs.splice(index, 1);
      saveDb();
      return { success: true };
    }
    return { success: false, error: 'Log not found' };
  },

  getTotalCaloriesForDate: async (userId: string, logDate: string): Promise<number> => {
    const database = loadDb();
    return database.daily_logs
      .filter(l => l.userId === userId && l.logDate === logDate)
      .reduce((sum, l) => sum + l.caloriesConsumed, 0);
  },

  // Health sync queries
  syncHealthData: async (
    userId: string,
    syncDate: string,
    caloriesConsumed: number,
    caloriesBurned: number
  ) => {
    const database = loadDb();
    const existingIndex = database.health_sync.findIndex(h => h.userId === userId && h.syncDate === syncDate);
    
    const record = {
      id: existingIndex >= 0 ? database.health_sync[existingIndex].id : Math.max(0, ...database.health_sync.map(h => h.id)) + 1,
      userId,
      syncDate,
      totalCaloriesConsumed: caloriesConsumed,
      totalCaloriesBurned: caloriesBurned,
      deficit: caloriesBurned - caloriesConsumed,
      source: 'apple_health',
      syncedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      database.health_sync[existingIndex] = record;
    } else {
      database.health_sync.push(record);
    }
    saveDb();
    return { success: true };
  },

  getHealthSyncData: async (userId: string, startDate: string, endDate: string): Promise<HealthSync[]> => {
    const database = loadDb();
    return database.health_sync
      .filter(h => h.userId === userId && h.syncDate >= startDate && h.syncDate <= endDate)
      .sort((a, b) => new Date(b.syncDate).getTime() - new Date(a.syncDate).getTime());
  },

  // Frequent foods queries
  addFrequentFood: async (userId: string, foodId: number | null = null, foodName: string | null = null) => {
    const database = loadDb();
    
    // Determine the name to store - use provided foodName, or look it up from foods catalog
    let storedName = foodName;
    if (!storedName && foodId) {
      const food = database.foods.find(f => f.id === foodId);
      storedName = food?.name;
    }
    
    const searchKey = foodId || (storedName ? storedName.toLowerCase() : null);
    
    const existingIndex = database.frequent_foods.findIndex(f => 
      f.userId === userId && (
        (foodId && f.foodId === foodId) || 
        (storedName && f.foodName?.toLowerCase() === storedName.toLowerCase())
      )
    );
    
    if (existingIndex >= 0) {
      database.frequent_foods[existingIndex].logCount += 1;
      database.frequent_foods[existingIndex].lastLoggedAt = new Date().toISOString();
    } else {
      const id = Math.max(0, ...database.frequent_foods.map(f => f.id)) + 1;
      database.frequent_foods.push({
        id,
        userId,
        foodId: foodId || undefined,
        foodName: storedName || undefined,
        logCount: 1,
        lastLoggedAt: new Date().toISOString(),
      });
    }
    saveDb();
    return { success: true };
  },

  addFrequentFoodDirect: async (userId: string, foodName: string, caloriesPerServing: number) => {
    const database = loadDb();
    
    // Check if this favorite already exists
    const existingIndex = database.frequent_foods.findIndex(f =>
      f.userId === userId && f.foodName?.toLowerCase() === foodName.toLowerCase()
    );

    if (existingIndex >= 0) {
      return { success: false, error: 'This favorite already exists' };
    }

    const id = Math.max(0, ...database.frequent_foods.map(f => f.id)) + 1;
    database.frequent_foods.push({
      id,
      userId,
      foodName,
      caloriesPerServing,
      logCount: 0, // Start with 0 since it's manually added, not from logging
      lastLoggedAt: new Date().toISOString(),
    });
    
    saveDb();
    return { success: true, id };
  },

  getFrequentFoods: async (userId: string, limit: number = 10) => {
    const database = loadDb();
    const frequentList = database.frequent_foods
      .filter(f => f.userId === userId)
      .sort((a, b) => b.logCount - a.logCount)
      .slice(0, limit);

    return frequentList.map(f => {
      // Use stored calories if available, otherwise calculate from logs
      let caloriesPerServing = f.caloriesPerServing;
      if (!caloriesPerServing) {
        caloriesPerServing = database.daily_logs
          .filter(l => l.userId === userId && (
            (f.foodId && l.foodId === f.foodId) || 
            (f.foodName && l.foodName.toLowerCase() === f.foodName.toLowerCase())
          ))
          .reduce((sum, l) => sum + l.caloriesConsumed, 0) / Math.max(1, f.logCount);
      }
      
      return {
        id: f.id, // Return the frequent_foods record id for editing
        frequentFoodId: f.id,
        foodId: f.foodId,
        name: f.foodName || database.foods.find(food => food.id === f.foodId)?.name || 'Unknown',
        caloriesPerServing: caloriesPerServing || 0,
        servingSize: '1 serving',
        logCount: f.logCount,
      };
    });
  },

  deleteFrequentFood: async (userId: string, frequentFoodId: number | null = null, foodId: number | null = null, foodName: string | null = null) => {
    const database = loadDb();
    
    const initialLength = database.frequent_foods.length;
    database.frequent_foods = database.frequent_foods.filter(f => 
      !(f.userId === userId && (
        (frequentFoodId && f.id === frequentFoodId) ||
        (foodId && f.foodId === foodId) || 
        (foodName && f.foodName?.toLowerCase() === foodName.toLowerCase())
      ))
    );
    
    if (database.frequent_foods.length < initialLength) {
      saveDb();
      return { success: true };
    }
    
    return { success: false, error: 'Food not found in frequent foods' };
  },

  updateFrequentFood: async (id: number, userId: string, updates: { foodName?: string; caloriesPerServing?: number }) => {
    const database = loadDb();
    
    const foodIndex = database.frequent_foods.findIndex(f => f.id === id && f.userId === userId);
    
    if (foodIndex >= 0) {
      if (updates.foodName) {
        database.frequent_foods[foodIndex].foodName = updates.foodName;
      }
      if (updates.caloriesPerServing !== undefined) {
        database.frequent_foods[foodIndex].caloriesPerServing = updates.caloriesPerServing;
      }
      database.frequent_foods[foodIndex].lastLoggedAt = new Date().toISOString();
      saveDb();
      return { success: true };
    }
    
    return { success: false, error: 'Frequent food not found' };
  },

  // Weekly summary queries
  getWeeklySummary: async (userId: string, weekStartDate: string) => {
    const database = loadDb();
    return database.weekly_summary.find(s => s.userId === userId && s.weekStartDate === weekStartDate);
  },

  calculateWeeklySummary: async (userId: string, weekStartDate: string) => {
    const database = loadDb();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEndStr = weekEndDate.toISOString().split('T')[0];

    // Get daily breakdown for the week
    const dailyBreakdown: { [date: string]: { consumed: number; burned: number } } = {};
    
    // Generate all dates in the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyBreakdown[dateStr] = { consumed: 0, burned: 0 };
    }

    // Add consumed calories from daily logs
    database.daily_logs
      .filter(l => l.userId === userId && l.logDate >= weekStartDate && l.logDate <= weekEndStr)
      .forEach(l => {
        if (dailyBreakdown[l.logDate]) {
          dailyBreakdown[l.logDate].consumed += l.caloriesConsumed;
        }
      });

    // Add burned calories from health sync
    database.health_sync
      .filter(h => h.userId === userId && h.syncDate >= weekStartDate && h.syncDate <= weekEndStr)
      .forEach(h => {
        if (dailyBreakdown[h.syncDate]) {
          dailyBreakdown[h.syncDate].burned = h.totalCaloriesBurned;
        }
      });

    const totalCaloriesConsumed = database.daily_logs
      .filter(l => l.userId === userId && l.logDate >= weekStartDate && l.logDate <= weekEndStr)
      .reduce((sum, l) => sum + l.caloriesConsumed, 0);

    const daysLogged = new Set(
      database.daily_logs
        .filter(l => l.userId === userId && l.logDate >= weekStartDate && l.logDate <= weekEndStr)
        .map(l => l.logDate)
    ).size;

    const healthData = database.health_sync.filter(
      h => h.userId === userId && h.syncDate >= weekStartDate && h.syncDate <= weekEndStr
    );

    const totalCaloriesBurned = healthData.reduce((sum, h) => sum + h.totalCaloriesBurned, 0);
    const totalDeficit = totalCaloriesBurned - totalCaloriesConsumed;

    const averageDailyDeficit = daysLogged > 0 ? totalDeficit / daysLogged : 0;

    return {
      weekStartDate,
      totalCaloriesConsumed,
      totalCaloriesBurned,
      totalDeficit,
      averageDailyDeficit,
      daysLogged,
      dailyBreakdown,
    };
  },
};


