import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q') ?? '';
    if (!q.trim()) return NextResponse.json([]);

    const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=json&q=${encodeURIComponent(q)}&countrycodes=lk&limit=30&addressdetails=1`;

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'SenuTours/1.0 (contact@senutours.lk)',
                'Accept-Language': 'en',
                'Accept': 'application/json',
            },
            // Next.js server-side — no CORS issues
        });

        if (!res.ok) {
            return NextResponse.json([], { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
