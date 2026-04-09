/* ============================================
   Analytics — Supabase event tracking
   Anon key is safe to expose (insert-only RLS)
   ============================================ */

const URL  = 'https://bfqcfhvpauvvakgmeuhr.supabase.co/rest/v1/events';
const KEY  = 'sb_publishable_yH1CSzF3YQ8FpU-hF-QEtg_ZWaKDLsR';

const HEADERS = {
    'Content-Type':  'application/json',
    'apikey':        KEY,
    'Authorization': `Bearer ${KEY}`,
    'Prefer':        'return=minimal'
};

export async function trackEvent(event_type, label = null) {
    try {
        await fetch(URL, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                event_type,
                label,
                page: window.location.pathname
            })
        });
    } catch {
        // Silent fail — never break UX for analytics
    }
}

export function trackPageView() {
    trackEvent('page_view', document.title.replace('jebin2 — ', '') || 'home');
}
