import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import SportsType from '@/lib/db/models/sports-type.model';

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Fetch all sports types
    const sportsTypes = await SportsType.find()
      .select('name icon')
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json(sportsTypes);
  } catch (error) {
    console.error('Error fetching sports types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports types' },
      { status: 500 }
    );
  }
}