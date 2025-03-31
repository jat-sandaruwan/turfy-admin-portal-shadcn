import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/connection';
import Venue from '@/lib/db/models/venue.model';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Extract necessary fields including sportsTypes and amenities
    const {
      name,
      description,
      address,
      country,
      currency,
      longitude,
      latitude,
      commissionPercentage,
      ownerId,
      sportsTypes,
      amenities
    } = body;
    
    // Validate required fields
    if (!name || !address || !country || !currency || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Create venue with pending status
    const newVenue = new Venue({
      owner: ownerId,
      name,
      description: description || '',
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      commissionPercentage,
      amenities: amenities || [],
      sportsTypes: sportsTypes || [],
      images: [],
      country,
      currency,
      managers: [],
      status: 'pending',
      ratingAverage: 0,
      ratingCount: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      stripeOnboardingComplete: false
    });
    
    // Save venue to database
    await newVenue.save();
    
    return NextResponse.json(newVenue, { status: 201 });
  } catch (error: any) {
    console.error('Error creating venue:', error);
    
    // Handle specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}