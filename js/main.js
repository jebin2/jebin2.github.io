/* ============================================
   Main Page JavaScript - Portfolio Homepage
   ============================================ */

import { projects } from './projects-data.js';
import { debounce, handleImageError, trapFocus } from './utils.js';

// DOM Elements
let cardContainer;
let searchBar;
let iframeModal;
let iframeContent;
let closeBtn;
let bookIcon;

/**
 * Initialize the application
 */
function init() {
    // Get DOM elements
    cardContainer = document.getElementById('cardContainer');
    searchBar = document.querySelector('.search-bar');
    iframeModal = document.getElementById('iframeModal');
    iframeContent = document.getElementById('iframeContent');
    closeBtn = document.querySelector('.close-btn');
    bookIcon = document.getElementById('bookIcon');

    // Create project cards
    createCards();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Create project cards from the projects array
 */
function createCards() {
    if (!cardContainer) return;

    projects.forEach(project => {
        const card = createCardElement(project);
        cardContainer.appendChild(card);
    });
}

/**
 * Create a single card element
 * @param {Object} project - Project data object
 * @returns {HTMLElement} Card element
 */
function createCardElement(project) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    card.dataset.url = project.url;
    card.dataset.noPage = project.no_page || false;

    const img = document.createElement('img');
    img.src = project.image;
    img.alt = `${project.title} Preview`;
    img.loading = 'lazy';
    img.onerror = () => handleImageError(img);

    const cardTitle = document.createElement('div');
    cardTitle.className = 'card-title';

    const h3 = document.createElement('h3');
    h3.textContent = project.title;

    const link = document.createElement('a');
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'card-link';
    link.textContent = 'Visit';
    link.setAttribute('aria-label', `Visit ${project.title}`);

    // Prevent card click when clicking the link
    link.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    cardTitle.appendChild(h3);
    cardTitle.appendChild(link);
    card.appendChild(img);
    card.appendChild(cardTitle);

    return card;
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Search functionality with debouncing
    if (searchBar) {
        searchBar.addEventListener('input', debounce(handleSearch, 300));
    }

    // Card click event delegation
    if (cardContainer) {
        cardContainer.addEventListener('click', handleCardClick);
        cardContainer.addEventListener('keydown', handleCardKeydown);
    }

    // Modal close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeIframe);
    }

    // Close modal on outside click
    if (iframeModal) {
        iframeModal.addEventListener('click', (e) => {
            if (e.target === iframeModal) {
                closeIframe();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && iframeModal?.classList.contains('active')) {
            closeIframe();
        }
    });

    // Book icon click
    if (bookIcon) {
        bookIcon.addEventListener('click', () => {
            openIframe('book_view.html');
        });
        bookIcon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openIframe('book_view.html');
            }
        });
    }
}

/**
 * Handle search input
 * @param {Event} e - Input event
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const cards = cardContainer.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'block';
            card.setAttribute('aria-hidden', 'false');
        } else {
            card.style.display = 'none';
            card.setAttribute('aria-hidden', 'true');
        }
    });

    // Announce results to screen readers
    announceSearchResults(cards, searchTerm);
}

/**
 * Announce search results for accessibility
 * @param {NodeList} cards - All card elements
 * @param {string} searchTerm - Search term used
 */
function announceSearchResults(cards, searchTerm) {
    const visibleCount = Array.from(cards).filter(card => card.style.display !== 'none').length;
    const announcement = searchTerm
        ? `${visibleCount} project${visibleCount !== 1 ? 's' : ''} found for "${searchTerm}"`
        : `Showing all ${cards.length} projects`;

    // Create or update live region for screen readers
    let liveRegion = document.getElementById('search-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'search-live-region';
        liveRegion.className = 'visually-hidden';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = announcement;
}

/**
 * Handle card click event
 * @param {Event} e - Click event
 */
function handleCardClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    const url = card.dataset.url;
    const noPage = card.dataset.noPage === 'true';

    if (noPage) {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        openIframe(url);
    }
}

/**
 * Handle keyboard navigation on cards
 * @param {Event} e - Keydown event
 */
function handleCardKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(e);
    }
}

/**
 * Open iframe modal
 * @param {string} url - URL to load in iframe
 */
function openIframe(url) {
    if (!iframeModal || !iframeContent) return;

    iframeContent.src = url;
    iframeModal.classList.add('active');
    iframeModal.style.display = 'block';
    document.body.classList.add('no-scroll');

    // Trap focus in modal
    trapFocus(iframeModal);

    // Focus close button
    setTimeout(() => closeBtn?.focus(), 100);
}

/**
 * Close iframe modal
 */
function closeIframe() {
    if (!iframeModal || !iframeContent) return;

    iframeContent.src = '';
    iframeModal.classList.remove('active');
    iframeModal.style.display = 'none';
    document.body.classList.remove('no-scroll');

    // Return focus to the element that opened the modal
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential external use
export { openIframe, closeIframe };
