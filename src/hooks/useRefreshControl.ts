// src/hooks/useRefreshControl.ts
import { useCallback, useState } from "react";

export function useRefreshControl(refetch: () => Promise<any> | any) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
