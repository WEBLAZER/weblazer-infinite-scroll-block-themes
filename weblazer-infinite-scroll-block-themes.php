<?php
/**
 * Plugin Name: Weblazer Infinite Scroll for Block Themes
 * Plugin URI: https://wordpress.org/plugins/weblazer-infinite-scroll-block-themes/
 * GitHub Plugin URI: https://github.com/WEBLAZER/weblazer-infinite-scroll-block-themes
 * Description: High-performance infinite scroll for WordPress. Native JS, SEO friendly with URL synchronization. Optimized for Block Themes and the Query Loop block.
 * Version: 1.0.2
 * Author: weblazer
 * Author URI: https://profiles.wordpress.org/weblazer/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: weblazer-infinite-scroll-block-themes
 * Domain Path: /languages
 * Requires at least: 6.8
 * Tested up to: 7.0
 * Requires PHP: 7.4
 *
 * @package WeblazerInfiniteScrollBlockThemes
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main plugin class
 */
class Weblazer_Infinite_Scroll_Block_Themes {

    /**
     * Plugin version
     */
    const VERSION = '1.0.2';

    /**
     * Plugin directory path
     */
    private $plugin_dir;

    /**
     * Plugin directory URL
     */
    private $plugin_url;

    /**
     * Constructor
     */
    public function __construct() {
        $this->plugin_dir = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);

        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_filter('render_block_core/query', array($this, 'enhance_query_block'), 10, 2);
    }

    /**
     * Enhance Query block with next page URL
     */
    public function enhance_query_block($block_content, $block) {
        if (is_admin()) {
            return $block_content;
        }

        global $wp_query;
        $next_url = '';
        $max_pages = 0;
        $current_page = max(1, get_query_var('paged'), get_query_var('page'));

        // Case 1: The block inherits from the global query
        if (isset($block['attrs']['query']['inherit']) && $block['attrs']['query']['inherit']) {
            $max_pages = $wp_query->max_num_pages;
            
            if ($current_page < $max_pages) {
                $next_url = get_pagenum_link($current_page + 1);
            }
        } 
        // Case 2: Custom query (not inheriting)
        else {
            // We search for a "Next" link already present in the block's pagination
            if (preg_match('/class="wp-block-query-pagination-next"[^>]*href="([^"]+)"/', $block_content, $matches)) {
                $next_url = $matches[1];
            }
        }

        if ($next_url) {
            // Clean URL (remove potential duplicates of /page/1/ etc)
            $next_url = html_entity_decode($next_url);

            // Inject the data attribute into the query block wrapper
            $block_content = preg_replace(
                '/(class="[^"]*wp-block-query[^"]*")/',
                '$1 data-weblazer-next="' . esc_url($next_url) . '" data-weblazer-current="' . $current_page . '"',
                $block_content,
                1
            );
        }

        return $block_content;
    }

    /**
     * Enqueue scripts and styles
     */
    public function enqueue_scripts() {
        // Load everywhere where there might be a list of posts
        if (is_attachment()) {
            return;
        }

        // Enqueue CSS
        $css_path = $this->plugin_dir . 'assets/css/infinite-scroll.css';
        $css_version = file_exists($css_path) ? filemtime($css_path) : self::VERSION;
        
        wp_enqueue_style(
            'weblazer-infinite-scroll-css',
            $this->plugin_url . 'assets/css/infinite-scroll.css',
            array(),
            $css_version
        );

        // Enqueue JavaScript (No jQuery dependency!)
        $js_path = $this->plugin_dir . 'assets/js/infinite-scroll.js';
        $js_version = file_exists($js_path) ? filemtime($js_path) : self::VERSION;
        
        wp_enqueue_script(
            'weblazer-infinite-scroll-js',
            $this->plugin_url . 'assets/js/infinite-scroll.js',
            array(),
            $js_version,
            true
        );

        wp_localize_script('weblazer-infinite-scroll-js', 'weblazer_settings', array(
            'loading_text' => __('Loading posts...', 'weblazer-infinite-scroll-block-themes'),
            'no_more_text' => __('All posts have been loaded.', 'weblazer-infinite-scroll-block-themes'),
            'error_text'   => __('Error loading posts.', 'weblazer-infinite-scroll-block-themes')
        ));
    }
}

// Initialize plugin
new Weblazer_Infinite_Scroll_Block_Themes();