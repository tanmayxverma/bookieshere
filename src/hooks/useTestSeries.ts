import { useEffect, useState, useCallback } from 'react';
import type { TestSeriesProvider } from '@/data/testSeries';
import {
  getAllTestSeries,
  getTestSeriesById,
  saveTestSeries as storeSaveTestSeries,
  deleteTestSeries as storeDeleteTestSeries,
  TEST_SERIES_CHANGED_EVENT,
} from '@/lib/testSeriesStorage';

export function useTestSeries() {
  const [testSeries, setTestSeries] = useState<TestSeriesProvider[]>(() => getAllTestSeries());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setTestSeries(getAllTestSeries());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener(TEST_SERIES_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(TEST_SERIES_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const getTestSeries = useCallback((id: string) => {
    return getTestSeriesById(id);
  }, []);

  const saveTestSeries = useCallback(async (provider: TestSeriesProvider) => {
    const saved = storeSaveTestSeries(provider);
    refresh();
    return saved;
  }, [refresh]);

  const deleteTestSeries = useCallback(async (id: string) => {
    const success = storeDeleteTestSeries(id);
    refresh();
    return success;
  }, [refresh]);

  return {
    testSeries,
    loading,
    refresh,
    getTestSeries,
    saveTestSeries,
    deleteTestSeries,
  };
}
