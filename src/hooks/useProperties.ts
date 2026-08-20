'use client';

import { useState, useMemo, useCallback } from 'react';
import { Property, PropertyFilters, PropertySortKey, PropertyStatus, CommuteAnchors } from '@/types/property';
import { INITIAL_PROPERTIES } from '@/lib/initialData';
import { useLocalStorage } from './useLocalStorage';
import { calculateTotals } from '@/lib/utils';
import { PropertyFormValues } from '@/lib/schemas';

const STORAGE_KEY = 'aluga_compare_couple_saymon_kelly_v7';

export function useProperties() {
  const [properties, setProperties, isLoaded] = useLocalStorage<Property[]>(
    STORAGE_KEY,
    INITIAL_PROPERTIES
  );

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
        values.areaUtil
      );

      const nSaymon = Number(values.notaSaymon || 4);
      const nKelly = Number(values.notaKelly || 4);
      const mediaCasal = Number(((nSaymon + nKelly) / 2).toFixed(1));

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
        vereditoSaymon: values.vereditoSaymon || 'Gostei',
        opiniaoSaymon: values.opiniaoSaymon?.trim() || undefined,

        notaKelly: nKelly,
        vereditoKelly: values.vereditoKelly || 'Gostei',
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

        notaSaymon: 4,
        vereditoSaymon: 'Gostei',
        notaKelly: 4,
        vereditoKelly: 'Gostei',
        mediaCasal: 4.0,
        notaPessoal: 4.0,

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
            values.areaUtil
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
            vereditoSaymon: values.vereditoSaymon,
            opiniaoSaymon: values.opiniaoSaymon?.trim() || undefined,

            notaKelly: nKelly,
            vereditoKelly: values.vereditoKelly,
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
      setProperties((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...updates };

          const { custoTotal, precoM2 } = calculateTotals(
            updated.valorAluguel,
            updated.valorCondominio,
            updated.valorIptu,
            updated.areaUtil
          );

          const media = Number(((updated.notaSaymon + updated.notaKelly) / 2).toFixed(1));

          return {
            ...updated,
            custoTotalMensal: custoTotal,
            precoMetroQuadrado: precoM2,
            mediaCasal: media,
            notaPessoal: media,
          };
        })
      );
    },
    [setProperties]
  );

  const recalculateCommuteTimes = useCallback(
    async (anchors: CommuteAnchors) => {
      const updatedList = await Promise.all(
        properties.map(async (p) => {
          try {
            const res = await fetch('/api/calculate-commute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                propertyAddress: `${p.bairro}, ${p.endereco || ''}`,
                saymonWork: anchors.saymonWork,
                kellyWork: anchors.kellyWork,
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
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = prop.titulo.toLowerCase().includes(query);
        const matchesBairro = prop.bairro.toLowerCase().includes(query);
        const matchesEndereco = prop.endereco?.toLowerCase().includes(query);
        const matchesSaymon = prop.opiniaoSaymon?.toLowerCase().includes(query);
        const matchesKelly = prop.opiniaoKelly?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBairro && !matchesEndereco && !matchesSaymon && !matchesKelly) {
          return false;
        }
      }

      if (filters.status !== 'todos' && prop.status !== filters.status) {
        return false;
      }

      if (filters.precoMax && prop.custoTotalMensal > filters.precoMax) {
        return false;
      }

      if (filters.dormitoriosMin && prop.dormitorios < filters.dormitoriosMin) {
        return false;
      }

      if (filters.vagasMin && prop.vagasGaragem < filters.vagasMin) {
        return false;
      }

      if (filters.apenasFavoritos && !prop.isFavorito) {
        return false;
      }

      if (filters.apenasMatchPerfeito && (prop.notaSaymon < 5 || prop.notaKelly < 5)) {
        return false;
      }

      if (filters.tempoMaxTrabalho && prop.tempoAteTrabalhoMinutos > filters.tempoMaxTrabalho) {
        return false;
      }

      if (filters.diferenciais.length > 0) {
        const hasAllTags = filters.diferenciais.every((tag) =>
          prop.diferenciais.includes(tag)
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
    resetToSampleData,
    kpis,
  };
}
