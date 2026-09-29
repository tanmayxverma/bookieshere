import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Portal } from '@/data/portals';
import {
  getAllPortals,
  getPortalById,
  savePortal as storeSavePortal,
  deletePortal as storeDeletePortal,
  PORTALS_CHANGED_EVENT,
} from '@/lib/portalsStorage';

export function usePortals() {
  const [portals, setPortals] = useState<Portal[]>(() => getAllPortals());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setPortals(getAllPortals());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener(PORTALS_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PORTALS_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const getPortal = useCallback((id: string) => {
    return getPortalById(id);
  }, []);

  const savePortal = useCallback(async (portal: Portal) => {
    const saved = storeSavePortal(portal);
    refresh();
    return saved;
  }, [refresh]);

  const deletePortal = useCallback(async (id: string) => {
    const success = storeDeletePortal(id);
    refresh();
    return success;
  }, [refresh]);

  return {
    portals,
    loading,
    refresh,
    getPortal,
    savePortal,
    deletePortal,
  };
}
