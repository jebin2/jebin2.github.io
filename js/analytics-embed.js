/* ============================================
   Embeddable analytics — drop into any project
   Usage:
     <script src="https://jebin2.github.io/js/analytics-embed.js"
             data-project="JellyJump"></script>
   ============================================ */
(function () {
    const script = document.currentScript;
    const project = script && script.dataset.project;
    if (!project) return;

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
