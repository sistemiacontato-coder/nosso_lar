import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Geocodes an address string into lat/lon
async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address || address.trim().length < 2) return null;
  const lower = address.toLowerCase();

  // Instant landmark fallback for Osasco, SP West & SP South/Central hubs
  if (lower.includes('gabrielle') || lower.includes('annunzio') || lower.includes('campo belo')) {
    return { lat: -23.6190, lon: -46.6740 };
  }
  if (lower.includes('prata') || lower.includes('cidade de deus') || lower.includes('bradesco')) {
    return { lat: -23.5358, lon: -46.7725 };
  }
  if (lower.includes('faria lima')) {
    return { lat: -23.5780, lon: -46.6890 };
  }
  if (lower.includes('berrini')) {
    return { lat: -23.6060, lon: -46.6960 };
  }
  if (lower.includes('paulista')) {
    return { lat: -23.5610, lon: -46.6560 };
  }
  if (lower.includes('itaim')) {
    return { lat: -23.5850, lon: -46.6780 };
  }
  if (lower.includes('pinheiros')) {
    return { lat: -23.5670, lon: -46.7010 };
  }
  if (lower.includes('olímpia') || lower.includes('olimpia')) {
    return { lat: -23.5950, lon: -46.6860 };
  }
  if (lower.includes('santo amaro')) {
    return { lat: -23.6300, lon: -46.7050 };
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
    const searchQuery = address.toLowerCase().includes('brasil') || address.toLowerCase().includes('brazil')
      ? address
      : `${address}, Brasil`;

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

// Helper to convert custom time string ("08:15") and day type ("weekday" vs "weekend") to Unix timestamp seconds for Google Maps Distance Matrix API
function getDepartureTimestampSeconds(timeStr?: string, dayType?: string): number {
  const now = new Date();
  if (!timeStr) return Math.floor(now.getTime() / 1000);

  const [hStr, mStr] = timeStr.split(':');
  const targetHour = parseInt(hStr || '8', 10);
  const targetMin = parseInt(mStr || '0', 10);

  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMin, 0);

  const isWeekendRequested = dayType === 'weekend';

  if (isWeekendRequested) {
    // Advance targetDate to Saturday if not already weekend
    while (targetDate.getDay() !== 6 && targetDate.getDay() !== 0) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  } else {
    // Weekday requested (Segunda a Sexta): Ensure targetDate is a weekday (Wednesday)
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    // Force target to a weekday (Monday-Friday) for real peak traffic
    while (targetDate.getDay() === 6 || targetDate.getDay() === 0) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  return Math.floor(targetDate.getTime() / 1000);
}

// Helper to call Google Maps Distance Matrix API for official Google Maps traffic & route duration
async function getGoogleDistanceMatrix(
  origin: string,
  destination: string,
  departureTime?: string,
  dayType?: string,
  apiKey?: string
): Promise<number | null> {
  const key = apiKey || process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !key.trim()) return null;

  try {
    const depTimeSec = getDepartureTimestampSeconds(departureTime, dayType);
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&departure_time=${depTimeSec}&traffic_model=best_guess&language=pt-BR&key=${key.trim()}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const element = json.rows?.[0]?.elements?.[0];
    if (element && element.status === 'OK') {
      const durationSec = element.duration_in_traffic?.value || element.duration?.value;
      if (durationSec) {
        return Math.max(3, Math.round(durationSec / 60));
      }
    }
  } catch (e) {
    console.warn('Google Distance Matrix API error:', e);
  }
  return null;
}

// Helper to calculate traffic factor based on departure time and day type
function getTrafficFactor(departureTime?: string, dayType?: string): number {
  const [hourStr, minStr] = (departureTime || '08:00').split(':');
  const hour = parseInt(hourStr || '8', 10);
  const min = parseInt(minStr || '0', 10);
  const timeInDecimal = hour + min / 60;

  // Weekend (Sábado / Domingo): Always smooth roads!
  if (dayType === 'weekend') {
    // Night (21:00 - 06:30) -> Empty roads (0.70x)
    if (timeInDecimal >= 21.0 || timeInDecimal < 6.5) {
      return 0.70;
    }
    // Weekend Daytime (06:30 - 21:00) -> Smooth traffic (0.80x)
    return 0.80;
  }

  // Weekday (Segunda a Sexta): Real peak & off-peak rush hour traffic curves!
  // Night / Midnight (21:30 - 06:00) -> Empty roads (0.70x)
  if (timeInDecimal >= 21.5 || timeInDecimal < 6.0) {
    return 0.70;
  }

  // Early Morning Rush Building (06:00 - 07:15) -> Building Traffic (1.35x)
  if (timeInDecimal >= 6.0 && timeInDecimal < 7.25) {
    return 1.35;
  }

  // Full Peak Morning Rush (07:15 - 09:30) -> Heavy Rush Hour Traffic (1.65x)
  if (timeInDecimal >= 7.25 && timeInDecimal <= 9.5) {
    return 1.65;
  }

  // Off-Peak Daytime (09:30 - 16:30) -> Moderate Traffic (1.10x)
  if (timeInDecimal > 9.5 && timeInDecimal < 16.5) {
    return 1.10;
  }

  // Evening Peak Rush (16:30 - 19:45) -> Heavy Evening Traffic (1.70x)
  if (timeInDecimal >= 16.5 && timeInDecimal <= 19.75) {
    return 1.70;
  }

  // Night Clearing (19:75 - 21:30) -> Light-Moderate (1.05x)
  return 1.05;
}

