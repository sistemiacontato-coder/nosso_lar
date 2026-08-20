import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    // Append São Paulo, Brasil if not included for better local accuracy
    const searchQuery = query.toLowerCase().includes('sp') || query.toLowerCase().includes('são paulo')
      ? query
      : `${query}, São Paulo, SP, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQuery
    )}&format=json&addressdetails=1&limit=5&countrycodes=br`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NossoLarApp/1.0 (nosso-lar@sistemia.com.br)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, suggestions: [] });
    }

    const data = await res.json();

    const suggestions = data.map((item: any) => {
      const address = item.address || {};
      const road = address.road || address.pedestrian || address.suburb || item.display_name.split(',')[0];
      const houseNumber = address.house_number ? `, ${address.house_number}` : '';
      const suburb = address.suburb || address.neighbourhood || address.city_district || '';
      const city = address.city || address.town || address.municipality || 'São Paulo';
      const state = address.state || 'SP';

      const shortTitle = [road + houseNumber, suburb, city].filter(Boolean).join(' - ');

      return {
        id: item.place_id,
        displayName: item.display_name,
        shortTitle: shortTitle || item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Geocode API Error:', error);
    return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
  }
}
