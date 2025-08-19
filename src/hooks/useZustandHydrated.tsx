import { useEffect, useState } from 'react';
import type { StoreApi } from 'zustand';

type PersistApi = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (cb: () => void) => () => void;
  };
};

export function useZustandHydrated<T extends object>(
  store: StoreApi<T> & PersistApi,
) {
  const [hydrated, setHydrated] = useState(store.persist.hasHydrated());
  useEffect(() => {
    const unsub = store.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [store]);
  return hydrated;
}
