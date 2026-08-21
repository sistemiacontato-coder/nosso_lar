import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Memory fallback store if Supabase table is not yet created
let memoryPropertyStore: any[] | null = null;
let memoryAnchorsStore: any = {
  saymonAddress1: "Rua Gabrielle D'Annunzio, 48, Campo Belo, São Paulo, SP",
  saymonAddress2: '',
  saymonTime: '08:00',
  saymonDay: 'weekday',
  kellyAddress1: 'Prédio Prata - Bradesco (Cidade de Deus), Osasco - SP',
  kellyAddress2: '',
  kellyTime: '08:00',
  kellyDay: 'weekday',
};

export async function GET() {
  try {
    if (supabase) {
      // 1. Tenta buscar da tabela principal public.nosso_lar_imoveis
      const { data, error } = await supabase
        .from('nosso_lar_imoveis')
        .select('*')
        .order('atualizado_em', { ascending: false });

      if (!error && data && data.length > 0) {
        const properties = data.map((row: any) => row.data || row);
        memoryPropertyStore = properties;
        return NextResponse.json({
          success: true,
          properties,
          anchors: memoryAnchorsStore,
          source: 'supabase_imoveis',
        });
      }
    }

    return NextResponse.json({
      success: true,
      properties: memoryPropertyStore || [],
      anchors: memoryAnchorsStore,
      source: memoryPropertyStore ? 'memory' : 'none',
    });
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json({
      success: true,
      properties: memoryPropertyStore || [],
      anchors: memoryAnchorsStore,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { properties, property, anchors } = body;

    let updatedList: any[] = [];

    if (anchors) {
      memoryAnchorsStore = anchors;
    }

    if (Array.isArray(properties)) {
      updatedList = properties;
    } else if (property && property.id) {
      if (memoryPropertyStore) {
        const index = memoryPropertyStore.findIndex((p) => p.id === property.id);
        if (index >= 0) {
          memoryPropertyStore[index] = property;
        } else {
          memoryPropertyStore.unshift(property);
        }
        updatedList = memoryPropertyStore;
      } else {
        updatedList = [property];
      }
    } else if (memoryPropertyStore) {
      updatedList = memoryPropertyStore;
    }

    memoryPropertyStore = updatedList;

    if (supabase && updatedList.length > 0) {
      try {
        const rows = updatedList.map((p) => ({
          id: p.id,
          data: p,
          atualizado_em: new Date().toISOString(),
        }));

        await supabase.from('nosso_lar_imoveis').upsert(rows, { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase DB upsert warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      properties: updatedList,
      anchors: memoryAnchorsStore,
    });
  } catch (error: any) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
