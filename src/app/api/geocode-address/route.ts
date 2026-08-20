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

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Primary: Gemini AI Location Resolver (Returns exact Google Maps Landmarks & POIs for Brazil/SP)
    if (apiKey) {
      try {
        const prompt = `Você é uma API do Google Maps para o Brasil. Dada a busca "${cleanQuery}", retorne no máximo 5 locais reais e precisos do Google Maps (ruas, avenidas, prédios conhecidos, bairros, pontos de interesse em São Paulo, Osasco ou Brasil).
Responda EXCLUSIVAMENTE em formato JSON VÁLIDO:
[
  {
    "id": "loc-1",
    "displayName": "Prédio Prata - Bradesco, Cidade de Deus, Osasco - SP, Brasil",
    "shortTitle": "Prédio Prata (Cidade de Deus, Osasco)",
    "lat": -23.5321,
    "lon": -46.7772
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

    // 2. Secondary: OpenStreetMap Nominatim with São Paulo Bounding Box Bias
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
