import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const cleanQuery = query.trim();
    const suggestions: any[] = [];
    const seenIds = new Set<string>();

    // 1. Try Photon Komoot API (Optimized for POIs like "Prédio Prata", "Bradesco", "Shopping", with SP location bias)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&lat=-23.5505&lon=-46.6333&limit=7&lang=pt`;
      const photonRes = await fetch(photonUrl, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
      });

      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData.features && Array.isArray(photonData.features)) {
          for (const feature of photonData.features) {
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];

            const name = props.name || '';
            const street = props.street || '';
            const houseNumber = props.housenumber ? `, ${props.housenumber}` : '';
            const district = props.district || props.suburb || props.locality || '';
            const city = props.city || props.town || props.state || '';
            const state = props.state ? ` - ${props.state}` : '';

            // Format clean title
            let mainText = name || street;
            if (street && name && street !== name) {
              mainText = `${name} (${street}${houseNumber})`;
            } else if (street && houseNumber) {
              mainText = `${street}${houseNumber}`;
            }

            const parts = [mainText, district, city].filter(Boolean);
            const fullLabel = parts.join(', ') + state;

            const key = `${props.osm_id || fullLabel}`;
            if (!seenIds.has(key) && fullLabel.length > 5) {
              seenIds.add(key);
              suggestions.push({
                id: key,
                displayName: fullLabel,
                shortTitle: mainText || fullLabel,
                lat: coords[1],
                lon: coords[0],
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Photon API query error:', e);
    }

    // 2. Secondary Fallback: OpenStreetMap Nominatim with São Paulo Bounding Box Bias
    try {
      const searchQ = cleanQuery.toLowerCase().includes('sp') || cleanQuery.toLowerCase().includes('osasco') || cleanQuery.toLowerCase().includes('são paulo')
        ? cleanQuery
        : `${cleanQuery}, São Paulo, Brasil`;

      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&addressdetails=1&limit=5&countrycodes=br&viewbox=-47.1,-23.9,-46.2,-23.2&bounded=0`;
      const nomRes = await fetch(nomUrl, {
        headers: {
          'User-Agent': 'NossoLarApp/1.0 (nosso-lar@sistemia.com.br)',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      });

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            const address = item.address || {};
            const road = address.road || address.pedestrian || address.suburb || item.display_name.split(',')[0];
            const houseNumber = address.house_number ? `, ${address.house_number}` : '';
            const suburb = address.suburb || address.neighbourhood || address.city_district || '';
            const city = address.city || address.town || address.municipality || 'São Paulo';
            const state = address.state || 'SP';

            const fullLabel = [road + houseNumber, suburb, city, state].filter(Boolean).join(', ');
            const key = `${item.place_id || fullLabel}`;

            if (!seenIds.has(key)) {
              seenIds.add(key);
              suggestions.push({
                id: key,
                displayName: item.display_name,
                shortTitle: fullLabel,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Nominatim API error:', e);
    }

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Geocode API Error:', error);
    return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
  }
}
