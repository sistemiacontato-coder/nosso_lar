import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Geocodes an address string into lat/lon
async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address || address.trim().length < 2) return null;
  const lower = address.toLowerCase();

  // Instant landmark fallback for Osasco & SP West
  if (lower.includes('prata') || lower.includes('cidade de deus') || lower.includes('bradesco')) {
    return { lat: -23.5358, lon: -46.7725 };
  }
  if (lower.includes('miguel rachid')) {
    return { lat: -23.5320, lon: -46.7790 };
  }
  if (lower.includes('vila yara') || lower.includes('yara')) {
    return { lat: -23.5380, lon: -46.7680 };
  }
  if (lower.includes('continental')) {
    return { lat: -23.5400, lon: -46.7620 };
  }
  if (lower.includes('vila são francisco') || lower.includes('cândido mota')) {
    return { lat: -23.5490, lon: -46.7560 };
  }
  if (lower.includes('lorian') || lower.includes('moema')) {
    return { lat: -23.5420, lon: -46.7660 };
  }

  try {
    const searchQuery = address.toLowerCase().includes('osasco') || address.toLowerCase().includes('são paulo')
      ? address
      : `${address}, Osasco, SP, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQuery
    )}&format=json&limit=1&countrycodes=br&viewbox=-46.85,-23.60,-46.70,-23.50&bounded=0`;

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
    const {
      propertyAddress,
      saymonAddress1,
      saymonAddress2,
      kellyAddress1,
      kellyAddress2,
      saymonWork,
      kellyWork,
    } = body;

    if (!propertyAddress) {
      return NextResponse.json({ success: false, error: 'Property address missing' }, { status: 400 });
    }

    const propCoords = await geocode(propertyAddress);

    // Support both new 2-address format and legacy saymonWork/kellyWork
    const addrSaymon1 = saymonAddress1 || saymonWork || '';
    const addrSaymon2 = saymonAddress2 || '';
    const addrKelly1 = kellyAddress1 || kellyWork || '';
    const addrKelly2 = kellyAddress2 || '';

    const coordsSaymon1 = await geocode(addrSaymon1);
    const coordsSaymon2 = await geocode(addrSaymon2);
    const coordsKelly1 = await geocode(addrKelly1);
    const coordsKelly2 = await geocode(addrKelly2);

    let tempoSaymonMinutos = 25;
    let tempoKellyMinutos = 30;

    if (propCoords) {
      // Calculate best commute time for Saymon from up to 2 addresses
      const timesSaymon: number[] = [];
      if (coordsSaymon1) {
        timesSaymon.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsSaymon1)));
      }
      if (coordsSaymon2) {
        timesSaymon.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsSaymon2)));
      }
      if (timesSaymon.length > 0) {
        tempoSaymonMinutos = Math.min(...timesSaymon);
      }

      // Calculate best commute time for Kelly from up to 2 addresses
      const timesKelly: number[] = [];
      if (coordsKelly1) {
        timesKelly.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsKelly1)));
      }
      if (coordsKelly2) {
        timesKelly.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsKelly2)));
      }
      if (timesKelly.length > 0) {
        tempoKellyMinutos = Math.min(...timesKelly);
      }
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
