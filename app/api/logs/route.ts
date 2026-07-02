import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, foodName, calories, servings = 1, foodId, logDate } = await request.json();

    if (!userId || !foodName || !calories || !logDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await db.logFood(userId, foodId || null, foodName, calories, servings, logDate, 'manual');

    // Update frequent foods - track by foodId if available, otherwise by foodName
    if (foodId) {
      await db.addFrequentFood(userId, foodId, null);
    } else {
      await db.addFrequentFood(userId, null, foodName);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging food:', error);
    return NextResponse.json(
      { error: 'Failed to log food' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { error: 'Missing logId' },
        { status: 400 }
      );
    }

    const result = await db.deleteLog(parseInt(logId));
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete log' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json(
      { error: 'Failed to delete log' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const logDate = searchParams.get('logDate');

    if (!userId || !logDate) {
      return NextResponse.json(
        { error: 'Missing userId or logDate' },
        { status: 400 }
      );
    }

    const logs = await db.getDailyLogs(userId, logDate);
    const totalCalories = await db.getTotalCaloriesForDate(userId, logDate);

    return NextResponse.json({ logs, totalCalories });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
