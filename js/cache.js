/* ============================================
   Cache — sessionStorage wrapper with TTL
   ============================================ */

const TTL = 5 * 60 * 1000; // 5 minutes

// Returns the stored entry regardless of age, or null. Expired entries are
// deliberately kept so they can serve as a fallback when the network fails.
function getEntry(key) {
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getCache(key) {
    const entry = getEntry(key);
    if (!entry) return null;
    return Date.now() - entry.ts > TTL ? null : entry.data;
}

export function setCache(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
        // sessionStorage full or unavailable — silent fail
    }
}

// Fresh cache → network → stale cache. Serving a stale post beats an error
// page when the upstream content host is unreachable.
async function fetchWithFallback(url, parse) {
    const cached = getCache(url);
    if (cached) return cached;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
        const data = await parse(res);
        setCache(url, data);
        return data;
    } catch (err) {
        const stale = getEntry(url);
        if (stale) {
            console.warn(`${url} unreachable — serving stale cache`, err);
            return stale.data;
        }
        throw err;
    }
}

export function fetchCached(url) {
    return fetchWithFallback(url, res => res.json());
}

export function fetchTextCached(url) {
    return fetchWithFallback(url, res => res.text());
}
