import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const waypoints = searchParams.get("waypoints");
  const key = "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc";

  if (!origin || !destination) {
    return NextResponse.json({ error: "Missing origin or destination" }, { status: 400 });
  }

  try {
    let apiUrl;
    if (waypoints) {
      // Use Directions API for routes with stops
      apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&key=${key}`;
    } else {
      // Default to Distance Matrix for simple routes
      apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${key}`;
    }

    const res = await fetch(apiUrl);
    const data = await res.json();

    // If using Directions API, transform response to mimic Distance Matrix structure
    if (waypoints && data.status === "OK" && data.routes?.[0]) {
      const route = data.routes[0];
      const totalDistance = route.legs.reduce((acc: number, leg: any) => acc + leg.distance.value, 0);
      const totalDuration = route.legs.reduce((acc: number, leg: any) => acc + leg.duration.value, 0);

      return NextResponse.json({
        rows: [{
          elements: [{
            status: "OK",
            distance: { value: totalDistance },
            duration: { value: totalDuration }
          }]
        }]
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch distance" }, { status: 500 });
  }
}
