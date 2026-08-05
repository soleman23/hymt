<?php
/**
 * Template Name: Destination Detail
 * Template Post Type: page
 *
 * Renders a single destination page: breadcrumb, hero from the featured
 * image, editor content, and the standard CTA. Create child pages under
 * /destinations/ and assign this template.
 *
 * @package hym-travel
 */
get_header();
while ( have_posts() ) : the_post();
    $hero_img = get_the_post_thumbnail_url( get_the_ID(), 'hym-hero' );
    ?>
<div class="breadcrumb"><div class="breadcrumb__inner">
  <a class="breadcrumb__link" href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a>
  <span class="breadcrumb__sep">&rsaquo;</span>
  <a class="breadcrumb__link" href="<?php echo esc_url( home_url( '/destinations/' ) ); ?>">Destinations</a>
  <span class="breadcrumb__sep">&rsaquo;</span>
  <span class="breadcrumb__current"><?php the_title(); ?></span>
</div></div>

<div class="dest-hero">
  <div class="dest-hero__bg"<?php if ( $hero_img ) : ?> style="background-image:url('<?php echo esc_url( $hero_img ); ?>');background-size:cover;background-position:center"<?php endif; ?>></div>
  <div class="dest-hero__overlay"></div>
  <div class="dest-hero__inner">
    <?php if ( has_excerpt() ) : ?>
    <p class="dest-hero__deck" style="position:relative;font-family:var(--font-b);font-size:16px;color:rgba(245,240,230,.78);line-height:1.75;max-width:60ch"><?php echo esc_html( get_the_excerpt() ); ?></p>
    <?php endif; ?>
  </div>
</div>

<div class="page-content entry-content" style="padding:72px 52px 48px;max-width:1100px;margin:0 auto;font-family:var(--font-b);font-size:15px;line-height:1.85;color:var(--text-secondary)">
  <?php the_content(); ?>
</div>

<section class="final-cta" style="background-image:linear-gradient(135deg,rgba(8,15,26,.86),rgba(8,15,26,.55)),url('<?php echo hym_img( 'f-01-teal-lagoon-cta.jpg' ); ?>');background-size:cover;background-position:center">
  <div class="final-cta__inner">
    <div class="final-cta__label">Plan It</div>
    <h2 class="final-cta__title">Want this place done right?</h2>
    <p class="final-cta__sub">Private guides, the right rooms, the right season. Start with a conversation.</p>
    <a class="final-cta__btn" href="<?php echo esc_url( home_url( '/plan-your-trip/' ) ); ?>">Start Planning</a>
  </div>
</section>
    <?php
endwhile;
hym_newsletter();
get_footer();
