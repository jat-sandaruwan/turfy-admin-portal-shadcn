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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check user authentication and role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse the request body to get the new status
    const body = await request.json();
    const { status } = body;
    if (!status) {
      return NextResponse.json(
        { error: "Missing status field" },
        { status: 400 }
      );
    }

    // Update the venue document
    const updatedVenue = await Venue.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedVenue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ venue: updatedVenue });
  } catch (error: any) {
    // Log and return error response
    console.error("Error updating venue status:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE method for soft deleting a venue (marking it as deleted)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure dynamic params are resolved before using them.
    const resolvedParams = await Promise.resolve(params);
    
    // Debug log using the resolved params.
    console.log(`DELETE request received for venue ID: ${resolvedParams.id}`);

    // Ensure the user is authenticated and is an admin.
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Connect to the database.
    await connectToDatabase();

    // Perform soft delete by setting `deletedAt` to the current time.
    const updatedVenue = await Venue.findByIdAndUpdate(
      resolvedParams.id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!updatedVenue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Debug success log.
    console.log(`Venue soft-deleted successfully: ${resolvedParams.id}`);

    return NextResponse.json({
      message: "Venue deleted successfully",
      venue: updatedVenue,
    });
  } catch (error: any) {
    console.error("Error deleting venue:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}