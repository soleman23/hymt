<?php
/**
 * 404 template.
 *
 * @package hym-travel
 */
get_header();
?>
<div class="page-hero">
  <div class="page-hero__bg"></div>
  <div class="page-hero__overlay"></div>
  <div class="page-hero__inner">
    <div class="page-hero__label">404</div>
    <h1 class="page-hero__title">Off the Map</h1>
    <p class="page-hero__sub">This page has moved, or never existed. The destinations, however, are all still exactly where they should be.</p>
  </div>
</div>
<div style="padding:64px 52px 96px;text-align:center">
  <a class="article-cta__btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Back to Home</a>
</div>
<?php
get_footer();
