/* ============================================
   Cache — sessionStorage wrapper with TTL
   ============================================ */

const TTL = 5 * 60 * 1000; // 5 minutes

export function getCache(key) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > TTL) {
            sessionStorage.removeItem(key);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

export function setCache(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
        // sessionStorage full or unavailable — silent fail
    }
}

export async function fetchCached(url) {
    const cached = getCache(url);
    if (cached) return cached;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
    const data = await res.json();
    setCache(url, data);
    return data;
}

export async function fetchTextCached(url) {
    const cached = getCache(url);
    if (cached) return cached;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
    const text = await res.text();
    setCache(url, text);
    return text;
}
