/* ============================================
   Supabase shared client config
   ============================================ */

const SUPABASE_URL = 'https://bfqcfhvpauvvakgmeuhr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yH1CSzF3YQ8FpU-hF-QEtg_ZWaKDLsR';

export const supabaseConfig = {
    url: SUPABASE_URL,
    key: SUPABASE_KEY,
    restUrl: `${SUPABASE_URL}/rest/v1`,
    eventsUrl: `${SUPABASE_URL}/rest/v1/events`
};

export const supabaseAuthHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
};

export const supabaseJsonHeaders = {
    ...supabaseAuthHeaders,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
};

export async function fetchSupabaseJson(path, options = {}) {
    const { headers, ...rest } = options;
    const res = await fetch(`${supabaseConfig.restUrl}/${path}`, {
        ...rest,
        headers: {
            ...supabaseAuthHeaders,
            ...headers
        }
    });

    if (!res.ok) throw new Error(`fetch ${path} → ${res.status}`);
    return res.json();
}
