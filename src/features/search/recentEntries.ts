const STORAGE_KEY = 'sch-recent-entries';
const MAX_RECENTS = 6;

/** Slugs of recently opened entries (most recent first), from localStorage. */
export function getRecentEntries(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

/** Record an entry visit (deduped, capped, most recent first). */
export function addRecentEntry(slug: string): void {
  try {
    const next = [slug, ...getRecentEntries().filter((s) => s !== slug)].slice(0, MAX_RECENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.) — recents are a nicety only.
  }
}
