import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const latlng = searchParams.get("latlng");
  const key = "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc";

  if (!q && !latlng) {
    return NextResponse.json({ error: "Missing query or latlng" }, { status: 400 });
  }

  let url = "";
  if (latlng) {
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(latlng)}&key=${key}`;
  } else {
    url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q || "")}&key=${key}&components=country:lk`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch geocode data" }, { status: 500 });
  }
}
