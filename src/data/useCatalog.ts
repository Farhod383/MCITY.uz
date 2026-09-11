import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadCatalog, STATIC_CATALOG, type Catalog } from "./catalog-source";

export const CATALOG_QUERY_KEY = ["catalog"] as const;

/**
 * Sayt bo'ylab katalogni o'qish uchun yagona joy.
 *
 * Boshida statik ma'lumot ko'rsatiladi (sahifa "sakramaydi"), so'ng
 * Supabase'dan yangisi kelib almashadi. Supabase ulanmagan bo'lsa —
 * statik ma'lumot o'z holicha qolaveradi.
 */
export function useCatalog(): Catalog & { isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: loadCatalog,
    placeholderData: STATIC_CATALOG,
    staleTime: 60_000,
  });

  return { ...(data ?? STATIC_CATALOG), isLoading };
}

/** Admin panelda o'zgarish saqlangach katalogni yangilash uchun */
export function useRefreshCatalog() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
}
