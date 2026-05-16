/**
 * hooks/usePaginatedFetch.ts
 *
 * Hook para paginación en servidor.
 * El backend recibe ?page=N&limit=M y retorna { data, total, page, totalPages }.
 * Si el backend todavía retorna un array plano, el hook lo normaliza
 * asumiendo que no hay más páginas.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

/** El fetchFn puede devolver formato paginado o array plano (retro-compat.) */
type FetchFn<T> = (page: number, limit: number) => Promise<PaginatedResponse<T> | T[]>;

export interface UsePaginatedFetchResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (n: number) => void;
  refresh: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePaginatedFetch<T>(
  fetchFn: FetchFn<T>,
  limit = 10,
  /** deps adicionales (ej: filtros de fecha) que deben reiniciar a página 1 */
  deps: unknown[] = [],
): UsePaginatedFetchResult<T> {
  const [data, setData]           = useState<T[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);

  // Ref estable para fetchFn (evita dependencia cambiante en useEffect)
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const load = useCallback(async (targetPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRef.current(targetPage, limit);

      // Normalizar: si el backend retorna array plano, lo envolvemos
      if (Array.isArray(result)) {
        setData(result);
        setTotal(result.length);
        setTotalPages(1);
      } else {
        setData(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages || 1);
      }
      setPage(targetPage);
    } catch (e: any) {
      setError(e.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Recarga cuando cambian los deps (filtros) — siempre vuelve a página 1
  useEffect(() => {
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, ...deps]);

  const nextPage = () => { if (page < totalPages) load(page + 1); };
  const prevPage = () => { if (page > 1) load(page - 1); };
  const goToPage = (n: number) => { if (n >= 1 && n <= totalPages) load(n); };
  const refresh  = () => load(page);

  return { data, loading, error, page, totalPages, total, limit, nextPage, prevPage, goToPage, refresh };
}
