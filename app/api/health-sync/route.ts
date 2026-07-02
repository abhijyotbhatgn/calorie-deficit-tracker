import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, syncDate, caloriesConsumed, caloriesBurned } = await request.json();

    if (!userId || !syncDate || caloriesConsumed === undefined || caloriesBurned === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await db.syncHealthData(userId, syncDate, caloriesConsumed, caloriesBurned);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing health data:', error);
    return NextResponse.json(
      { error: 'Failed to sync health data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing userId, startDate, or endDate' },
        { status: 400 }
      );
    }

    const data = await db.getHealthSyncData(userId, startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching health sync data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health sync data' },
      { status: 500 }
    );
  }
}
