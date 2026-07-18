<?php
/**
 * Hit Your Mark Travel theme setup.
 *
 * @package hym-travel
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'HYM_VERSION', '1.0.0' );
define( 'HYM_URI', get_template_directory_uri() );
define( 'HYM_DIR', get_template_directory() );

require_once HYM_DIR . '/inc/template-tags.php';

add_action( 'after_setup_theme', function () {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
    add_theme_support( 'custom-logo', array(
        'height'      => 120,
        'width'       => 120,
        'flex-height' => true,
        'flex-width'  => true,
    ) );
    register_nav_menus( array(
        'primary' => __( 'Primary Navigation', 'hym-travel' ),
        'footer_experiences' => __( 'Footer — Experiences', 'hym-travel' ),
        'footer_destinations' => __( 'Footer — Destinations', 'hym-travel' ),
    ) );
    add_image_size( 'hym-hero', 2048, 1152, true );
    add_image_size( 'hym-card', 1024, 768, true );
} );

add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'hym-fonts',
        'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap',
        array(),
        null
    );
    wp_enqueue_style( 'hym-styles', HYM_URI . '/assets/css/styles.css', array( 'hym-fonts' ), HYM_VERSION );
    wp_enqueue_style( 'hym-pages', HYM_URI . '/assets/css/pages.css', array( 'hym-styles' ), HYM_VERSION );
    wp_enqueue_script( 'hym-main', HYM_URI . '/assets/js/main.js', array(), HYM_VERSION, true );
} );

/** Fallback primary menu matching the static site structure. */
function hym_fallback_menu() {
    $items = array(
        '/experiences/'   => 'Experiences',
        '/destinations/'  => 'Destinations',
        '/about/'         => 'About',
        '/travel-journal/' => 'Travel Journal',
        '/contact/'       => 'Contact',
    );
    $out = '';
    foreach ( $items as $url => $label ) {
        $out .= '<a class="nav__link" href="' . esc_url( home_url( $url ) ) . '">' . esc_html( $label ) . '</a>';
    }
    return $out;
}

/** Walker-free primary menu renderer (flat links). */
function hym_primary_menu() {
    if ( has_nav_menu( 'primary' ) ) {
        $items = wp_get_nav_menu_items( get_nav_menu_locations()['primary'] );
        if ( $items ) {
            foreach ( $items as $item ) {
                printf(
                    '<a class="nav__link" href="%s">%s</a>',
                    esc_url( $item->url ),
                    esc_html( $item->title )
                );
            }
            return;
        }
    }
    echo hym_fallback_menu(); // phpcs:ignore
}

/** Journal categories used for the filter bar on the posts index. */
function hym_journal_categories() {
    return get_categories( array( 'hide_empty' => true ) );
}
