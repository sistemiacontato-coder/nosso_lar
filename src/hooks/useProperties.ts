'use client';

import { useState, useMemo, useCallback } from 'react';
import { Property, PropertyFilters, PropertySortKey, PropertyStatus } from '@/types/property';
import { INITIAL_PROPERTIES } from '@/lib/initialData';
import { useLocalStorage } from './useLocalStorage';
import { calculateTotals } from '@/lib/utils';
import { PropertyFormValues } from '@/lib/schemas';

const STORAGE_KEY = 'aluga_compare_couple_saymon_kelly_v5';

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
        precoMetroQuadrado: Number(precoM2.toFixed(1)),
        tempoAteTrabalhoMinutos: Number(values.tempoAteTrabalhoMinutos || 0),
        distanciaMetroKm: Number(values.distanciaMetroKm || 0),
        diferenciais: values.diferenciais || [],
        status: values.status || 'Em Análise',

        // Saymon & Kelly
        notaSaymon: nSaymon,
        vereditoSaymon: values.vereditoSaymon || 'Gostei',
        opiniaoSaymon: values.opiniaoSaymon?.trim() || '',

        notaKelly: nKelly,
        vereditoKelly: values.vereditoKelly || 'Gostei',
        opiniaoKelly: values.opiniaoKelly?.trim() || '',

        mediaCasal,
        notaPessoal: mediaCasal,

        observacoes: values.observacoes?.trim() || '',
        dataCadastro: new Date().toISOString(),
        isFavorito: values.status === 'Favorito' || (nSaymon >= 5 && nKelly >= 5),
      };

      setProperties((prev) => [newProperty, ...prev]);
      return newProperty;
    },
    [setProperties]
  );

  const updateProperty = useCallback(
    (id: string, values: PropertyFormValues) => {
      const { custoTotal, precoM2 } = calculateTotals(
        values.valorAluguel,
        values.valorCondominio,
        values.valorIptu,
        values.areaUtil
      );

      const nSaymon = Number(values.notaSaymon || 4);
      const nKelly = Number(values.notaKelly || 4);
      const mediaCasal = Number(((nSaymon + nKelly) / 2).toFixed(1));

      setProperties((prev) =>
        prev.map((prop) => {
          if (prop.id !== id) return prop;
          return {
            ...prop,
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
            precoMetroQuadrado: Number(precoM2.toFixed(1)),
            tempoAteTrabalhoMinutos: Number(values.tempoAteTrabalhoMinutos || 0),
            distanciaMetroKm: Number(values.distanciaMetroKm || 0),
            diferenciais: values.diferenciais || [],
            status: values.status,

            // Saymon & Kelly
            notaSaymon: nSaymon,
            vereditoSaymon: values.vereditoSaymon,
            opiniaoSaymon: values.opiniaoSaymon?.trim() || '',

            notaKelly: nKelly,
            vereditoKelly: values.vereditoKelly,
            opiniaoKelly: values.opiniaoKelly?.trim() || '',

            mediaCasal,
            notaPessoal: mediaCasal,

            observacoes: values.observacoes?.trim() || '',
            isFavorito: values.status === 'Favorito' ? true : prop.isFavorito,
          };
        })
      );
    },
    [setProperties]
  );

  const deleteProperty = useCallback(
    (id: string) => {
      setProperties((prev) => prev.filter((prop) => prop.id !== id));
      setSelectedForComparison((prev) => prev.filter((item) => item !== id));
    },
    [setProperties]
  );

  const duplicateProperty = useCallback(
    (id: string) => {
      const source = properties.find((p) => p.id === id);
      if (!source) return;
      const clone: Property = {
        ...source,
        id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        titulo: `${source.titulo} (Cópia)`,
        dataCadastro: new Date().toISOString(),
      };
      setProperties((prev) => [clone, ...prev]);
    },
    [properties, setProperties]
  );

  const quickUpdateProperty = useCallback(
    (id: string, updates: Partial<Property>) => {
      setProperties((prev) =>
        prev.map((prop) => {
          if (prop.id !== id) return prop;
          const merged = { ...prop, ...updates };
          if (updates.valorAluguel !== undefined || updates.valorCondominio !== undefined || updates.valorIptu !== undefined || updates.areaUtil !== undefined) {
            const { custoTotal, precoM2 } = calculateTotals(
              merged.valorAluguel,
              merged.valorCondominio,
              merged.valorIptu,
              merged.areaUtil
            );
            merged.custoTotalMensal = custoTotal;
            merged.precoMetroQuadrado = Number(precoM2.toFixed(1));
          }
          if (updates.notaSaymon !== undefined || updates.notaKelly !== undefined) {
            merged.mediaCasal = Number(((merged.notaSaymon + merged.notaKelly) / 2).toFixed(1));
            merged.notaPessoal = merged.mediaCasal;
          }
          return merged;
        })
      );
    },
    [setProperties]
  );

  const updateStatus = useCallback(
    (id: string, newStatus: PropertyStatus) => {
      setProperties((prev) =>
        prev.map((prop) => {
          if (prop.id !== id) return prop;
          return {
            ...prop,
            status: newStatus,
            isFavorito: newStatus === 'Favorito' ? true : prop.isFavorito,
          };
        })
      );
    },
    [setProperties]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setProperties((prev) =>
        prev.map((prop) => {
          if (prop.id !== id) return prop;
          const nextFav = !prop.isFavorito;
          return {
            ...prop,
            isFavorito: nextFav,
            status: nextFav && prop.status !== 'Favorito' ? 'Favorito' : prop.status === 'Favorito' && !nextFav ? 'Em Análise' : prop.status,
          };
        })
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
        return [...prev.slice(1), id];
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

  const exportToJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(properties, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `imoveis_saymon_kelly_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [properties]);

  const importFromJson = useCallback(
    (jsonData: string) => {
      try {
        const parsed = JSON.parse(jsonData);
        if (!Array.isArray(parsed)) {
          throw new Error('O arquivo JSON deve conter um array de imóveis');
        }
        const validated = parsed.map((item, idx) => {
          if (!item.titulo || typeof item.valorAluguel !== 'number') {
            throw new Error(`Item ${idx + 1} inválido no arquivo.`);
          }
          const nSaymon = item.notaSaymon || item.notaPessoal || 4;
          const nKelly = item.notaKelly || item.notaPessoal || 4;
          return {
            ...item,
            id: item.id || `imported-${Date.now()}-${idx}`,
            notaSaymon: nSaymon,
            notaKelly: nKelly,
            mediaCasal: item.mediaCasal || ((nSaymon + nKelly) / 2),
            custoTotalMensal: item.custoTotalMensal || calculateTotals(item.valorAluguel, item.valorCondominio, item.valorIptu, item.areaUtil).custoTotal,
            precoMetroQuadrado: item.precoMetroQuadrado || calculateTotals(item.valorAluguel, item.valorCondominio, item.valorIptu, item.areaUtil).precoM2,
            dataCadastro: item.dataCadastro || new Date().toISOString(),
          };
        });

        setProperties(validated);
        setSelectedForComparison([]);
        return { success: true, count: validated.length };
      } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao importar arquivo JSON.' };
      }
    },
    [setProperties]
  );

  // Filtered
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = prop.titulo.toLowerCase().includes(q);
        const matchBairro = prop.bairro.toLowerCase().includes(q);
        const matchObs = prop.observacoes?.toLowerCase().includes(q);
        const matchSaymon = prop.opiniaoSaymon?.toLowerCase().includes(q);
        const matchKelly = prop.opiniaoKelly?.toLowerCase().includes(q);
        if (!matchTitle && !matchBairro && !matchObs && !matchSaymon && !matchKelly) return false;
      }

      // Status
      if (filters.status !== 'todos' && prop.status !== filters.status) {
        return false;
      }

      // Max price
      if (filters.precoMax && prop.custoTotalMensal > filters.precoMax) {
        return false;
      }

      // Min bedrooms
      if (filters.dormitoriosMin && prop.dormitorios < filters.dormitoriosMin) {
        return false;
      }

      // Min parking
      if (filters.vagasMin && prop.vagasGaragem < filters.vagasMin) {
        return false;
      }

      // Commute
      if (filters.tempoMaxTrabalho && prop.tempoAteTrabalhoMinutos > filters.tempoMaxTrabalho) {
        return false;
      }

      // Favorites
      if (filters.apenasFavoritos && !prop.isFavorito && prop.status !== 'Favorito') {
        return false;
      }

      // Match do Casal
      if (filters.apenasMatchPerfeito && (prop.notaSaymon < 4 || prop.notaKelly < 4)) {
        return false;
      }

      // Differentials
      if (filters.diferenciais.length > 0) {
        const hasAll = filters.diferenciais.every((diff) => prop.diferenciais.includes(diff));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [properties, filters]);

  // Sorted
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    switch (sortKey) {
      case 'mediaCasal_desc':
        return list.sort((a, b) => b.mediaCasal - a.mediaCasal);
      case 'notaSaymon_desc':
        return list.sort((a, b) => b.notaSaymon - a.notaSaymon);
      case 'notaKelly_desc':
        return list.sort((a, b) => b.notaKelly - a.notaKelly);
      case 'precoTotal_asc':
        return list.sort((a, b) => a.custoTotalMensal - b.custoTotalMensal);
      case 'precoTotal_desc':
        return list.sort((a, b) => b.custoTotalMensal - a.custoTotalMensal);
      case 'precoM2_asc':
        return list.sort((a, b) => a.precoMetroQuadrado - b.precoMetroQuadrado);
      case 'tempoTrabalho_asc':
        return list.sort((a, b) => a.tempoAteTrabalhoMinutos - b.tempoAteTrabalhoMinutos);
      case 'area_desc':
        return list.sort((a, b) => b.areaUtil - a.areaUtil);
      case 'recente_desc':
      default:
        return list.sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
    }
  }, [filteredProperties, sortKey]);

  // KPIs
  const kpis = useMemo(() => {
    if (properties.length === 0) {
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

    const total = properties.length;
    const somaCusto = properties.reduce((acc, p) => acc + p.custoTotalMensal, 0);
    const mediaCusto = Math.round(somaCusto / total);

    const menorCustoTotal = [...properties].sort((a, b) => a.custoTotalMensal - b.custoTotalMensal)[0];
    const maisPertoTrabalho = [...properties].sort((a, b) => a.tempoAteTrabalhoMinutos - b.tempoAteTrabalhoMinutos)[0];
    const topCasalMatch = [...properties].sort((a, b) => b.mediaCasal - a.mediaCasal)[0];
    const favoritoSaymon = [...properties].sort((a, b) => b.notaSaymon - a.notaSaymon)[0];
    const favoritaKelly = [...properties].sort((a, b) => b.notaKelly - a.notaKelly)[0];

    return {
      total,
      mediaCusto,
      menorCustoTotal,
      maisPertoTrabalho,
      topCasalMatch,
      favoritoSaymon,
      favoritaKelly,
    };
  }, [properties]);

  const comparisonProperties = useMemo(() => {
    return properties.filter((p) => selectedForComparison.includes(p.id));
  }, [properties, selectedForComparison]);

  return {
    properties,
    filteredProperties: sortedProperties,
    totalCount: properties.length,
    filteredCount: sortedProperties.length,
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
    updateProperty,
    quickUpdateProperty,
    deleteProperty,
    duplicateProperty,
    updateStatus,
    toggleFavorite,
    resetToSampleData,
    exportToJson,
    importFromJson,
    kpis,
  };
}