// Estimate transit/driving time in minutes for Greater SP area based on distance and departure time
function estimateCommuteMinutes(distanceKm: number, departureTime?: string, dayType?: string): number {
  const trafficFactor = getTrafficFactor(departureTime, dayType);
  let baseMinutes = distanceKm * 2.0;
  if (distanceKm <= 1) baseMinutes = 7;
  else if (distanceKm <= 3) baseMinutes = 11;
  else if (distanceKm <= 5) baseMinutes = 15;
  else if (distanceKm <= 10) baseMinutes = 22;
  else if (distanceKm <= 15) baseMinutes = 30;

  return Math.max(5, Math.round(baseMinutes * trafficFactor));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyAddress,
      saymonAddress1,
      saymonAddress2,
      saymonTime,
      saymonDay,
      kellyAddress1,
      kellyAddress2,
      kellyTime,
      kellyDay,
      saymonWork,
      kellyWork,
      googleApiKey,
    } = body;

    if (!propertyAddress) {
      return NextResponse.json({ success: false, error: 'Property address missing' }, { status: 400 });
    }

    const addrSaymon1 = saymonAddress1 || saymonWork || '';
    const addrSaymon2 = saymonAddress2 || '';
    const addrKelly1 = kellyAddress1 || kellyWork || '';
    const addrKelly2 = kellyAddress2 || '';

    // 1. Check Google Maps Distance Matrix API if key is available
    const activeGoogleKey = googleApiKey || process.env.GOOGLE_MAPS_API_KEY;
    if (activeGoogleKey) {
      let gSaymonMin: number | null = null;
      let gKellyMin: number | null = null;

      if (addrSaymon1) {
        gSaymonMin = await getGoogleDistanceMatrix(propertyAddress, addrSaymon1, saymonTime, saymonDay, activeGoogleKey);
      }
      if (addrKelly1) {
        gKellyMin = await getGoogleDistanceMatrix(propertyAddress, addrKelly1, kellyTime, kellyDay, activeGoogleKey);
      }

      if (gSaymonMin !== null || gKellyMin !== null) {
        const tempoSaymon = gSaymonMin ?? 25;
        const tempoKelly = gKellyMin ?? 30;
        return NextResponse.json({
          success: true,
          provider: 'google_maps_distance_matrix',
          tempoSaymonMinutos: tempoSaymon,
          tempoKellyMinutos: tempoKelly,
          mediaTempoMinutos: Math.round((tempoSaymon + tempoKelly) / 2),
        });
      }
    }

    const propCoords = await geocode(propertyAddress);

    const coordsSaymon1 = await geocode(addrSaymon1);
    const coordsSaymon2 = await geocode(addrSaymon2);
    const coordsKelly1 = await geocode(addrKelly1);
    const coordsKelly2 = await geocode(addrKelly2);

    let tempoSaymonMinutos = 25;
    let tempoKellyMinutos = 30;

    if (propCoords) {
      // Calculate best commute time for Saymon from up to 2 addresses with departure time and day
      const timesSaymon: number[] = [];
      if (coordsSaymon1) {
        timesSaymon.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsSaymon1), saymonTime, saymonDay));
      }
      if (coordsSaymon2) {
        timesSaymon.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsSaymon2), saymonTime, saymonDay));
      }
      if (timesSaymon.length > 0) {
        tempoSaymonMinutos = Math.min(...timesSaymon);
      }

      // Calculate best commute time for Kelly from up to 2 addresses with departure time and day
      const timesKelly: number[] = [];
      if (coordsKelly1) {
        timesKelly.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsKelly1), kellyTime, kellyDay));
      }
      if (coordsKelly2) {
        timesKelly.push(estimateCommuteMinutes(haversineDistance(propCoords, coordsKelly2), kellyTime, kellyDay));
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
