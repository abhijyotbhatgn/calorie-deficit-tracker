import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const weekStartDate = searchParams.get('weekStartDate');

    if (!userId || !weekStartDate) {
      return NextResponse.json(
        { error: 'Missing userId or weekStartDate' },
        { status: 400 }
      );
    }

    const summary = await db.calculateWeeklySummary(userId, weekStartDate);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly summary' },
      { status: 500 }
    );
  }
}
