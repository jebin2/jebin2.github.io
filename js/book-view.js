/* ==========================================================================================
   Book View JavaScript - 3D Flip Book Implementation
   ========================================================================================== */

import { projects } from './projects-data.js';

// State variables
let currentPageIndex = -1; // -1 means book is closed
const totalProjects = projects.length;
const numPhysicalPages = 1 + Math.ceil(totalProjects / 2);
let isBookOpen = false;

// DOM elements
let book, prevBtn, nextBtn, loadingScreen;

/**
 * Initialize the book view
 */
function init() {
    book = document.getElementById('book');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    loadingScreen = document.getElementById('loadingScreen');

    createBookElements();
    updateButtons();

    // Fade out loading screen
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }
    }, 100);
}

/**
 * Generate HTML for a project page
 */
function getProjectHTML(project, pageNumber) {
    if (!project) return '<div class="project-content"><p>Page Error</p></div>';

    const pageNumHTML = pageNumber ? `<div class="page-number ${pageNumber % 2 !== 0 ? 'right-align' : 'left-align'}">Page ${pageNumber}</div>` : '';
    const navButton = pageNumber == 1
        ? '<button id="closeBtn" class="visit-btn next-visit-btn">Close</button>'
        : pageNumber % 2 == 0
            ? '<button class="visit-btn next-visit-btn nav-next">Next</button>'
            : '<button class="visit-btn next-visit-btn nav-prev">Previous</button>';

    return `
        <div class="project-content">
            <div class="project-image">
                <img src="${project.image || 'placeholder.jpg'}" alt="${project.title || 'Project'} Preview" loading="lazy" onerror="this.src='https://via.placeholder.com/400x250/e8f4f5/4c6172?text=Image+Not+Found'">
            </div>
            <div class="project-info">
                <h3>${project.title || 'Untitled Project'}</h3>
                <p>${project.description || 'No description available.'}</p>
                <div style="position:relative">
                    <a href="${project.url || '#'}" target="_blank" rel="noopener noreferrer" class="visit-btn">Visit Project</a>
                    ${navButton}
                </div>
            </div>
            ${pageNumHTML}
        </div>`;
}

/**
 * Generate HTML for the final thank you page
 */
function getFinalPageHTML(pageNumber) {
    return `
        <h2>Thank You</h2>
        <p>Thanks for exploring my projects!</p>
        <p>Feel free to reach out or check my GitHub.</p>
        <div style="text-align: right;">
            <button id="closeBtn" class="visit-btn">Close</button>
        </div>
    `;
}

/**
 * Create all book page elements
 */
function createBookElements() {
    if (!book) return;
    book.innerHTML = '';

    // Create cover page
    const coverPage = document.createElement('div');
    coverPage.className = 'page';
    coverPage.id = 'page-0';
    coverPage.style.zIndex = numPhysicalPages + 1;

    const coverFront = document.createElement('div');
    coverFront.className = 'page-face page-front cover-face-front';
    coverFront.innerHTML = `
        <h1>My Creations</h1>
        <p>Welcome to my chaos</p>
        <div style="text-align: right;">
            <button class="visit-btn" id="openBookBtn">Open</button>
        </div>
    `;

    const coverBack = document.createElement('div');
    coverBack.className = 'page-face page-back cover-face-back';
    coverBack.innerHTML = getProjectHTML(projects[0], 1);

    coverPage.appendChild(coverFront);
    coverPage.appendChild(coverBack);
    book.appendChild(coverPage);

    // Create project pages
    let projectIndex = 1;
    for (let i = 1; i < numPhysicalPages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.id = `page-${i}`;
        page.style.zIndex = numPhysicalPages - i;

        const pageFront = document.createElement('div');
        pageFront.className = 'page-face page-front';
        const projectFront = projects[projectIndex];
        const logicalPageFront = projectIndex + 1;

        // Check if this is the last page and we don't have a project for the front
        if (i === numPhysicalPages - 1 && !projectFront) {
            pageFront.innerHTML = getFinalPageHTML(logicalPageFront);
            pageFront.classList.add('final-page-back');
        } else {
            pageFront.innerHTML = getProjectHTML(projectFront, logicalPageFront);
        }
        projectIndex++;

        const pageBack = document.createElement('div');
        pageBack.className = 'page-face page-back';
        const projectBack = projects[projectIndex];
        const logicalPageBack = projectIndex + 1;

        if (i === numPhysicalPages - 1 && !projectBack) {
            pageBack.innerHTML = getFinalPageHTML(logicalPageBack);
            pageBack.classList.add('final-page-back');
        } else {
            pageBack.innerHTML = getProjectHTML(projectBack, logicalPageBack);
        }
        projectIndex++;

        page.appendChild(pageFront);
        page.appendChild(pageBack);
        book.appendChild(page);
    }

    // Setup event delegation for buttons
    book.addEventListener('click', handleBookClick);
}

