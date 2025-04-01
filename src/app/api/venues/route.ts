import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/connection';
import Venue from '@/lib/db/models/venue.model';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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
    
    // Extract necessary fields including sportsTypes, amenities, and images
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
      amenities,
      images = []
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
      images: [], // Start with empty images array, we'll update it after migration
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
    
    // Save venue to database to get the ID
    await newVenue.save();
    
    // If there were images uploaded with a temporary ID, move them to the correct folder
    if (images && images.length > 0) {
      const updatedImageUrls: string[] = [];
      
      // Process each image
      for (const image of images) {
        if (typeof image === 'string') {
          // If it's just a URL string, add it directly
          updatedImageUrls.push(image);
          continue;
        }
        
        // Extract public ID from the full path
        const publicId = image.publicId;
        
        // Check if the image is in a temporary folder
        if (publicId && publicId.includes('venues/temp')) {
          try {
            // Create the new destination folder path
            const newFolder = `venues/${newVenue._id}`;
            
            // Extract the filename from the public ID
            const pathParts = publicId.split('/');
            const fileName = pathParts[pathParts.length - 1];
            
            // Set the new public ID with the venue's ID folder
            const newPublicId = `${newFolder}/${fileName}`;
            
            // Move the image to the new folder
            const moveResult = await new Promise<any>((resolve, reject) => {
              cloudinary.uploader.rename(
                publicId,
                newPublicId,
                { invalidate: true },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
            });
            
            // Add the new URL to our updated images array
            updatedImageUrls.push(moveResult.secure_url);
          } catch (moveError) {
            console.error('Error moving image in Cloudinary:', moveError);
            // If move fails, use the original URL
            updatedImageUrls.push(image.url);
          }
        } else {
          // If not in temp folder or missing publicId, use the original URL
          updatedImageUrls.push(image.url);
        }
      }
      
      // Update the venue with the new image URLs
      newVenue.images = updatedImageUrls;
      await newVenue.save();
    }
    
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