import fs from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  supabaseClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}

function isSupabaseEnabled(): boolean {
  return Boolean(getSupabaseClient());
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

function saveDb() {
  if (!dbData) return;

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
}

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value || 0);
}

function mapFood(row: any): Food {
  return {
    id: asNumber(row.id),
    name: row.name,
    caloriesPerServing: asNumber(row.calories_per_serving),
    servingSize: row.serving_size,
    createdAt: row.created_at,
  };
}

function mapDailyLog(row: any): DailyLog {
  return {
    id: asNumber(row.id),
    userId: row.user_id,
    foodId: row.food_id ?? undefined,
    foodName: row.food_name,
    caloriesConsumed: asNumber(row.calories_consumed),
    servings: asNumber(row.servings),
    logDate: row.log_date,
    source: row.source,
    createdAt: row.created_at,
  };
}

function mapHealthSync(row: any): HealthSync {
  return {
    id: asNumber(row.id),
    userId: row.user_id,
    syncDate: row.sync_date,
    totalCaloriesConsumed: asNumber(row.total_calories_consumed),
    totalCaloriesBurned: asNumber(row.total_calories_burned),
    deficit: asNumber(row.deficit),
    source: row.source,
    syncedAt: row.synced_at,
  };
}

function mapWeeklySummary(row: any): WeeklySummary {
  return {
    id: asNumber(row.id),
    userId: row.user_id,
    weekStartDate: row.week_start_date,
    totalCaloriesConsumed: asNumber(row.total_calories_consumed),
    totalCaloriesBurned: asNumber(row.total_calories_burned),
    totalDeficit: asNumber(row.total_deficit),
    averageDailyDeficit: asNumber(row.average_daily_deficit),
    generatedAt: row.generated_at,
  };
}

function getWeekDateRange(weekStartDate: string): { start: string; end: string } {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  return {
    start: weekStartDate,
    end: weekEndDate.toISOString().split('T')[0],
  };
}

export async function initializeDatabase() {
  if (isSupabaseEnabled()) {
    return;
  }

  loadDb();
  saveDb();
}

