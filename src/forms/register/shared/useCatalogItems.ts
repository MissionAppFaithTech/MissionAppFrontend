'use client';

import { useEffect, useState } from 'react';
import type { CatalogItem } from '@/services/catalog.service';

type CatalogLoader = () => Promise<CatalogItem[]>;

export function useCatalogItems(load: CatalogLoader) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    load()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : 'Não foi possível carregar as opções'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  return { items, isLoading, error };
}
