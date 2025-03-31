import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/connection';
import { User } from '@/lib/db/models/user.model';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find all venue owners
    const venueOwners = await User.find({ role: 'venue-owner' })
      .select('_id name email')
      .sort({ name: 1 })
      .lean();
    
    // Format the response
    const formattedOwners = venueOwners.map(owner => ({
      id: owner._id.toString(),
      name: owner.name,
      email: owner.email || 'No email'
    }));
    
    return NextResponse.json(formattedOwners);
  } catch (error) {
    console.error('Error fetching venue owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue owners' },
      { status: 500 }
    );
  }
}