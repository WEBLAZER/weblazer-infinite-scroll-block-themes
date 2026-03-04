=== Simple Infinite Scroll ===
Contributors: weblazer
Tags: infinite scroll, load more, query loop, scrolling, performance
Requires at least: 6.8
Tested up to: 6.9
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Modern, high-performance infinite scroll for WordPress. Light, fast, and SEO-friendly with URL synchronization.

== Description ==

Simple Infinite Scroll is the lightest and most modern way to add infinite scrolling to your WordPress archives. Built for performance and simplicity, it has been entirely rewritten in Vanilla JS (no jQuery) to meet modern web standards.

Unlike other plugins, it uses the native Intersection Observer API, ensuring smooth performance without straining the user's processor. It also features Smart URL Sync, which automatically updates the address bar as users scroll through different pages.

✨ **Key Highlights:**
* 🚀 **Zero Dependencies**: No jQuery. No external libraries. Pure Vanilla JS.
* ⚡ **Maximum Performance**: Optimized with the Intersection Observer API.
* 🔗 **Smart URL Sync**: Browser address bar updates as you scroll (perfect for sharing and SEO).
* 📦 **Ultra Lightweight**: Less than 3 KB of code.
* 🛠️ **Universal Compatibility**: Works with all WordPress blocks (Query Loop) and classic themes.
* 🎨 **Premium Design**: Modern, clean, and responsive loading indicators.
* 🌐 **i18n Ready**: Ready for translation (French included).

== Installation ==

1. Upload the `simple-infinite-scroll` directory to your `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Done! The plugin will automatically detect post lists on your archive pages.

== For Developers ==

You can hook into the event when new posts are loaded to re-run your custom scripts:

`
document.addEventListener('simple:infinite-scroll:posts-loaded', (e) => {
    console.log('Page loaded:', e.detail.page);
    console.log('Container:', e.detail.container);
    // Your custom logic here
});
`

== Screenshots ==

1. Modern pill-shaped loading indicator.

== Changelog ==

= 1.0.0 =
* Initial public release.
* Complete rewrite in Vanilla JS.
* Added Intersection Observer support.
* Added Smart URL Sync.
* Added French translation.
