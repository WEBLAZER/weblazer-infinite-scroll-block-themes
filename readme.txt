=== Weblazer Infinite Scroll for Block Themes ===
Contributors: weblazer
Tags: infinite scroll, load more, query loop, scrolling, performance
Requires at least: 6.8
Tested up to: 7.0
Stable tag: 1.0.2
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

High-performance infinite scroll for WordPress. Native JS, SEO-friendly with URL synchronization. Optimized for Block Themes and the Query Loop block.

== Description ==

Weblazer Infinite Scroll provides a way to add infinite scrolling to your WordPress archives. Built with performance in mind, it is written in Vanilla JS and relies on the native Intersection Observer API for efficient scroll detection.

This plugin is specifically optimized for modern WordPress block themes and the Query Loop block, ensuring seamless integration with the Site Editor. It also features URL synchronization, which updates the browser address bar as users scroll through different pages.

== Installation ==

1. Upload the plugin directory to your `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. The plugin will automatically detect post lists on your archive pages that use standard WordPress pagination classes.

== For Developers ==

You can hook into the event when new posts are loaded to re-run your custom scripts:

`
document.addEventListener('weblazer:infinite-scroll:posts-loaded', (e) => {
    console.log('Page loaded:', e.detail.page);
    console.log('URL:', e.detail.url);
});
`

== Screenshots ==

1. Loading indicator during post fetching.

== Changelog ==

= 1.0.2 - 2026-04-16 =
* ✅ Verified compatibility with WordPress 7.0.
* 🚀 Maintenance release.

= 1.0.1 =
* Renamed plugin to Weblazer Infinite Scroll for Block Themes to meet WordPress repository requirements.
* Cleaned up marketing language in readme.
* Improved prefixing for better compatibility.
* Added support for custom events.

= 1.0.0 =
* Initial public release.
