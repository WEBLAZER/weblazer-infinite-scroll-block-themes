<?php
/**
 * Plugin Name: Simple Infinite Scroll
 * Plugin URI: https://wordpress.org/plugins/simple-infinite-scroll/
 * GitHub Plugin URI: https://github.com/WEBLAZER/simple-infinite-scroll
 * Description: Simple infinite scroll functionality for WordPress blog archives. Automatically loads more posts when scrolling down on archive pages (blog, categories, tags, etc.). Uses native WordPress pagination for maximum compatibility.
 * Version: 1.0.0
 * Author: weblazer
 * Author URI: https://profiles.wordpress.org/weblazer/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: simple-infinite-scroll
 * Domain Path: /languages
 * Requires at least: 6.8
 * Tested up to: 6.9
 * Requires PHP: 7.4
 *
 * @package SimpleInfiniteScroll
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main plugin class
 */
class Simple_Infinite_Scroll {

    /**
     * Plugin version
     */
    const VERSION = '1.0.0';

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
            'simple-infinite-scroll-css',
            $this->plugin_url . 'assets/css/infinite-scroll.css',
            array(),
            $css_version
        );

        // Enqueue JavaScript (No jQuery dependency!)
        $js_path = $this->plugin_dir . 'assets/js/infinite-scroll.js';
        $js_version = file_exists($js_path) ? filemtime($js_path) : self::VERSION;
        
        wp_enqueue_script(
            'simple-infinite-scroll-js',
            $this->plugin_url . 'assets/js/infinite-scroll.js',
            array(),
            $js_version,
            true
        );

        // Localize script
        global $wp_query;
        
        $current_page = get_query_var('paged') ? get_query_var('paged') : 1;
        $max_pages = $wp_query->max_num_pages;
        
        // Get dynamic base URL
        if (is_search()) {
            $base_url = get_search_link();
        } else {
            // This works for home (blog), categories, tags, and custom archives
            $base_url = get_pagenum_link(1);
        }

        wp_localize_script('simple-infinite-scroll-js', 'simple_infinite_scroll', array(
            'current_page' => (int) $current_page,
            'max_pages'    => (int) $max_pages,
            'base_url'     => trailingslashit($base_url),
            'loading_text' => __('Loading posts...', 'simple-infinite-scroll'),
            'no_more_text' => __('All posts have been loaded.', 'simple-infinite-scroll'),
            'error_text'   => __('Error loading posts.', 'simple-infinite-scroll')
        ));
    }
}

// Initialize plugin
new Simple_Infinite_Scroll();