/**
 * Handle clicks on book buttons using event delegation
 */
function handleBookClick(e) {
    const target = e.target;

    if (target.id === 'openBookBtn') {
        openBook();
    } else if (target.id === 'closeBtn' || target.classList.contains('close-book')) {
        closeBook();
    } else if (target.classList.contains('nav-next')) {
        nextPage();
    } else if (target.classList.contains('nav-prev')) {
        previousPage();
    }
}

/**
 * Update navigation button states
 */
function updateButtons() {
    if (!prevBtn || !nextBtn) return;

    if (!isBookOpen) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    prevBtn.disabled = (currentPageIndex <= 0);
    nextBtn.disabled = (currentPageIndex >= numPhysicalPages - 1);
}

/**
 * Open the book
 */
function openBook() {
    if (isBookOpen) return;

    // First, make sure all pages are unflipped (clean state)
    for (let i = 0; i < numPhysicalPages; i++) {
        const pageElement = document.getElementById(`page-${i}`);
        if (pageElement && i !== 0) {
            pageElement.classList.remove('flipped');
        }
    }

    // Now flip only the cover page
    const coverPageElement = document.getElementById('page-0');
    if (coverPageElement) {
        coverPageElement.classList.add('flipped');
        isBookOpen = true;
        currentPageIndex = 0;
        updateButtons();

        setTimeout(() => {
            coverPageElement.style.zIndex = 0;
        }, 100);
    }
}

/**
 * Go to next page
 */
function nextPage() {
    const nextPageToFlipIndex = currentPageIndex + 1;
    if (!isBookOpen || nextPageToFlipIndex >= numPhysicalPages) return;

    const pageElement = document.getElementById(`page-${nextPageToFlipIndex}`);
    if (pageElement) {
        pageElement.classList.add('flipped');
        currentPageIndex++;
        updateButtons();

        setTimeout(() => {
            pageElement.style.zIndex = nextPageToFlipIndex + 1;
        }, 100);
    }
}

/**
 * Go to previous page
 */
function previousPage() {
    const pageToUnflipIndex = currentPageIndex;
    if (!isBookOpen || pageToUnflipIndex <= 0) return;

    const pageElement = document.getElementById(`page-${pageToUnflipIndex}`);
    if (pageElement) {
        pageElement.classList.remove('flipped');
        currentPageIndex--;
        updateButtons();

        setTimeout(() => {
            pageElement.style.zIndex = numPhysicalPages - pageToUnflipIndex;
        }, 100);
    }
}

/**
 * Close the book from any page
 */
function closeBook() {
    if (!isBookOpen) return;

    const delayIncrement = 50;
    let currentDelay = 0;

    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const cssTransitionDuration = 1200;
    const totalClosingTime = (currentPageIndex * delayIncrement) + cssTransitionDuration;

    for (let i = currentPageIndex; i >= 0; i--) {
        const pageElement = document.getElementById(`page-${i}`);
        if (pageElement) {
            setTimeout(() => {
                if (i === 0) {
                    pageElement.style.zIndex = numPhysicalPages + 1;
                    pageElement.classList.remove('flipped');
                } else {
                    const restoreZIndexOnTransitionEnd = (event) => {
                        if (event.target === pageElement && event.propertyName === 'transform') {
                            pageElement.style.zIndex = numPhysicalPages - i;
                        }
                    };
                    pageElement.addEventListener('transitionend', restoreZIndexOnTransitionEnd, { once: true });
                    pageElement.classList.remove('flipped');
                }
            }, currentDelay);

            currentDelay += delayIncrement;
        }
    }

    setTimeout(() => {
        isBookOpen = false;
        currentPageIndex = -1;
        updateButtons();
    }, totalClosingTime + 100);
}

// Setup event listeners for main navigation buttons
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Add listeners to main navigation buttons
    document.getElementById('prevBtn')?.addEventListener('click', previousPage);
    document.getElementById('nextBtn')?.addEventListener('click', nextPage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isBookOpen) return;

        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') previousPage();
        if (e.key === 'Escape') closeBook();
    });
});

// Export functions
export { openBook, closeBook, nextPage, previousPage };
