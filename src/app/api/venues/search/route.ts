import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/connection';
import Venue from '@/lib/db/models/venue.model';

export async function GET(req: NextRequest) {
  try {
    // Get the search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    // Connect to database
    await connectToDatabase();
    
    // Create search query
    const searchQuery = {
      name: { $regex: query, $options: 'i' }
    };
    
    // Fetch venues (limit to 10)
    const venues = await Venue.find(searchQuery)
      .select('_id name')
      .limit(10)
      .lean();
      
    return NextResponse.json(venues);
  } catch (error) {
    console.error('Error searching venues:', error);
    return NextResponse.json(
      { error: 'Failed to search venues' },
      { status: 500 }
    );
  }
}