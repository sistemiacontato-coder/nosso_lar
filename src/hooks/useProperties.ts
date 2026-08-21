'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Property, PropertyFilters, PropertySortKey, PropertyStatus, CommuteAnchors } from '@/types/property';
import { INITIAL_PROPERTIES } from '@/lib/initialData';
import { useLocalStorage } from './useLocalStorage';
import { calculateTotals } from '@/lib/utils';
import { PropertyFormValues } from '@/lib/schemas';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'aluga_compare_couple_saymon_kelly_v9';

export function useProperties() {
  const [properties, setProperties, isLoaded] = useLocalStorage<Property[]>(
    STORAGE_KEY,
    INITIAL_PROPERTIES
  );

  // Busca sincronização em nuvem ao carregar a página
  useEffect(() => {
    fetch('/api/sync-properties')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          if (Array.isArray(json.properties) && json.properties.length > 0) {
            setProperties((prev) => {
              const map = new Map<string, Property>();
              json.properties.forEach((p: Property) => map.set(p.id, p));
              prev.forEach((p: Property) => {
                if (!map.has(p.id)) map.set(p.id, p);
              });
              return Array.from(map.values());
            });
          }
          if (json.anchors) {
            try {
              localStorage.setItem('nosso_lar_commute_anchors_v3', JSON.stringify(json.anchors));
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  }, [setProperties]);

  // ─── Supabase Realtime: Sincronia de alterções ao vivo entre Saymon e Kelly ───
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Ouve alterações e votos ao vivo do casal (Saymon & Kelly)
    const coupleChannel = supabase
      .channel('nosso_lar_couple_live_channel')
      .on('broadcast', { event: 'property_updated' }, (payload: any) => {
        const updatedProp: Property = payload.payload;
        if (!updatedProp?.id) return;
        setProperties((prev) =>
          prev.map((p) => (p.id === updatedProp.id ? { ...p, ...updatedProp } : p))
        );
      })
      .on('broadcast', { event: 'property_added' }, (payload: any) => {
        const newProp: Property = payload.payload;
        if (!newProp?.id) return;
        setProperties((prev) => {
          if (prev.some((p) => p.id === newProp.id)) return prev;
          return [newProp, ...prev];
        });
      })
      .on('broadcast', { event: 'property_deleted' }, (payload: any) => {
        const id = payload.payload?.id;
        if (!id) return;
        setProperties((prev) => prev.filter((p) => p.id !== id));
      })
      .on('broadcast', { event: 'anchors_updated' }, (payload: any) => {
        const anchors = payload.payload;
        if (!anchors) return;
        try {
          localStorage.setItem('nosso_lar_commute_anchors_v3', JSON.stringify(anchors));
        } catch (e) {}
      })
      .subscribe();

    // 2. Ouve sugestões dos corretores
    const sugestoesChannel = supabase
      .channel('nosso_lar_sugestoes_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nosso_lar_sugestoes' },
        (payload: any) => {
          const row = payload.new;
          const novasugestao: Property = {
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
          };

          setProperties((prev) => {
            if (prev.find((p) => p.id === row.id)) return prev;
            return [novasugestao, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(coupleChannel);
      supabase?.removeChannel(sugestoesChannel);
    };
  }, [setProperties]);

  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    status: 'todos',
    precoMax: undefined,
    dormitoriosMin: undefined,
    vagasMin: undefined,
    diferenciais: [],
    apenasFavoritos: false,
    apenasMatchPerfeito: false,
    tempoMaxTrabalho: undefined,
  });

  const [sortKey, setSortKey] = useState<PropertySortKey>('mediaCasal_desc');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Actions
  const addProperty = useCallback(
    (values: PropertyFormValues) => {
      const { custoTotal, precoM2 } = calculateTotals(
        values.valorAluguel,
        values.valorCondominio,
        values.valorIptu,
        values.areaUtil,
        values.valorSeguroIncendio
      );

      const nSaymon = Number(values.notaSaymon || 0);
      const nKelly = Number(values.notaKelly || 0);
      const mediaCasal = (nSaymon > 0 && nKelly > 0) ? Number(((nSaymon + nKelly) / 2).toFixed(1)) : 0;

      const newProperty: Property = {
        id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        titulo: values.titulo.trim(),
        urlAnuncio: values.urlAnuncio.trim(),
        urlImagem: values.urlImagem?.trim() || undefined,
        bairro: values.bairro.trim(),
        endereco: values.endereco?.trim() || undefined,
        valorAluguel: Number(values.valorAluguel),
        valorCondominio: Number(values.valorCondominio || 0),
        valorIptu: Number(values.valorIptu || 0),
        valorSeguroIncendio: Number(values.valorSeguroIncendio || 0),
        custoTotalMensal: custoTotal,
        dormitorios: Number(values.dormitorios),
        suites: Number(values.suites || 0),
        banheiros: Number(values.banheiros),
        vagasGaragem: Number(values.vagasGaragem || 0),
        areaUtil: Number(values.areaUtil),
        precoMetroQuadrado: precoM2,
        tempoAteTrabalhoMinutos: Number(values.tempoAteTrabalhoMinutos || 25),
        distanciaMetroKm: Number(values.distanciaMetroKm || 1.5),
        diferenciais: values.diferenciais || [],
        status: values.status || 'Para Analisar',

        notaSaymon: nSaymon,
        vereditoSaymon: values.vereditoSaymon || undefined,
        opiniaoSaymon: values.opiniaoSaymon?.trim() || undefined,

        notaKelly: nKelly,
        vereditoKelly: values.vereditoKelly || undefined,
        opiniaoKelly: values.opiniaoKelly?.trim() || undefined,

        mediaCasal: mediaCasal,
        notaPessoal: mediaCasal,

        observacoes: values.observacoes?.trim() || undefined,
        duvidasCorretor: values.duvidasCorretor?.trim() || undefined,
        isSugestao: false,
        dataCadastro: new Date().toISOString(),
        isFavorito: false,
      };

      setProperties((prev) => [newProperty, ...prev]);
    },
    [setProperties]
  );

  // Add Realtor Suggestion
  const addRealtorSuggestion = useCallback(
    (values: PropertyFormValues, nomeCorretor: string, telefoneCorretor: string) => {
      const { custoTotal, precoM2 } = calculateTotals(
        values.valorAluguel,
        values.valorCondominio,
        values.valorIptu,
        values.areaUtil
      );

      const newProperty: Property = {
        id: `sugestao-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        titulo: values.titulo.trim(),
        urlAnuncio: values.urlAnuncio.trim(),
        urlImagem: values.urlImagem?.trim() || undefined,
        bairro: values.bairro.trim(),
        endereco: values.endereco?.trim() || undefined,
        valorAluguel: Number(values.valorAluguel),
        valorCondominio: Number(values.valorCondominio || 0),
        valorIptu: Number(values.valorIptu || 0),
        custoTotalMensal: custoTotal,
        dormitorios: Number(values.dormitorios),
        suites: Number(values.suites || 0),
        banheiros: Number(values.banheiros),
        vagasGaragem: Number(values.vagasGaragem || 0),
        areaUtil: Number(values.areaUtil),
        precoMetroQuadrado: precoM2,
        tempoAteTrabalhoMinutos: Number(values.tempoAteTrabalhoMinutos || 25),
        distanciaMetroKm: Number(values.distanciaMetroKm || 1.5),
        diferenciais: values.diferenciais || [],
        status: 'Para Analisar',

        notaSaymon: 0,
        vereditoSaymon: undefined,
        notaKelly: 0,
        vereditoKelly: undefined,
        mediaCasal: 0,
        notaPessoal: 0,

        observacoes: values.observacoes?.trim() || undefined,
        duvidasCorretor: values.duvidasCorretor?.trim() || undefined,
        isSugestao: true,
        nomeCorretor: nomeCorretor.trim(),
        telefoneCorretor: telefoneCorretor.trim(),
        dataCadastro: new Date().toISOString(),
        isFavorito: false,
      };

      setProperties((prev) => [newProperty, ...prev]);
    },
    [setProperties]
  );

  // Approve suggestion
  const approveSuggestion = useCallback(
    (id: string) => {
      setProperties((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isSugestao: false } : item
        )
      );
    },
    [setProperties]
  );

  const updateProperty = useCallback(
    (id: string, values: PropertyFormValues) => {
      setProperties((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          const { custoTotal, precoM2 } = calculateTotals(
            values.valorAluguel,
            values.valorCondominio,
            values.valorIptu,
            values.areaUtil,
            values.valorSeguroIncendio
          );

          const nSaymon = Number(values.notaSaymon || item.notaSaymon);
          const nKelly = Number(values.notaKelly || item.notaKelly);
          const mediaCasal = Number(((nSaymon + nKelly) / 2).toFixed(1));

          return {
            ...item,
            titulo: values.titulo.trim(),
            urlAnuncio: values.urlAnuncio.trim(),
            urlImagem: values.urlImagem?.trim() || undefined,
            bairro: values.bairro.trim(),
            endereco: values.endereco?.trim() || undefined,
            valorAluguel: Number(values.valorAluguel),
            valorCondominio: Number(values.valorCondominio || 0),
            valorIptu: Number(values.valorIptu || 0),
            valorSeguroIncendio: Number(values.valorSeguroIncendio || 0),
            custoTotalMensal: custoTotal,
            dormitorios: Number(values.dormitorios),
            suites: Number(values.suites || 0),
            banheiros: Number(values.banheiros),
            vagasGaragem: Number(values.vagasGaragem || 0),
            areaUtil: Number(values.areaUtil),
            precoMetroQuadrado: precoM2,
            tempoAteTrabalhoMinutos: Number(values.tempoAteTrabalhoMinutos),
            distanciaMetroKm: Number(values.distanciaMetroKm),
            diferenciais: values.diferenciais || [],
            status: values.status,

            notaSaymon: nSaymon,
            vereditoSaymon: values.vereditoSaymon ? (values.vereditoSaymon as any) : undefined,
            opiniaoSaymon: values.opiniaoSaymon?.trim() || undefined,

            notaKelly: nKelly,
            vereditoKelly: values.vereditoKelly ? (values.vereditoKelly as any) : undefined,
            opiniaoKelly: values.opiniaoKelly?.trim() || undefined,

            mediaCasal: mediaCasal,
            notaPessoal: mediaCasal,

            observacoes: values.observacoes?.trim() || undefined,
            duvidasCorretor: values.duvidasCorretor?.trim() || undefined,
          };
        })
      );
    },
    [setProperties]
  );

  const quickUpdateProperty = useCallback(
    (id: string, updates: Partial<Property>) => {
      let finalUpdated: Property | null = null;

      setProperties((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...updates };

          const { custoTotal, precoM2 } = calculateTotals(
            updated.valorAluguel,
            updated.valorCondominio,
            updated.valorIptu,
            updated.areaUtil,
            updated.valorSeguroIncendio
          );

          const nSaymon = Number(updated.notaSaymon || 0);
          const nKelly = Number(updated.notaKelly || 0);
          const media = (nSaymon > 0 && nKelly > 0) ? Number(((nSaymon + nKelly) / 2).toFixed(1)) : (nSaymon || nKelly || 0);

          finalUpdated = {
            ...updated,
            custoTotalMensal: custoTotal,
            precoMetroQuadrado: precoM2,
            mediaCasal: media,
            notaPessoal: media,
          };

          return finalUpdated;
        })
      );

      if (isSupabaseConfigured && supabase && finalUpdated) {
        supabase.channel('nosso_lar_couple_live_channel').send({
          type: 'broadcast',
          event: 'property_updated',
          payload: finalUpdated,
        }).catch(() => {});
      }

      if (finalUpdated) {
        fetch('/api/sync-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property: finalUpdated }),
        }).catch(() => {});
      }
    },
    [setProperties]
  );

  const [isRecalculatingCommute, setIsRecalculatingCommute] = useState(false);

  const recalculateCommuteTimes = useCallback(
    async (anchors: CommuteAnchors) => {
      setIsRecalculatingCommute(true);
      try {
        const updatedList = await Promise.all(
          properties.map(async (p) => {
            try {
              const googleApiKey = typeof window !== 'undefined' ? localStorage.getItem('nosso_lar_google_maps_key') || undefined : undefined;
              const res = await fetch('/api/calculate-commute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  propertyAddress: `${p.bairro}, ${p.endereco || ''}`,
                  saymonAddress1: anchors.saymonAddress1 || anchors.saymonWork,
                  saymonTime: anchors.saymonTime,
                  saymonDay: anchors.saymonDay,
                  kellyAddress1: anchors.kellyAddress1 || anchors.kellyWork,
                  kellyTime: anchors.kellyTime,
                  kellyDay: anchors.kellyDay,
                  googleApiKey,
                }),
              });
              const json = await res.json();
              if (json.success) {
                return {
                  ...p,
                  tempoSaymonMinutos: json.tempoSaymonMinutos,
                  tempoKellyMinutos: json.tempoKellyMinutos,
                  tempoAteTrabalhoMinutos: json.mediaTempoMinutos,
                };
              }
            } catch (e) {}
            return p;
          })
        );
        setProperties(updatedList);

        fetch('/api/sync-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties: updatedList }),
        }).catch(() => {});

        if (isSupabaseConfigured && supabase) {
          supabase.channel('nosso_lar_couple_live_channel').send({
            type: 'broadcast',
            event: 'properties_synced',
            payload: updatedList,
          }).catch(() => {});
        }
      } finally {
        setIsRecalculatingCommute(false);
      }
    },
    [properties, setProperties]
  );

  const [isReExtractingFinancials, setIsReExtractingFinancials] = useState(false);

  const reExtractAllPropertiesFinancials = useCallback(async () => {
    setIsReExtractingFinancials(true);
    try {
      const updatedList = await Promise.all(
        properties.map(async (p) => {
          if (!p.urlAnuncio || !p.urlAnuncio.trim()) return p;
          try {
            const res = await fetch('/api/extract-property', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: p.urlAnuncio.trim() }),
            });
            const json = await res.json();
            const data = json.data || json.extracted;
            if (json.success && data) {
              const novoAluguel = data.valorAluguel || p.valorAluguel;
              const novoCondo = data.valorCondominio !== undefined ? data.valorCondominio : p.valorCondominio;
              const novoIptu = data.valorIptu !== undefined ? data.valorIptu : p.valorIptu;
              const { custoTotal, precoM2 } = calculateTotals(
                novoAluguel,
                novoCondo,
                novoIptu,
                p.areaUtil || data.areaUtil || 50
              );
              return {
                ...p,
                titulo: data.titulo || p.titulo,
                urlImagem: data.urlImagem || p.urlImagem,
                bairro: data.bairro || p.bairro,
                valorAluguel: novoAluguel,
                valorCondominio: novoCondo,
                valorIptu: novoIptu,
                custoTotalMensal: custoTotal,
                precoMetroQuadrado: precoM2,
                dormitorios: data.dormitorios || p.dormitorios,
                vagasGaragem: data.vagasGaragem !== undefined ? data.vagasGaragem : p.vagasGaragem,
                areaUtil: data.areaUtil || p.areaUtil,
              };
            }
          } catch (e) {}
          return p;
        })
      );
      setProperties(updatedList);
    } finally {
      setIsReExtractingFinancials(false);
    }
  }, [properties, setProperties]);

  const reExtractSinglePropertyFinancials = useCallback(
    async (id: string) => {
      const target = properties.find((p) => p.id === id);
      if (!target || !target.urlAnuncio) return;
      try {
        const res = await fetch('/api/extract-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: target.urlAnuncio.trim() }),
        });
        const json = await res.json();
        const data = json.data || json.extracted;
        if (json.success && data) {
          setProperties((prev) =>
            prev.map((p) => {
              if (p.id !== id) return p;
              const novoAluguel = data.valorAluguel || p.valorAluguel;
              const novoCondo = data.valorCondominio !== undefined ? data.valorCondominio : p.valorCondominio;
              const novoIptu = data.valorIptu !== undefined ? data.valorIptu : p.valorIptu;
              const { custoTotal, precoM2 } = calculateTotals(
                novoAluguel,
                novoCondo,
                novoIptu,
                p.areaUtil || data.areaUtil || 50
              );
              return {
                ...p,
                titulo: data.titulo || p.titulo,
                urlImagem: data.urlImagem || p.urlImagem,
                bairro: data.bairro || p.bairro,
                valorAluguel: novoAluguel,
                valorCondominio: novoCondo,
                valorIptu: novoIptu,
                custoTotalMensal: custoTotal,
                precoMetroQuadrado: precoM2,
                dormitorios: data.dormitorios || p.dormitorios,
                vagasGaragem: data.vagasGaragem !== undefined ? data.vagasGaragem : p.vagasGaragem,
                areaUtil: data.areaUtil || p.areaUtil,
              };
            })
          );
        }
      } catch (e) {}
    },
    [properties, setProperties]
  );

  const deleteProperty = useCallback(
    (id: string) => {
      setProperties((prev) => prev.filter((item) => item.id !== id));
      setSelectedForComparison((prev) => prev.filter((item) => item !== id));
    },
    [setProperties]
  );

  const duplicateProperty = useCallback(
    (id: string) => {
      const target = properties.find((p) => p.id === id);
      if (!target) return;

      const clone: Property = {
        ...target,
        id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        titulo: `${target.titulo} (Cópia)`,
        dataCadastro: new Date().toISOString(),
      };

      setProperties((prev) => [clone, ...prev]);
    },
    [properties, setProperties]
  );

  const updateStatus = useCallback(
    (id: string, status: PropertyStatus) => {
      setProperties((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    },
    [setProperties]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setProperties((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFavorito: !item.isFavorito } : item
        )
      );
    },
    [setProperties]
  );

  const toggleArchiveProperty = useCallback(
    (id: string) => {
      setProperties((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isArquivado: !item.isArquivado } : item
        )
      );
    },
    [setProperties]
  );

  const toggleComparison = useCallback((id: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        alert('Você só pode comparar até 4 imóveis simultaneamente.');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedForComparison([]);
  }, []);

  const resetToSampleData = useCallback(() => {
    setProperties(INITIAL_PROPERTIES);
    setSelectedForComparison([]);
  }, [setProperties]);

  // Main properties vs Realtor suggestions
  const nossosImoveis = useMemo(() => properties.filter((p) => !p.isSugestao), [properties]);
  const sugestoesCorretores = useMemo(() => properties.filter((p) => p.isSugestao), [properties]);

  // Filtering for Nossos Imóveis
  const filteredProperties = useMemo(() => {
    return nossosImoveis.filter((prop) => {
      // 1. Search Query
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = prop.titulo?.toLowerCase().includes(query);
        const matchesBairro = prop.bairro?.toLowerCase().includes(query);
        const matchesEndereco = prop.endereco?.toLowerCase().includes(query);
        const matchesSaymon = prop.opiniaoSaymon?.toLowerCase().includes(query);
        const matchesKelly = prop.opiniaoKelly?.toLowerCase().includes(query);
        const matchesObs = prop.observacoes?.toLowerCase().includes(query);
        const matchesCorretor = prop.nomeCorretor?.toLowerCase().includes(query);
        const matchesDiferenciais = (prop.diferenciais || []).some((d) => d.toLowerCase().includes(query));

        if (
          !matchesTitle &&
          !matchesBairro &&
          !matchesEndereco &&
          !matchesSaymon &&
          !matchesKelly &&
          !matchesObs &&
          !matchesCorretor &&
          !matchesDiferenciais
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status && filters.status !== 'todos' && prop.status !== filters.status) {
        return false;
      }

      // 3. Preço Máximo (Custo Total Mensal = Aluguel + Condomínio + IPTU)
      if (filters.precoMax && prop.custoTotalMensal > filters.precoMax) {
        return false;
      }

      // 4. Mínimo de Dormitórios
      if (filters.dormitoriosMin && prop.dormitorios < filters.dormitoriosMin) {
        return false;
      }

      // 5. Mínimo de Vagas
      if (filters.vagasMin && prop.vagasGaragem < filters.vagasMin) {
        return false;
      }

      // 6. Apenas Favoritos
      if (filters.apenasFavoritos && !prop.isFavorito) {
        return false;
      }

      // 7. Match Perfeito (Avaliação de Saymon >= 4 e Kelly >= 4 ou Aprovados)
      if (filters.apenasMatchPerfeito) {
        const saymonOk = (prop.notaSaymon && prop.notaSaymon >= 4) || prop.vereditoSaymon === 'Aprovado';
        const kellyOk = (prop.notaKelly && prop.notaKelly >= 4) || prop.vereditoKelly === 'Aprovada';
        if (!saymonOk || !kellyOk) return false;
      }

      // 8. Tempo Máximo de Deslocamento
      if (filters.tempoMaxTrabalho) {
        const avgCommute =
          prop.tempoSaymonMinutos && prop.tempoKellyMinutos
            ? (prop.tempoSaymonMinutos + prop.tempoKellyMinutos) / 2
            : prop.tempoAteTrabalhoMinutos || 0;

        if (avgCommute > filters.tempoMaxTrabalho) return false;
      }

      // 9. Diferenciais Selecionados
      if (filters.diferenciais && filters.diferenciais.length > 0) {
        const propTagsLower = (prop.diferenciais || []).map((t) => t.toLowerCase());
        const hasAllTags = filters.diferenciais.every((tag) =>
          propTagsLower.some((pt) => pt.includes(tag.toLowerCase()) || tag.toLowerCase().includes(pt))
        );
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [nossosImoveis, filters]);

  // Sorting
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    list.sort((a, b) => {
      switch (sortKey) {
        case 'mediaCasal_desc':
          return b.mediaCasal - a.mediaCasal;
        case 'notaSaymon_desc':
          return b.notaSaymon - a.notaSaymon;
        case 'notaKelly_desc':
          return b.notaKelly - a.notaKelly;
        case 'precoTotal_asc':
          return a.custoTotalMensal - b.custoTotalMensal;
        case 'precoTotal_desc':
          return b.custoTotalMensal - a.custoTotalMensal;
        case 'precoM2_asc':
          return a.precoMetroQuadrado - b.precoMetroQuadrado;
        case 'tempoTrabalho_asc':
          return a.tempoAteTrabalhoMinutos - b.tempoAteTrabalhoMinutos;
        case 'tempoSaymon_asc':
          return (a.tempoSaymonMinutos ?? a.tempoAteTrabalhoMinutos) - (b.tempoSaymonMinutos ?? b.tempoAteTrabalhoMinutos);
        case 'tempoKelly_asc':
          return (a.tempoKellyMinutos ?? a.tempoAteTrabalhoMinutos) - (b.tempoKellyMinutos ?? b.tempoAteTrabalhoMinutos);
        case 'mediaTempo_asc': {
          const aAvg = ((a.tempoSaymonMinutos ?? a.tempoAteTrabalhoMinutos) + (a.tempoKellyMinutos ?? a.tempoAteTrabalhoMinutos)) / 2;
          const bAvg = ((b.tempoSaymonMinutos ?? b.tempoAteTrabalhoMinutos) + (b.tempoKellyMinutos ?? b.tempoAteTrabalhoMinutos)) / 2;
          return aAvg - bAvg;
        }
        case 'area_desc':
          return b.areaUtil - a.areaUtil;
        case 'recente_desc':
        default:
          return new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime();
      }
    });
    return list;
  }, [filteredProperties, sortKey]);

  const comparisonProperties = useMemo(() => {
    return properties.filter((p) => selectedForComparison.includes(p.id));
  }, [properties, selectedForComparison]);

  const kpis = useMemo(() => {
    if (nossosImoveis.length === 0) {
      return {
        total: 0,
        mediaCusto: 0,
        menorCustoTotal: null,
        maisPertoTrabalho: null,
        topCasalMatch: null,
        favoritoSaymon: null,
        favoritaKelly: null,
      };
    }

    const total = nossosImoveis.length;
    const somaPreco = nossosImoveis.reduce((acc, p) => acc + p.custoTotalMensal, 0);
    const mediaCusto = Math.round(somaPreco / total);

    const sortedByPrice = [...nossosImoveis].sort((a, b) => a.custoTotalMensal - b.custoTotalMensal);
    const menorCustoTotal = sortedByPrice[0] || null;

    const sortedByCommute = [...nossosImoveis].sort((a, b) => a.tempoAteTrabalhoMinutos - b.tempoAteTrabalhoMinutos);
    const maisPertoTrabalho = sortedByCommute[0] || null;

    const sortedByMatch = [...nossosImoveis].sort((a, b) => b.mediaCasal - a.mediaCasal);
    const topCasalMatch = sortedByMatch[0] || null;

    const sortedBySaymon = [...nossosImoveis].sort((a, b) => b.notaSaymon - a.notaSaymon);
    const favoritoSaymon = sortedBySaymon[0] || null;

    const sortedByKelly = [...nossosImoveis].sort((a, b) => b.notaKelly - a.notaKelly);
    const favoritaKelly = sortedByKelly[0] || null;

    return {
      total,
      mediaCusto,
      menorCustoTotal,
      maisPertoTrabalho,
      topCasalMatch,
      favoritoSaymon,
      favoritaKelly,
    };
  }, [nossosImoveis]);

  const clearAllRatingsAndStatus = useCallback(() => {
    setProperties((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'Para Analisar' as PropertyStatus,
        notaSaymon: 0,
        vereditoSaymon: undefined,
        opiniaoSaymon: undefined,
        notaKelly: 0,
        vereditoKelly: undefined,
        opiniaoKelly: undefined,
        mediaCasal: 0,
        notaPessoal: 0,
      }))
    );
  }, [setProperties]);

  return {
    properties,
    nossosImoveis,
    sugestoesCorretores,
    filteredProperties: sortedProperties,
    totalCount: nossosImoveis.length,
    filteredCount: sortedProperties.length,
    sugestoesCount: sugestoesCorretores.length,
    isLoaded,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    selectedForComparison,
    comparisonProperties,
    toggleComparison,
    clearComparison,
    addProperty,
    addRealtorSuggestion,
    approveSuggestion,
    updateProperty,
    quickUpdateProperty,
    deleteProperty,
    duplicateProperty,
    updateStatus,
    toggleFavorite,
    toggleArchiveProperty,
    recalculateCommuteTimes,
    isRecalculatingCommute,
    resetToSampleData,
    clearAllRatingsAndStatus,
    kpis,
  };
}
