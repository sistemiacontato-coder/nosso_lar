import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();
    const cleanKey = (apiKey || '').trim();

    if (!cleanKey) {
      return NextResponse.json(
        { success: false, error: 'Chave API não informada.' },
        { status: 400 }
      );
    }

    // Auto-detect provider by prefix
    let provider = 'gemini';
    if (cleanKey.startsWith('gsk_')) {
      provider = 'groq';
    } else if (cleanKey.startsWith('sk-')) {
      provider = 'openai';
    } else if (
      cleanKey.startsWith('AIzaSy') ||
      cleanKey.startsWith('AIza') ||
      cleanKey.startsWith('AQ.') ||
      cleanKey.startsWith('AQ') ||
      cleanKey.length === 39
    ) {
      provider = 'gemini';
    }

    let models: { id: string; name: string }[] = [];
    const start = Date.now();

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Chave do Google Gemini inválida.');
      }

      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        models = data.models
          .filter((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent')
          )
          .map((m: any) => {
            const cleanId = m.name.replace('models/', '');
            return { id: cleanId, name: cleanId };
          });
      }

      if (models.length === 0) {
        models = [
          { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash' },
          { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro' },
          { id: 'gemini-2.0-flash-exp', name: 'gemini-2.0-flash-exp' },
        ];
      }
    } else if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${cleanKey}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Chave da Groq inválida.');
      }

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        models = data.data.map((m: any) => ({ id: m.id, name: m.id }));
      }

      if (models.length === 0) {
        models = [
          { id: 'llama-3.3-70b-versatile', name: 'llama-3.3-70b-versatile' },
          { id: 'llama-3.1-8b-instant', name: 'llama-3.1-8b-instant' },
          { id: 'deepseek-r1-distill-llama-70b', name: 'deepseek-r1-distill-llama-70b' },
          { id: 'mixtral-8x7b-32768', name: 'mixtral-8x7b-32768' },
        ];
      }
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${cleanKey}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Chave da OpenAI inválida.');
      }

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        models = data.data
          .filter((m: any) => m.id.includes('gpt'))
          .map((m: any) => ({ id: m.id, name: m.id }));
      }

      if (models.length === 0) {
        models = [
          { id: 'gpt-4o-mini', name: 'gpt-4o-mini' },
          { id: 'gpt-4o', name: 'gpt-4o' },
          { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo' },
        ];
      }
    }

    const latency = Date.now() - start;

    return NextResponse.json({
      success: true,
      provider,
      models,
      latency,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao validar a chave API.' },
      { status: 500 }
    );
  }
}
