/* ============================================
   Prerendered post page

   The article HTML is already in the document — this only adds the parts a
   static file can't carry: shared chrome, analytics, syntax highlighting and
   the admin share UI. Post metadata comes from data-* on <article>.
   ============================================ */

import { initPage } from './shared.js';
import { trackEvent, trackPageView } from './analytics.js';
import { shareButtonsHTML, initShareButtons } from './share.js';

async function init() {
    const article = document.querySelector('article[data-post-path]');
    const title = article?.dataset.postTitle || document.title;
    const postPath = article?.dataset.postPath || '';

    const config = await initPage('blog', { skipTrackPageView: true });
    trackPageView(title);
    trackEvent('post_read', title);

    if (window.hljs) {
        document.querySelectorAll('pre code').forEach(block => window.hljs.highlightElement(block));
    }

    const shareHtml = shareButtonsHTML({ title, description: article?.dataset.postDescription });
    if (shareHtml) {
        document.querySelector('article > header')?.insertAdjacentHTML('beforeend', shareHtml);
        initShareButtons({
            title,
            getHtml: () => document.querySelector('article > section')?.innerHTML || '',
            // Only fetched if an admin opens the modal
            getMarkdown: async () => {
                try {
                    const res = await fetch(config.blog_base_url + postPath);
                    return res.ok ? await res.text() : '';
                } catch {
                    return '';
                }
            },
        });
    }
}

init();
