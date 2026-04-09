/* ============================================
   Embeddable analytics — drop into any project
   Usage:
     <script src="https://jebin2.github.io/js/analytics-embed.js"
             data-project="JellyJump"></script>

   Add data-skip-internal to skip tracking when the user navigated
   from another page on the same site (prevents double-counting):
     <script src="..." data-project="JellyJump" data-skip-internal></script>
   ============================================ */
(function () {
    const script = document.currentScript;
    const project = script && script.dataset.project;
    if (!project) return;

    // Skip if referred from same origin (internal navigation)
    if (script.hasAttribute('data-skip-internal') && document.referrer) {
        try {
            if (new URL(document.referrer).origin === window.location.origin) return;
        } catch {}
    }

    fetch('https://bfqcfhvpauvvakgmeuhr.supabase.co/rest/v1/events', {
        method: 'POST',
        headers: {
            'apikey':        'sb_publishable_yH1CSzF3YQ8FpU-hF-QEtg_ZWaKDLsR',
            'Authorization': 'Bearer sb_publishable_yH1CSzF3YQ8FpU-hF-QEtg_ZWaKDLsR',
            'Content-Type':  'application/json',
            'Prefer':        'return=minimal'
        },
        body: JSON.stringify({ event_type: 'project_click', label: project })
    }).catch(function () {});
})();
