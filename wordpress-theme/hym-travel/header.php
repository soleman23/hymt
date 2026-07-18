<?php
/**
 * Theme header.
 *
 * @package hym-travel
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main">Skip to content</a>
<nav class="nav" id="nav">
  <a href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo esc_url( HYM_URI . '/assets/logo.png' ); ?>" class="nav__logo" alt="Hit Your Mark Travel" width="52" height="52"></a>
  <ul class="nav__links" id="navLinks">
    <?php hym_primary_menu(); ?>
  </ul>
  <a href="<?php echo esc_url( home_url( '/plan-your-trip/' ) ); ?>" class="nav__cta">Plan My Trip</a>
  <button class="nav__mobile-toggle" id="mobileToggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>
<main id="main">
