import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Memory fallback store if Supabase table is not yet created
let memoryPropertyStore: any[] | null = null;

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
        return NextResponse.json({ success: true, properties, source: 'supabase_imoveis' });
      }

      // 2. Se a tabela imoveis estiver vazia, verifica sugestões dos corretores
      const { data: sugData, error: sugErr } = await supabase
        .from('nosso_lar_sugestoes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!sugErr && sugData && sugData.length > 0) {
        const sugestoes = sugData.map((row: any) => ({
          id: row.id,
          titulo: row.titulo,
          urlAnuncio: row.url_anuncio || '',
          urlImagem: row.url_imagem || undefined,
          bairro: row.bairro || 'Osasco',
          endereco: row.endereco || undefined,
          valorAluguel: Number(row.valor_aluguel) || 0,
          valorCondominio: Number(row.valor_condominio) || 0,
          valorIptu: Number(row.valor_iptu) || 0,
          custoTotalMensal: (Number(row.valor_aluguel) || 0) + (Number(row.valor_condominio) || 0) + (Number(row.valor_iptu) || 0),
          dormitorios: Number(row.dormitorios) || 1,
          suites: Number(row.suites) || 0,
          banheiros: Number(row.banheiros) || 1,
          vagasGaragem: Number(row.vagas_garagem) || 0,
          areaUtil: Number(row.area_util) || 50,
          precoMetroQuadrado: 0,
          tempoAteTrabalhoMinutos: Number(row.tempo_trabalho_min) || 25,
          distanciaMetroKm: 1.5,
          diferenciais: Array.isArray(row.diferenciais) ? row.diferenciais : [],
          status: 'Para Analisar' as const,
          notaSaymon: 0,
          notaKelly: 0,
          mediaCasal: 0,
          notaPessoal: 0,
          observacoes: row.observacoes || undefined,
          duvidasCorretor: row.duvidas_corretor || undefined,
          isSugestao: true,
          nomeCorretor: row.nome_corretor || undefined,
          telefoneCorretor: row.telefone_corretor || undefined,
          dataCadastro: row.criado_em || new Date().toISOString(),
          isFavorito: false,
        }));

        return NextResponse.json({ success: true, properties: sugestoes, source: 'supabase_sugestoes' });
      }
    }

    if (memoryPropertyStore) {
      return NextResponse.json({ success: true, properties: memoryPropertyStore, source: 'memory' });
    }

    return NextResponse.json({ success: true, properties: [], source: 'none' });
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ success: true, properties: memoryPropertyStore || [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { properties, property } = body;

    let updatedList: any[] = [];

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

    return NextResponse.json({ success: true, properties: updatedList });
  } catch (error: any) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
