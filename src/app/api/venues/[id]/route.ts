import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/connection';
import Venue from '@/lib/db/models/venue.model';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Fetch venue with populated owner
    const venue = await Venue.findById(id)
      .populate('owner', 'name email')
      .lean();
    
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }
    
    // Convert MongoDB ObjectIds to strings
    const formattedVenue = {
      ...venue,
      _id: venue._id.toString(),
      owner: {
        ...venue.owner,
        _id: venue.owner._id.toString()
      }
    };
    
    return NextResponse.json(formattedVenue);
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue details' },
      { status: 500 }
    );
  }
}