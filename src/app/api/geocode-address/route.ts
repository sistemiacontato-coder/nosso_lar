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

    // Special landmark matches for common Osasco/SP queries (e.g. Prédio Prata)
    const lowerQ = cleanQuery.toLowerCase();
    if (lowerQ.includes('prata') || lowerQ.includes('bradesco') || lowerQ.includes('cidade de deus')) {
      const predioPrataKey = 'loc-predio-prata-bradesco';
      seenIds.add(predioPrataKey);
      suggestions.push({
        id: predioPrataKey,
        displayName: 'Prédio Prata - Bradesco (Cidade de Deus), Osasco - SP, 06029-900, Brasil',
        shortTitle: 'Prédio Prata - Bradesco (Cidade de Deus, Osasco)',
        lat: -23.5358,
        lon: -46.7725,
      });
    }

    // 0. Primary: Official Google Maps Geocoding API (If GOOGLE_MAPS_API_KEY is configured)
    const googleKey = process.env.GOOGLE_MAPS_API_KEY || searchParams.get('googleKey');
    if (googleKey && googleKey.trim()) {
      try {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          cleanQuery
        )}&components=country:BR&language=pt-BR&key=${googleKey.trim()}`;

        const gRes = await fetch(gUrl);
        if (gRes.ok) {
          const gJson = await gRes.json();
          if (gJson.results && Array.isArray(gJson.results)) {
            for (const item of gJson.results.slice(0, 5)) {
              const key = `google-${item.place_id}`;
              if (!seenIds.has(key)) {
                seenIds.add(key);
                suggestions.push({
                  id: key,
                  displayName: item.formatted_address,
                  shortTitle: item.address_components?.[0]?.long_name || item.formatted_address,
                  lat: item.geometry?.location?.lat,
                  lon: item.geometry?.location?.lng,
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Google Maps Geocode API error:', e);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Primary: Gemini AI Location Resolver (Returns exact Google Maps Landmarks & POIs for Brazil/SP)
    if (apiKey) {
      try {
        const prompt = `Você é uma API do Google Maps para a região de Osasco e Grande São Paulo, Brasil. 
Dada a busca por endereço ou local "${cleanQuery}", retorne no máximo 5 locais reais e precisos do Google Maps (prédios conhecidos de empresas como Bradesco Cidade de Deus, shopping centers, avenidas, ruas e bairros em Osasco / São Paulo / Zona Oeste SP).

IMPORTANTE: 
- Se a busca for "Prédio Prata" ou similar, o usuário se refere ao Prédio Prata do Bradesco na Cidade de Deus, Osasco - SP.
- Priorize SEMPRE locais em Osasco e São Paulo Zona Oeste sobre cidades distantes do interior.

Responda EXCLUSIVAMENTE em formato JSON VÁLIDO sem markdown:
[
  {
    "id": "loc-1",
    "displayName": "Prédio Prata - Bradesco, Cidade de Deus, Osasco - SP, Brasil",
    "shortTitle": "Prédio Prata - Bradesco (Cidade de Deus, Osasco)",
    "lat": -23.5358,
    "lon": -46.7725
  }
]`;

        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const candidateText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleanJsonStr = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const items = JSON.parse(cleanJsonStr);
            if (Array.isArray(items)) {
              for (const item of items) {
                if (item.displayName && item.lat && item.lon) {
                  const key = `ai-${item.displayName}`;
                  if (!seenIds.has(key)) {
                    seenIds.add(key);
                    suggestions.push({
                      id: key,
                      displayName: item.displayName,
                      shortTitle: item.shortTitle || item.displayName,
                      lat: item.lat,
                      lon: item.lon,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('Gemini Geocode error:', e);
      }
    }

    // 2. Secondary: Photon Fuzzy Geocoder (Komoot OSM - Fast & Typo Tolerant)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=5&bbox=-47.3,-24.1,-46.1,-23.1`;
      const pRes = await fetch(photonUrl, {
        headers: { 'User-Agent': 'NossoLarApp/1.0' },
      });

      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData?.features && Array.isArray(pData.features)) {
          for (const feat of pData.features) {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [];
            const lon = coords[0];
            const lat = coords[1];

            if (lat && lon) {
              const street = props.name || props.street || cleanQuery;
              const houseNum = props.housenumber ? `, ${props.housenumber}` : '';
              const district = props.district || props.locality || props.suburb || '';
              const city = props.city || props.town || 'São Paulo';
              const state = props.state || 'SP';

              const shortTitle = [street + houseNum, district, city, state].filter(Boolean).join(', ');
              const fullDisplay = [street + houseNum, district, city, state, props.postcode, props.country].filter(Boolean).join(', ');
              const key = `photon-${props.osm_id || shortTitle}`;

              if (!seenIds.has(key)) {
                seenIds.add(key);
                suggestions.push({
                  id: key,
                  displayName: fullDisplay,
                  shortTitle: shortTitle,
                  lat: parseFloat(lat),
                  lon: parseFloat(lon),
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Photon API error:', e);
    }

    // 3. Fallback: OpenStreetMap Nominatim with clean query
    try {
      const searchQ = cleanQuery.toLowerCase().includes('sp') || cleanQuery.toLowerCase().includes('são paulo') || cleanQuery.toLowerCase().includes('osasco')
        ? cleanQuery
        : `${cleanQuery}, SP, Brasil`;

      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&addressdetails=1&limit=5&countrycodes=br&viewbox=-47.3,-24.1,-46.1,-23.1&bounded=0`;
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
            const key = `nom-${item.place_id || fullLabel}`;

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
