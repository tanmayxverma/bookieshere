import { TEST_SERIES, type TestSeriesProvider, type TestSeriesResource } from '@/data/testSeries';

const STORAGE_CUSTOM_KEY = 'bookie_test_series_custom_v1';
const STORAGE_DELETED_KEY = 'bookie_test_series_deleted_v1';
export const TEST_SERIES_CHANGED_EVENT = 'bookies_test_series_changed';

function safeGetJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}:`, err);
    return fallback;
  }
}

function safeSetJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write localStorage key ${key}:`, err);
  }
}

export function getAllTestSeries(): TestSeriesProvider[] {
  const custom = safeGetJson<TestSeriesProvider[]>(STORAGE_CUSTOM_KEY, []);
  const deletedIds = new Set(safeGetJson<string[]>(STORAGE_DELETED_KEY, []));

  const baseMap = new Map<string, TestSeriesProvider>();
  for (const t of TEST_SERIES) {
    if (!deletedIds.has(t.id)) {
      baseMap.set(t.id, { ...t });
    }
  }

  for (const c of custom) {
    if (!c?.id || deletedIds.has(c.id)) continue;
    baseMap.set(c.id, {
      id: c.id,
      name: c.name || 'Untitled Test Series',
      description: c.description || '',
      logo: c.logo || '',
      accent: c.accent || 'from-blue-600/25 to-indigo-900/40',
      resources: Array.isArray(c.resources) ? c.resources : [],
    });
  }

  return Array.from(baseMap.values());
}

export function getTestSeriesById(id: string): TestSeriesProvider | undefined {
  if (!id) return undefined;
  const list = getAllTestSeries();
  return list.find((t) => t.id === id);
}

export function saveTestSeries(provider: TestSeriesProvider): TestSeriesProvider {
  if (!provider.id) {
    provider.id = provider.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `test-${Date.now()}`;
  }

  const custom = safeGetJson<TestSeriesProvider[]>(STORAGE_CUSTOM_KEY, []);
  const deleted = safeGetJson<string[]>(STORAGE_DELETED_KEY, []);

  const newDeleted = deleted.filter((d) => d !== provider.id);
  safeSetJson(STORAGE_DELETED_KEY, newDeleted);

  const existingIdx = custom.findIndex((c) => c.id === provider.id);
  const sanitized: TestSeriesProvider = {
    id: provider.id,
    name: provider.name.trim(),
    description: (provider.description || '').trim(),
    logo: (provider.logo || '').trim(),
    accent: provider.accent || 'from-blue-600/25 to-indigo-900/40',
    resources: Array.isArray(provider.resources)
      ? provider.resources.map((r) => ({
          name: (r.name || '').trim(),
          url: (r.url || '').trim(),
          badge: r.badge ? r.badge.trim() : undefined,
        }))
      : [],
  };

  let newCustom: TestSeriesProvider[];
  if (existingIdx >= 0) {
    newCustom = [...custom];
    newCustom[existingIdx] = sanitized;
  } else {
    newCustom = [sanitized, ...custom];
  }

  safeSetJson(STORAGE_CUSTOM_KEY, newCustom);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TEST_SERIES_CHANGED_EVENT, { detail: sanitized }));
  }

  return sanitized;
}

export function deleteTestSeries(id: string): boolean {
  if (!id) return false;

  const custom = safeGetJson<TestSeriesProvider[]>(STORAGE_CUSTOM_KEY, []);
  const deleted = safeGetJson<string[]>(STORAGE_DELETED_KEY, []);

  const newCustom = custom.filter((c) => c.id !== id);
  safeSetJson(STORAGE_CUSTOM_KEY, newCustom);

  if (!deleted.includes(id)) {
    deleted.push(id);
    safeSetJson(STORAGE_DELETED_KEY, deleted);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TEST_SERIES_CHANGED_EVENT, { detail: { deletedId: id } }));
  }

  return true;
}

export function resetTestSeriesToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_CUSTOM_KEY);
    localStorage.removeItem(STORAGE_DELETED_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TEST_SERIES_CHANGED_EVENT));
    }
  } catch (err) {
    console.warn('Failed to reset test series:', err);
  }
}
