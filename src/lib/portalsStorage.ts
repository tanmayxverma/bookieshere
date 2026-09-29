import { PORTALS, type Portal, type PortalLink } from '@/data/portals';

const STORAGE_CUSTOM_KEY = 'bookie_portals_custom_v1';
const STORAGE_DELETED_KEY = 'bookie_portals_deleted_v1';
export const PORTALS_CHANGED_EVENT = 'bookies_portals_changed';

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

export function getAllPortals(): Portal[] {
  const custom = safeGetJson<Portal[]>(STORAGE_CUSTOM_KEY, []);
  const deletedIds = new Set(safeGetJson<string[]>(STORAGE_DELETED_KEY, []));

  // Filter default portals that have not been deleted
  const baseMap = new Map<string, Portal>();
  for (const p of PORTALS) {
    if (!deletedIds.has(p.id)) {
      baseMap.set(p.id, { ...p });
    }
  }

  // Merge custom portals (they can override defaults or be new portals)
  for (const c of custom) {
    if (!c?.id || deletedIds.has(c.id)) continue;
    baseMap.set(c.id, {
      id: c.id,
      name: c.name || 'Untitled Portal',
      tagline: c.tagline || '',
      logo: c.logo || '',
      accent: c.accent || 'from-slate-700/30 to-slate-900/40',
      links: Array.isArray(c.links) ? c.links : [],
      instructions: c.instructions || '',
    });
  }

  return Array.from(baseMap.values());
}

export function getPortalById(id: string): Portal | undefined {
  if (!id) return undefined;
  const list = getAllPortals();
  return list.find((p) => p.id === id);
}

export function savePortal(portal: Portal): Portal {
  if (!portal.id) {
    // Generate slug from name
    portal.id = portal.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `portal-${Date.now()}`;
  }

  const custom = safeGetJson<Portal[]>(STORAGE_CUSTOM_KEY, []);
  const deleted = safeGetJson<string[]>(STORAGE_DELETED_KEY, []);

  // Remove from deleted list if it was deleted previously
  const newDeleted = deleted.filter((d) => d !== portal.id);
  safeSetJson(STORAGE_DELETED_KEY, newDeleted);

  // Add or update in custom list
  const existingIdx = custom.findIndex((c) => c.id === portal.id);
  const sanitizedPortal: Portal = {
    id: portal.id,
    name: portal.name.trim(),
    tagline: (portal.tagline || '').trim(),
    logo: (portal.logo || '').trim(),
    accent: portal.accent || 'from-slate-700/30 to-slate-900/40',
    links: Array.isArray(portal.links)
      ? portal.links.map((l) => ({
          label: (l.label || '').trim(),
          url: (l.url || '').trim(),
          note: l.note ? l.note.trim() : undefined,
        }))
      : [],
    instructions: portal.instructions ? portal.instructions.trim() : undefined,
  };

  let newCustom: Portal[];
  if (existingIdx >= 0) {
    newCustom = [...custom];
    newCustom[existingIdx] = sanitizedPortal;
  } else {
    newCustom = [sanitizedPortal, ...custom];
  }

  safeSetJson(STORAGE_CUSTOM_KEY, newCustom);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PORTALS_CHANGED_EVENT, { detail: sanitizedPortal }));
  }

  return sanitizedPortal;
}

export function deletePortal(id: string): boolean {
  if (!id) return false;

  const custom = safeGetJson<Portal[]>(STORAGE_CUSTOM_KEY, []);
  const deleted = safeGetJson<string[]>(STORAGE_DELETED_KEY, []);

  // Remove from custom
  const newCustom = custom.filter((c) => c.id !== id);
  safeSetJson(STORAGE_CUSTOM_KEY, newCustom);

  // Add to deleted set
  if (!deleted.includes(id)) {
    deleted.push(id);
    safeSetJson(STORAGE_DELETED_KEY, deleted);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PORTALS_CHANGED_EVENT, { detail: { deletedId: id } }));
  }

  return true;
}

export function resetPortalsToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_CUSTOM_KEY);
    localStorage.removeItem(STORAGE_DELETED_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PORTALS_CHANGED_EVENT));
    }
  } catch (err) {
    console.warn('Failed to reset portals:', err);
  }
}
