import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const TABLE = 'nosso_lar_imoveis';

// Endereços de interesse ainda vivem só em memória do servidor
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

function notConfigured() {
  return NextResponse.json(
    { success: false, error: 'Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).' },
    { status: 503 }
  );
}

export async function GET() {
  if (!supabase) return notConfigured();

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, data')
    .order('atualizado_em', { ascending: false });

  if (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const properties = (data || []).map((row: any) => row.data).filter(Boolean);
  return NextResponse.json({ success: true, properties, anchors: memoryAnchorsStore });
}

export async function POST(req: NextRequest) {
  try {
    const { properties, property, anchors } = await req.json();

    if (anchors) memoryAnchorsStore = anchors;

    const list: any[] = Array.isArray(properties) ? properties : property?.id ? [property] : [];
    if (list.length === 0) return NextResponse.json({ success: true, saved: 0 });
    if (!supabase) return notConfigured();

    const now = new Date().toISOString();
    const rows = list.map((p) => ({
      id: p.id,
      titulo: p.titulo || 'Sem título',
      url_anuncio: p.urlAnuncio || '',
      bairro: p.bairro || '',
      data: p,
      atualizado_em: now,
    }));

    const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Sync POST error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, saved: rows.length });
  } catch (error: any) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!supabase) return notConfigured();

  const { ids } = await req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 });
  }

  const { error } = await supabase.from(TABLE).delete().in('id', ids);
  if (error) {
    console.error('Sync DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}
