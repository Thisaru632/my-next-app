import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const coords = req.nextUrl.searchParams.get('coords') ?? '';
    if (!coords.trim()) {
        return NextResponse.json({ error: 'Missing coords' }, { status: 400 });
    }

    const url =
        `https://router.project-osrm.org/route/v1/driving/${coords}` +
        `?overview=false&steps=false`;

    try {
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) {
            return NextResponse.json({ error: `OSRM HTTP ${res.status}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Route fetch failed' }, { status: 500 });
    }
}
