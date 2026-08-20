import { NextRequest, NextResponse } from 'next/server';

// Geocodes an address string into lat/lon
async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const searchQuery = address.toLowerCase().includes('sp') || address.toLowerCase().includes('são paulo') || address.toLowerCase().includes('osasco')
      ? address
      : `${address}, SP, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQuery
    )}&format=json&limit=1&countrycodes=br`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'NossoLarApp/1.0 (nosso-lar@sistemia.com.br)',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {}
  return null;
}

// Calculate Haversine distance in KM
function haversineDistance(coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const dLon = ((coords2.lon - coords1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coords1.lat * Math.PI) / 180) *
      Math.cos((coords2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate transit/driving time in minutes for Greater SP area
function estimateCommuteMinutes(distanceKm: number): number {
  if (distanceKm <= 1) return 10;
  if (distanceKm <= 3) return 15;
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 10) return 30;
  if (distanceKm <= 15) return 40;
  if (distanceKm <= 25) return 55;
  if (distanceKm <= 35) return 70;
  return Math.round(distanceKm * 2.2);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyAddress, saymonWork, kellyWork } = body;

    if (!propertyAddress) {
      return NextResponse.json({ success: false, error: 'Property address missing' }, { status: 400 });
    }

    const propCoords = await geocode(propertyAddress);
    const saymonCoords = saymonWork ? await geocode(saymonWork) : null;
    const kellyCoords = kellyWork ? await geocode(kellyWork) : null;

    let tempoSaymonMinutos = 25;
    let tempoKellyMinutos = 30;

    if (propCoords && saymonCoords) {
      const distSaymon = haversineDistance(propCoords, saymonCoords);
      tempoSaymonMinutos = estimateCommuteMinutes(distSaymon);
    }

    if (propCoords && kellyCoords) {
      const distKelly = haversineDistance(propCoords, kellyCoords);
      tempoKellyMinutos = estimateCommuteMinutes(distKelly);
    }

    return NextResponse.json({
      success: true,
      tempoSaymonMinutos,
      tempoKellyMinutos,
      mediaTempoMinutos: Math.round((tempoSaymonMinutos + tempoKellyMinutos) / 2),
    });
  } catch (error: any) {
    console.error('Calculate commute error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
