/* ============================================
   Analytics — Supabase event tracking
   Anon key is safe to expose (insert-only RLS)
   ============================================ */

import { supabaseConfig, supabaseJsonHeaders } from './supabase.js';

export async function trackEvent(event_type, label = null) {
    try {
        await fetch(supabaseConfig.eventsUrl, {
            method: 'POST',
            headers: supabaseJsonHeaders,
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

export function trackPageView(label = null) {
    const pageLabel = label !== null && label !== undefined
        ? label
        : (document.title.replace('jebin2 — ', '') || 'home');
    trackEvent('page_view', pageLabel);
}
