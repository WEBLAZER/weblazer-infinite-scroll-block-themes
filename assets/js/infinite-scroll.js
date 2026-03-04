/**
 * Simple Infinite Scroll
 * Modern, high-performance infinite scroll for WordPress archives.
 * Features:
 * - Zero dependencies (Vanilla JS)
 * - Intersection Observer API for performance
 * - URL Synchronization without breaking CSS Grid/Flex
 * - Deep Linking support
 *
 * @author weblazer
 * @version 1.1.1
 */
(function () {
    'use strict';

    if (typeof simple_infinite_scroll === 'undefined') return;

    const settings = simple_infinite_scroll;
    let isLoading = false;
    let currentPage = parseInt(settings.current_page);
    let maxPages = parseInt(settings.max_pages);
    const baseUrl = settings.base_url;

    // Detect the correct container (WordPress Block themes use .wp-block-post-template)
    const CONTAINER_SELECTOR = '.wp-block-post-template';

    /**
     * Main Initialization
     */
    const init = () => {
        const container = document.querySelector(CONTAINER_SELECTOR);
        if (!container) return;

        // Hide native pagination
        const pagination = document.querySelector('.wp-block-query-pagination, .navigation.pagination');
        if (pagination) pagination.style.display = 'none';

        // Mark existing posts with current page number
        markPostsWithPage(container, currentPage);

        // Setup Infinite Scroll
        if (currentPage < maxPages) {
            setupInfiniteScroll(container);
        }

        // Setup URL Tracking
        setupUrlTracking();
    };

    /**
     * Mark posts with their page number (without wrapping them)
     */
    const markPostsWithPage = (container, pageNum) => {
        const posts = container.children;
        if (posts.length > 0) {
            // We only need to mark the first post of each page to track it
            posts[0].setAttribute('data-sis-page-start', pageNum);
            posts[0].setAttribute('data-sis-page-url', window.location.href);
            
            // Also mark all posts in this chunk to be sure
            Array.from(posts).forEach(post => {
                if (!post.hasAttribute('data-sis-page')) {
                    post.setAttribute('data-sis-page', pageNum);
                }
            });
        }
    };

    /**
     * Setup the infinite scroll observer
     */
    const setupInfiniteScroll = (container) => {
        const sentinel = document.createElement('div');
        sentinel.id = 'infinite-scroll-sentinel';
        sentinel.style.width = '100%';
        sentinel.style.height = '1px';
        container.after(sentinel);

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isLoading && currentPage < maxPages) {
                    loadNextPage(container, scrollObserver, sentinel);
                }
            });
        }, { rootMargin: '0px 0px 800px 0px' });

        scrollObserver.observe(sentinel);
    };

    /**
     * Load next page via Fetch API
     */
    const loadNextPage = async (container, observer, sentinel) => {
        isLoading = true;
        const nextPage = currentPage + 1;

        // Show Loading Indicator
        const loadingIndicator = createStatusMessage(settings.loading_text, 'loading-indicator');
        document.body.appendChild(loadingIndicator);

        // Build URL robustly
        let nextUrl;
        if (baseUrl.includes('?')) {
            nextUrl = baseUrl.includes('paged=') 
                ? baseUrl.replace(/paged=\d+/, 'paged=' + nextPage)
                : baseUrl + '&paged=' + nextPage;
        } else {
            nextUrl = baseUrl + 'page/' + nextPage + '/';
        }

        try {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newPostsContainer = doc.querySelector(CONTAINER_SELECTOR);

            if (newPostsContainer && newPostsContainer.children.length > 0) {
                const newPosts = Array.from(newPostsContainer.children);
                
                // Mark the first post of this new batch
                newPosts[0].setAttribute('data-sis-page-start', nextPage);
                newPosts[0].setAttribute('data-sis-page-url', nextUrl);

                // Append each post directly to keep the CSS Grid structure
                newPosts.forEach(post => {
                    post.setAttribute('data-sis-page', nextPage);
                    container.appendChild(post.cloneNode(true));
                });

                currentPage = nextPage;
                isLoading = false;
                loadingIndicator.remove();

                // Custom event
                document.dispatchEvent(new CustomEvent('simple:infinite-scroll:posts-loaded', {
                    detail: { page: currentPage, url: nextUrl }
                }));

                // Update URL tracking for new markers
                setupUrlTracking();

                if (currentPage >= maxPages) {
                    displayEndMessage(container, observer, sentinel);
                }
            } else {
                throw new Error('No more posts found');
            }

        } catch (error) {
            console.error('Simple Infinite Scroll:', error);
            loadingIndicator.remove();
            const errorMsg = createStatusMessage(settings.error_text, 'error-message');
            sentinel.before(errorMsg);
            isLoading = false;
        }
    };

    /**
     * URL Tracking: Change browser URL as markers intersect
     */
    let urlObserver;
    const setupUrlTracking = () => {
        if (urlObserver) urlObserver.disconnect();

        urlObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pageUrl = entry.target.getAttribute('data-sis-page-url');
                    if (pageUrl && window.location.href !== pageUrl) {
                        history.replaceState(null, '', pageUrl);
                    }
                }
            });
        }, { threshold: 0.1, rootMargin: '-10% 0px -80% 0px' });

        // Observe markers (the first post of each page)
        document.querySelectorAll('[data-sis-page-start]').forEach(marker => {
            urlObserver.observe(marker);
        });
    };

    /**
     * Helpers
     */
    const createStatusMessage = (text, className) => {
        const div = document.createElement('div');
        div.className = className;
        if (className === 'loading-indicator') {
            div.innerHTML = `<div class="spinner"></div><p>${text}</p>`;
        } else {
            div.textContent = text;
        }
        return div;
    };

    const displayEndMessage = (container, observer, sentinel) => {
        observer.unobserve(sentinel);
        sentinel.remove();
        const endMessage = createStatusMessage(settings.no_more_text, 'no-more-posts-message');
        container.after(endMessage);
    };

    // Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
