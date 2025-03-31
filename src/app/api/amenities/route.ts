import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connection';
import Amenity from '@/lib/db/models/amenity.model';

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Fetch all amenities
    const amenities = await Amenity.find()
      .select('name value icon')
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch amenities' },
      { status: 500 }
    );
  }
}