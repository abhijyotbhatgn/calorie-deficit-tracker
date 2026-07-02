import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await db.searchFoods(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching foods:', error);
    return NextResponse.json(
      { error: 'Failed to search foods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { name, caloriesPerServing, servingSize } = await request.json();

    if (!name || caloriesPerServing === undefined || !servingSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await db.addFood(name, caloriesPerServing, servingSize);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Food already exists' },
        { status: 409 }
      );
    }
    console.error('Error adding food:', error);
    return NextResponse.json(
      { error: 'Failed to add food' },
      { status: 500 }
    );
  }
}