export const db = {
  addFood: async (name: string, caloriesPerServing: number, servingSize: string) => {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (client) {
      const { data: existing, error: existingError } = await client
        .from('foods')
        .select('id')
        .ilike('name', name)
        .limit(1);

      if (existingError) throw existingError;
      if (existing && existing.length > 0) {
        throw new Error('Food already exists');
      }

      const { data, error } = await client
        .from('foods')
        .insert({
          name,
          calories_per_serving: caloriesPerServing,
          serving_size: servingSize,
          created_at: now,
        })
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, id: asNumber(data.id) };
    }

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
      createdAt: now,
    });
    saveDb();
    return { success: true, id };
  },

  searchFoods: async (query: string): Promise<Food[]> => {
    const client = getSupabaseClient();

    if (client) {
      const { data, error } = await client
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data || []).map(mapFood);
    }

    const database = loadDb();
    const lowerQuery = query.toLowerCase();
    return database.foods
      .filter(f => f.name.toLowerCase().includes(lowerQuery))
      .slice(0, 20);
  },

  logFood: async (
    userId: string,
    foodId: number | null,
    foodName: string,
    calories: number,
    servings: number = 1,
    logDate: string,
    source: string = 'manual'
  ) => {
    const client = getSupabaseClient();
    const now = new Date().toISOString();
    const caloriesConsumed = calories * servings;

    if (client) {
      const { data, error } = await client
        .from('daily_logs')
        .insert({
          user_id: userId,
          food_id: foodId,
          food_name: foodName,
          calories_consumed: caloriesConsumed,
          servings,
          log_date: logDate,
          source,
          created_at: now,
        })
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, id: asNumber(data.id) };
    }

    const database = loadDb();
    const id = Math.max(0, ...database.daily_logs.map(l => l.id)) + 1;
    database.daily_logs.push({
      id,
      userId,
      foodId: foodId || undefined,
      foodName,
      caloriesConsumed,
      servings,
      logDate,
      source,
      createdAt: now,
    });
    saveDb();
    return { success: true, id };
  },

  getDailyLogs: async (userId: string, logDate: string): Promise<DailyLog[]> => {
    const client = getSupabaseClient();

    if (client) {
      const { data, error } = await client
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', logDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDailyLog);
    }

    const database = loadDb();
    return database.daily_logs
      .filter(l => l.userId === userId && l.logDate === logDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  deleteLog: async (logId: number) => {
    const client = getSupabaseClient();

    if (client) {
      const { data, error } = await client
        .from('daily_logs')
        .delete()
        .eq('id', logId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: false, error: 'Log not found' };
      }
      return { success: true };
    }

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
    const client = getSupabaseClient();

    if (client) {
      const { data, error } = await client
        .from('daily_logs')
        .select('calories_consumed')
        .eq('user_id', userId)
        .eq('log_date', logDate);

      if (error) throw error;
      return (data || []).reduce((sum, row) => sum + asNumber(row.calories_consumed), 0);
    }

    const database = loadDb();
    return database.daily_logs
      .filter(l => l.userId === userId && l.logDate === logDate)
      .reduce((sum, l) => sum + l.caloriesConsumed, 0);
  },

  syncHealthData: async (
    userId: string,
    syncDate: string,
    caloriesConsumed: number,
    caloriesBurned: number
  ) => {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (client) {
      const { error } = await client
        .from('health_sync')
        .upsert(
          {
            user_id: userId,
            sync_date: syncDate,
            total_calories_consumed: caloriesConsumed,
            total_calories_burned: caloriesBurned,
            deficit: caloriesBurned - caloriesConsumed,
            source: 'apple_health',
            synced_at: now,
          },
          { onConflict: 'user_id,sync_date' }
        );

      if (error) throw error;
      return { success: true };
    }

    const database = loadDb();
    const existingIndex = database.health_sync.findIndex(
      h => h.userId === userId && h.syncDate === syncDate
    );

    const record = {
      id:
        existingIndex >= 0
          ? database.health_sync[existingIndex].id
          : Math.max(0, ...database.health_sync.map(h => h.id)) + 1,
      userId,
      syncDate,
      totalCaloriesConsumed: caloriesConsumed,
      totalCaloriesBurned: caloriesBurned,
      deficit: caloriesBurned - caloriesConsumed,
      source: 'apple_health',
      syncedAt: now,
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
    const client = getSupabaseClient();

    if (client) {
      const { data, error } = await client
        .from('health_sync')
        .select('*')
        .eq('user_id', userId)
        .gte('sync_date', startDate)
        .lte('sync_date', endDate)
        .order('sync_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapHealthSync);
    }

    const database = loadDb();
    return database.health_sync
      .filter(h => h.userId === userId && h.syncDate >= startDate && h.syncDate <= endDate)
      .sort((a, b) => new Date(b.syncDate).getTime() - new Date(a.syncDate).getTime());
  },

  addFrequentFood: async (userId: string, foodId: number | null = null, foodName: string | null = null) => {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (client) {
      let storedName = foodName;

      if (!storedName && foodId) {
        const { data: foodRow, error: foodError } = await client
          .from('foods')
          .select('name')
          .eq('id', foodId)
          .maybeSingle();

        if (foodError) throw foodError;
        storedName = foodRow?.name || null;
      }

      let existing: { id: number; log_count: number } | null = null;

      if (foodId) {
        const { data, error } = await client
          .from('frequent_foods')
          .select('id,log_count')
          .eq('user_id', userId)
          .eq('food_id', foodId)
          .maybeSingle();

        if (error) throw error;
        existing = data as { id: number; log_count: number } | null;
      } else if (storedName) {
        const { data, error } = await client
          .from('frequent_foods')
          .select('id,log_count')
          .eq('user_id', userId)
          .ilike('food_name', storedName)
          .maybeSingle();

        if (error) throw error;
        existing = data as { id: number; log_count: number } | null;
      }

      if (existing) {
        const { error } = await client
          .from('frequent_foods')
          .update({
            log_count: asNumber(existing.log_count) + 1,
            last_logged_at: now,
          })
          .eq('id', existing.id)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await client.from('frequent_foods').insert({
          user_id: userId,
          food_id: foodId,
          food_name: storedName,
          log_count: 1,
          last_logged_at: now,
        });

        if (error) throw error;
      }

      return { success: true };
    }

    const database = loadDb();

    let storedName = foodName;
    if (!storedName && foodId) {
      const food = database.foods.find(f => f.id === foodId);
      storedName = food?.name ?? null;
    }

    const existingIndex = database.frequent_foods.findIndex(
      f =>
        f.userId === userId &&
        ((foodId && f.foodId === foodId) ||
          (storedName && f.foodName?.toLowerCase() === storedName.toLowerCase()))
    );

    if (existingIndex >= 0) {
      database.frequent_foods[existingIndex].logCount += 1;
      database.frequent_foods[existingIndex].lastLoggedAt = now;
    } else {
      const id = Math.max(0, ...database.frequent_foods.map(f => f.id)) + 1;
      database.frequent_foods.push({
        id,
        userId,
        foodId: foodId || undefined,
        foodName: storedName || undefined,
        logCount: 1,
        lastLoggedAt: now,
      });
    }

    saveDb();
    return { success: true };
  },

  addFrequentFoodDirect: async (userId: string, foodName: string, caloriesPerServing: number) => {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (client) {
      const { data: existing, error: existingError } = await client
        .from('frequent_foods')
        .select('id')
        .eq('user_id', userId)
        .ilike('food_name', foodName)
        .limit(1);

      if (existingError) throw existingError;
      if (existing && existing.length > 0) {
        return { success: false, error: 'This favorite already exists' };
      }

      const { data, error } = await client
        .from('frequent_foods')
        .insert({
          user_id: userId,
          food_name: foodName,
          calories_per_serving: caloriesPerServing,
          log_count: 0,
          last_logged_at: now,
        })
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, id: asNumber(data.id) };
    }

    const database = loadDb();
    const existingIndex = database.frequent_foods.findIndex(
      f => f.userId === userId && f.foodName?.toLowerCase() === foodName.toLowerCase()
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
      logCount: 0,
      lastLoggedAt: now,
    });

    saveDb();
    return { success: true, id };
  },

  getFrequentFoods: async (userId: string, limit: number = 10) => {
    const client = getSupabaseClient();

    if (client) {
      const { data: frequentRows, error: frequentError } = await client
        .from('frequent_foods')
        .select('*')
        .eq('user_id', userId)
        .order('log_count', { ascending: false })
        .limit(limit);

      if (frequentError) throw frequentError;

      const rows = frequentRows || [];
      const result = [];

      for (const row of rows) {
        const foodId = row.food_id as number | null;
        const logCount = asNumber(row.log_count);

        let name = (row.food_name as string | null) || null;
        if (!name && foodId) {
          const { data: foodRow, error: foodError } = await client
            .from('foods')
            .select('name')
            .eq('id', foodId)
            .maybeSingle();

          if (foodError) throw foodError;
          name = foodRow?.name || null;
        }

        let caloriesPerServing = row.calories_per_serving as number | null;
        if (caloriesPerServing === null || caloriesPerServing === undefined) {
          if (foodId) {
            const { data: logRows, error: logsError } = await client
              .from('daily_logs')
              .select('calories_consumed')
              .eq('user_id', userId)
              .eq('food_id', foodId);

            if (logsError) throw logsError;
            const total = (logRows || []).reduce((sum, l) => sum + asNumber(l.calories_consumed), 0);
            caloriesPerServing = total / Math.max(1, logCount);
          } else if (name) {
            const { data: logRows, error: logsError } = await client
              .from('daily_logs')
              .select('calories_consumed')
              .eq('user_id', userId)
              .ilike('food_name', name);

            if (logsError) throw logsError;
            const total = (logRows || []).reduce((sum, l) => sum + asNumber(l.calories_consumed), 0);
            caloriesPerServing = total / Math.max(1, logCount);
          }
        }

        result.push({
          id: asNumber(row.id),
          frequentFoodId: asNumber(row.id),
          foodId,
          name: name || 'Unknown',
          caloriesPerServing: caloriesPerServing || 0,
          servingSize: '1 serving',
          logCount,
        });
      }

      return result;
    }

    const database = loadDb();
    const frequentList = database.frequent_foods
      .filter(f => f.userId === userId)
      .sort((a, b) => b.logCount - a.logCount)
      .slice(0, limit);

    return frequentList.map(f => {
      let caloriesPerServing = f.caloriesPerServing;
      if (!caloriesPerServing) {
        caloriesPerServing =
          database.daily_logs
            .filter(
              l =>
                l.userId === userId &&
                ((f.foodId && l.foodId === f.foodId) ||
                  (f.foodName && l.foodName.toLowerCase() === f.foodName.toLowerCase()))
            )
            .reduce((sum, l) => sum + l.caloriesConsumed, 0) / Math.max(1, f.logCount);
      }

      return {
        id: f.id,
        frequentFoodId: f.id,
        foodId: f.foodId,
        name: f.foodName || database.foods.find(food => food.id === f.foodId)?.name || 'Unknown',
        caloriesPerServing: caloriesPerServing || 0,
        servingSize: '1 serving',
        logCount: f.logCount,
      };
    });
  },

  deleteFrequentFood: async (
    userId: string,
    frequentFoodId: number | null = null,
    foodId: number | null = null,
    foodName: string | null = null
  ) => {
    const client = getSupabaseClient();

    if (client) {
      let query = client.from('frequent_foods').delete().eq('user_id', userId);

      if (frequentFoodId) {
        query = query.eq('id', frequentFoodId);
      } else if (foodId) {
        query = query.eq('food_id', foodId);
      } else if (foodName) {
        query = query.ilike('food_name', foodName);
      }

      const { data, error } = await query.select('id');
      if (error) throw error;

      if (!data || data.length === 0) {
        return { success: false, error: 'Food not found in frequent foods' };
      }

      return { success: true };
    }

    const database = loadDb();
    const initialLength = database.frequent_foods.length;
    database.frequent_foods = database.frequent_foods.filter(
      f =>
        !(
          f.userId === userId &&
          ((frequentFoodId && f.id === frequentFoodId) ||
            (foodId && f.foodId === foodId) ||
            (foodName && f.foodName?.toLowerCase() === foodName.toLowerCase()))
        )
    );

    if (database.frequent_foods.length < initialLength) {
      saveDb();
      return { success: true };
    }

    return { success: false, error: 'Food not found in frequent foods' };
  },

  updateFrequentFood: async (
    id: number,
    userId: string,
    updates: { foodName?: string; caloriesPerServing?: number }
  ) => {
    const client = getSupabaseClient();

    if (client) {
      const payload: { food_name?: string; calories_per_serving?: number; last_logged_at: string } = {
        last_logged_at: new Date().toISOString(),
      };

      if (updates.foodName) payload.food_name = updates.foodName;
      if (updates.caloriesPerServing !== undefined) {
        payload.calories_per_serving = updates.caloriesPerServing;
      }

      const { data, error } = await client
        .from('frequent_foods')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: false, error: 'Frequent food not found' };
      }

      return { success: true };
    }

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

  getWeeklySummary: async (userId: string, weekStartDate: string) => {
    const client = getSupabaseClient();

    if (client) {
      const { data, error } = await client
        .from('weekly_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStartDate)
        .maybeSingle();

      if (error) throw error;
      return data ? mapWeeklySummary(data) : null;
    }

    const database = loadDb();
    return database.weekly_summary.find(
      s => s.userId === userId && s.weekStartDate === weekStartDate
    );
  },

  calculateWeeklySummary: async (userId: string, weekStartDate: string) => {
    const client = getSupabaseClient();
    const range = getWeekDateRange(weekStartDate);

    const dailyBreakdown: { [date: string]: { consumed: number; burned: number } } = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyBreakdown[dateStr] = { consumed: 0, burned: 0 };
    }

    if (client) {
      const { data: logs, error: logsError } = await client
        .from('daily_logs')
        .select('log_date,calories_consumed')
        .eq('user_id', userId)
        .gte('log_date', range.start)
        .lte('log_date', range.end);

      if (logsError) throw logsError;

      const { data: healthData, error: healthError } = await client
        .from('health_sync')
        .select('sync_date,total_calories_burned')
        .eq('user_id', userId)
        .gte('sync_date', range.start)
        .lte('sync_date', range.end);

      if (healthError) throw healthError;

      for (const l of logs || []) {
        if (dailyBreakdown[l.log_date]) {
          dailyBreakdown[l.log_date].consumed += asNumber(l.calories_consumed);
        }
      }

      for (const h of healthData || []) {
        if (dailyBreakdown[h.sync_date]) {
          dailyBreakdown[h.sync_date].burned = asNumber(h.total_calories_burned);
        }
      }

      const totalCaloriesConsumed = (logs || []).reduce(
        (sum, l) => sum + asNumber(l.calories_consumed),
        0
      );
      const totalCaloriesBurned = (healthData || []).reduce(
        (sum, h) => sum + asNumber(h.total_calories_burned),
        0
      );
      const totalDeficit = totalCaloriesBurned - totalCaloriesConsumed;

      const daysLogged = new Set((logs || []).map(l => l.log_date)).size;
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
    }

    const database = loadDb();

    database.daily_logs
      .filter(l => l.userId === userId && l.logDate >= range.start && l.logDate <= range.end)
      .forEach(l => {
        if (dailyBreakdown[l.logDate]) {
          dailyBreakdown[l.logDate].consumed += l.caloriesConsumed;
        }
      });

    database.health_sync
      .filter(h => h.userId === userId && h.syncDate >= range.start && h.syncDate <= range.end)
      .forEach(h => {
        if (dailyBreakdown[h.syncDate]) {
          dailyBreakdown[h.syncDate].burned = h.totalCaloriesBurned;
        }
      });

    const totalCaloriesConsumed = database.daily_logs
      .filter(l => l.userId === userId && l.logDate >= range.start && l.logDate <= range.end)
      .reduce((sum, l) => sum + l.caloriesConsumed, 0);

    const daysLogged = new Set(
      database.daily_logs
        .filter(l => l.userId === userId && l.logDate >= range.start && l.logDate <= range.end)
        .map(l => l.logDate)
    ).size;

    const healthData = database.health_sync.filter(
      h => h.userId === userId && h.syncDate >= range.start && h.syncDate <= range.end
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
