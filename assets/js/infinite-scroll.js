/**
 * Weblazer Infinite Scroll
 * High-performance, multi-instance infinite scroll for WordPress block themes.
 */
(function () {
    'use strict';

    const settings = typeof weblazer_settings !== 'undefined' ? weblazer_settings : {};
    const SELECTOR_QUERY = '.wp-block-query[data-weblazer-next]';
    const SELECTOR_TEMPLATE = '.wp-block-post-template';

    /**
     * Infinite Scroll Instance Class
     */
    class WeblazerInfiniteScroll {
        constructor(queryBlock) {
            this.queryBlock = queryBlock;
            this.container = queryBlock.querySelector(SELECTOR_TEMPLATE);
            if (!this.container) return;

            this.nextUrl = queryBlock.getAttribute('data-weblazer-next');
            this.initialUrl = window.location.href; // Store the original URL
            this.isLoading = false;
            this.urlObserver = null;

            this.init();
        }

        init() {
            this.setupUrlObserver();

            // Mark the very first post with the initial URL for tracking when scrolling back up
            if (this.container.children.length > 0) {
                this.markForUrlTracking(this.container.children[0], this.initialUrl);
            }

            // Hide existing pagination
            const pagination = this.queryBlock.querySelector('.wp-block-query-pagination, .navigation.pagination');
            if (pagination) pagination.style.display = 'none';

            this.setupObserver();
        }

        setupObserver() {
            const sentinel = document.createElement('div');
            sentinel.className = 'weblazer-sentinel';
            sentinel.style.width = '100%';
            sentinel.style.height = '1px';
            this.container.after(sentinel);

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isLoading && this.nextUrl) {
                        this.loadNextPage(observer, sentinel);
                    }
                });
            }, { rootMargin: '0px 0px 800px 0px' });

            observer.observe(sentinel);
        }

        async loadNextPage(observer, sentinel) {
            this.isLoading = true;

            const loadingIndicator = this.createStatusMessage(settings.loading_text, 'weblazer-loading-indicator');
            this.queryBlock.after(loadingIndicator);

            try {
                // Try fetching with the next URL
                const response = await fetch(this.nextUrl);
                
                // End of posts: 404 is common when WP calculation differs from actual query
                if (response.status === 404) {
                    this.finish(observer, sentinel, loadingIndicator);
                    return;
                }

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find correctly the containers in the new document
                const newQueryBlock = doc.querySelector(SELECTOR_QUERY) || doc.querySelector('.wp-block-query');
                const newPostsContainer = doc.querySelector(SELECTOR_TEMPLATE);

                if (newPostsContainer && newPostsContainer.children.length > 0) {
                    const newPosts = Array.from(newPostsContainer.children);
                    
                    // Track existing post IDs to avoid duplicates
                    const existingIds = Array.from(this.container.querySelectorAll('[class*="post-"]'))
                        .map(el => {
                            const match = el.className.match(/post-(\d+)/);
                            return match ? match[1] : null;
                        }).filter(id => id !== null);

                    let addedCount = 0;
                    const pageUrl = this.nextUrl;

                    newPosts.forEach((post, index) => {
                        const postMatch = post.className.match(/post-(\d+)/);
                        const postId = postMatch ? postMatch[1] : null;

                        // Only add if not already in the container
                        if (!postId || !existingIds.includes(postId)) {
                            const clone = post.cloneNode(true);
                            if (index === 0) {
                                this.markForUrlTracking(clone, pageUrl);
                            }
                            this.container.appendChild(clone);
                            addedCount++;
                        }
                    });

                    // Update the "Next" URL from the fetched document
                    this.nextUrl = newQueryBlock ? newQueryBlock.getAttribute('data-weblazer-next') : null;
                    
                    // Fallback to standard pagination search if no attribute
                    if (!this.nextUrl) {
                        const nextLink = doc.querySelector('.wp-block-query-pagination-next');
                        this.nextUrl = nextLink ? nextLink.href : null;
                    }

                    this.isLoading = false;
                    loadingIndicator.remove();

                    if (addedCount > 0) {
                        document.dispatchEvent(new CustomEvent('weblazer:infinite-scroll:posts-loaded', {
                            detail: { url: pageUrl, container: this.container, count: addedCount }
                        }));
                    }

                    // If we didn't add anything or no more pages, we are done
                    if (addedCount === 0 || !this.nextUrl) {
                        this.finish(observer, sentinel);
                    }
                } else {
                    this.finish(observer, sentinel, loadingIndicator);
                }

            } catch (error) {
                console.error('Weblazer Infinite Scroll:', error);
                loadingIndicator.remove();
                const errorMsg = this.createStatusMessage(settings.error_text || 'Error loading posts.', 'weblazer-error-message');
                sentinel.before(errorMsg);
                this.isLoading = false;
            }
        }

        finish(observer, sentinel, loadingIndicator = null) {
            if (loadingIndicator) loadingIndicator.remove();
            observer.unobserve(sentinel);
            sentinel.remove();
            
            const endMessage = this.createStatusMessage(settings.no_more_text, 'weblazer-no-more-posts-message');
            this.container.after(endMessage);
            this.nextUrl = null;
        }

        extractPageNumber(url) {
            const match = url.match(/page\/(\d+)/) || url.match(/paged=(\d+)/);
            return match ? match[1] : null;
        }

        setupUrlObserver() {
            this.urlObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const pageUrl = entry.target.getAttribute('data-weblazer-page-url');
                        if (pageUrl && window.location.href !== pageUrl) {
                            history.replaceState(null, '', pageUrl);
                        }
                    }
                });
            }, { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' });
        }

        markForUrlTracking(element, url) {
            element.setAttribute('data-weblazer-page-url', url);
            this.urlObserver.observe(element);
        }

        createStatusMessage(text, className) {
            const div = document.createElement('div');
            div.className = className;
            
            if (className === 'weblazer-loading-indicator') {
                const spinner = document.createElement('div');
                spinner.className = 'weblazer-spinner';
                const p = document.createElement('p');
                p.textContent = text;
                div.appendChild(spinner);
                div.appendChild(p);
            } else {
                div.textContent = text;
            }
            
            return div;
        }
    }

    /**
     * Initialization
     */
    const initAll = () => {
        const queryBlocks = document.querySelectorAll(SELECTOR_QUERY);
        queryBlocks.forEach(block => {
            if (!block.weblazer_instance) {
                block.weblazer_instance = new WeblazerInfiniteScroll(block);
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

})();
