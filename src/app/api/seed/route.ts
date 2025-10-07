import { NextResponse } from "next/server";

// Seeding is disabled per system policy. This endpoint returns a clear message and performs no operations.
export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: false,
      message: "Seeding has been disabled. Please use migration and real data flows.",
    },
    { status: 403 }
  );
}
