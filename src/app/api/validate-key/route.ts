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
    let providerName = 'Google Gemini ♊';

    if (cleanKey.startsWith('gsk_')) {
      provider = 'groq';
      providerName = 'Groq ⚡';
    } else if (cleanKey.startsWith('sk-')) {
      provider = 'openai';
      providerName = 'OpenAI 🤖';
    } else if (
      cleanKey.startsWith('AIzaSy') ||
      cleanKey.startsWith('AIza') ||
      cleanKey.startsWith('AQ.') ||
      cleanKey.startsWith('AQ') ||
      cleanKey.length === 39
    ) {
      provider = 'gemini';
      providerName = 'Google Gemini ♊';
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
          .filter(
            (m: any) =>
              m.supportedGenerationMethods?.includes('generateContent') &&
              !m.name.includes('embedding') &&
              !m.name.includes('aqa')
          )
          .map((m: any) => {
            const cleanId = m.name.replace('models/', '');
            return {
              id: cleanId,
              name: `Gemini — ${cleanId}`,
            };
          });
      }

      if (models.length === 0) {
        models = [
          { id: 'gemini-1.5-flash', name: 'Gemini — gemini-1.5-flash (Super Rápido)' },
          { id: 'gemini-1.5-pro', name: 'Gemini — gemini-1.5-pro (Raciocínio)' },
          { id: 'gemini-2.0-flash-exp', name: 'Gemini — gemini-2.0-flash-exp' },
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
        // Filter ONLY LLM text/chat models, exclude whisper, guardrails, compound
        models = data.data
          .filter((m: any) => {
            const id = (m.id || '').toLowerCase();
            return (
              (id.includes('llama') ||
                id.includes('mixtral') ||
                id.includes('gemma') ||
                id.includes('deepseek') ||
                id.includes('qwen')) &&
              !id.includes('whisper') &&
              !id.includes('guard') &&
              !id.includes('safeguard')
            );
          })
          .map((m: any) => ({
            id: m.id,
            name: `Groq — ${m.id}`,
          }));
      }

      if (models.length === 0) {
        models = [
          { id: 'llama-3.3-70b-versatile', name: 'Groq — llama-3.3-70b-versatile (Recomendado)' },
          { id: 'llama-3.1-8b-instant', name: 'Groq — llama-3.1-8b-instant (Ultra Rápido)' },
          { id: 'deepseek-r1-distill-llama-70b', name: 'Groq — deepseek-r1-distill-llama-70b' },
          { id: 'mixtral-8x7b-32768', name: 'Groq — mixtral-8x7b-32768' },
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
          .filter(
            (m: any) =>
              m.id.includes('gpt') &&
              !m.id.includes('instruct') &&
              !m.id.includes('realtime') &&
              !m.id.includes('audio')
          )
          .map((m: any) => ({
            id: m.id,
            name: `OpenAI — ${m.id}`,
          }));
      }

      if (models.length === 0) {
        models = [
          { id: 'gpt-4o-mini', name: 'OpenAI — gpt-4o-mini' },
          { id: 'gpt-4o', name: 'OpenAI — gpt-4o' },
          { id: 'gpt-3.5-turbo', name: 'OpenAI — gpt-3.5-turbo' },
        ];
      }
    }

    const latency = Date.now() - start;

    return NextResponse.json({
      success: true,
      provider,
      providerName,
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
