import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VenuesTable } from "@/components/venues/venues-table";
import { VenuesTableSkeleton } from "@/components/venues/venues-table-skeleton";
import { VenuesToolbar } from "@/components/venues/venues-toolbar";
import { PageHeading } from "@/components/ui/page-heading";
import { connectToDatabase } from "@/lib/db/connection";
import Venue from "@/lib/db/models/venue.model";
import { ClientWrapper } from "./client-wrapper";

export const metadata = {
  title: "Manage Venues | Turfy Admin Portal",
  description: "View, filter, and manage all venues on the Turfy platform",
};

interface VenuesPageProps {
  searchParams: {
    status?: string;
    q?: string;
    sort?: string;
    page?: string;
    country?: string;
  };
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  // Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Resolve search parameters
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const status = resolvedSearchParams?.status || "all";
  const query = resolvedSearchParams?.q || "";
  const sort = resolvedSearchParams?.sort || "createdAt_desc";
  const page = Number(resolvedSearchParams?.page || "1");
  const country = resolvedSearchParams?.country || "";

  // Connect to database and retrieve filter counts
  await connectToDatabase();
  const [
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    deletedCount,
    countriesData
  ] = await Promise.all([
    Venue.countDocuments({}),
    Venue.countDocuments({ status: "pending", deletedAt: null }),
    Venue.countDocuments({ status: "approved", deletedAt: null }),
    Venue.countDocuments({ status: "rejected", deletedAt: null }),
    Venue.countDocuments({ deletedAt: { $ne: null } }),
    Venue.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  // Map aggregated country data for the toolbar
  const countries = countriesData.map(item => ({
    code: item._id,
    count: item.count
  }));

  return (
    <div className="flex flex-col h-full space-y-4">
      <PageHeading
        title="All Venues"
        description="View, filter, and manage all venues in the Turfy platform."
        actions={
          <div className="flex gap-2">
            <a href="/dashboard/venues/create">
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Create New Venue
              </button>
            </a>
          </div>
        }
      />

      <VenuesToolbar 
        totalCount={totalCount}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        deletedCount={deletedCount}
        countries={countries}
        status={status}
        query={query}
      />

      <ClientWrapper
        status={status}
        query={query}
        sort={sort}
        page={page}
        country={country}
      />
    </div>
  );
}