import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const frequentFoods = await db.getFrequentFoods(userId, limit);
    return NextResponse.json(frequentFoods);
  } catch (error) {
    console.error('Error fetching frequent foods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frequent foods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, foodName, caloriesPerServing } = body;

    if (!userId || !foodName || caloriesPerServing === undefined) {
      return NextResponse.json(
        { error: 'Missing userId, foodName, or caloriesPerServing' },
        { status: 400 }
      );
    }

    // Create a new favorite without logging
    const result = await db.addFrequentFoodDirect(userId, foodName, caloriesPerServing);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, id, foodName, caloriesPerServing } = body;

    if (!userId || !id) {
      return NextResponse.json(
        { error: 'Missing userId or id' },
        { status: 400 }
      );
    }

    const result = await db.updateFrequentFood(id, userId, { foodName, caloriesPerServing });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update frequent food' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating frequent food:', error);
    return NextResponse.json(
      { error: 'Failed to update frequent food' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, id, foodId, foodName } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (!id && !foodId && !foodName) {
      return NextResponse.json(
        { error: 'Missing id, foodId, or foodName' },
        { status: 400 }
      );
    }

    const result = await db.deleteFrequentFood(
      userId,
      id ? parseInt(id) : null,
      foodId ? parseInt(foodId) : null,
      foodName
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete frequent food' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting frequent food:', error);
    return NextResponse.json(
      { error: 'Failed to delete frequent food' },
      { status: 500 }
    );
  }
}
