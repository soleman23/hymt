<?php
/**
 * Single journal article — mirrors the static post design.
 *
 * @package hym-travel
 */
get_header();
while ( have_posts() ) : the_post();
    $hero_img = get_the_post_thumbnail_url( get_the_ID(), 'hym-hero' );
    $cats = get_the_category();
    $cat_name = $cats ? $cats[0]->name : 'Journal';
    $words = str_word_count( wp_strip_all_tags( get_the_content() ) );
    $read = max( 1, (int) ceil( $words / 200 ) );
    ?>
<section class="post-hero">
  <div class="post-hero__bg"<?php if ( $hero_img ) : ?> style="background-image:url('<?php echo esc_url( $hero_img ); ?>');background-size:cover;background-position:center"<?php endif; ?>></div>
  <img src="<?php echo esc_url( HYM_URI . '/assets/logo.png' ); ?>" class="post-hero__watermark" alt="" aria-hidden="true">
  <div class="post-hero__overlay"></div>
  <div class="post-hero__content">
    <div class="post-hero__meta">
      <span class="post-hero__cat"><?php echo esc_html( $cat_name ); ?></span>
      <span class="post-hero__dot"></span>
      <span class="post-hero__date"><?php echo esc_html( get_the_date( 'F Y' ) ); ?></span>
      <span class="post-hero__dot"></span>
      <span class="post-hero__read"><?php echo esc_html( $read ); ?> min read</span>
    </div>
    <h1 class="post-hero__headline"><?php the_title(); ?></h1>
    <?php if ( has_excerpt() ) : ?>
    <p class="post-hero__deck"><?php echo esc_html( get_the_excerpt() ); ?></p>
    <?php endif; ?>
  </div>
</section>

<div class="breadcrumb">
  <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a>
  <span class="breadcrumb__sep">&rsaquo;</span>
  <a href="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>">Travel Journal</a>
  <span class="breadcrumb__sep">&rsaquo;</span>
  <span class="breadcrumb__current"><?php the_title(); ?></span>
</div>

<article class="post-layout">
  <div class="post-byline">
    <div class="post-byline__avatar post-byline__avatar-ph">MS</div>
    <div class="post-byline__info">
      <div class="post-byline__name"><?php echo esc_html( get_the_author() ); ?></div>
      <div class="post-byline__role">Founder &amp; Travel Director</div>
    </div>
  </div>

  <div class="post-body">
    <?php the_content(); ?>
  </div>

  <div class="post-plan-cta">
    <div class="post-plan-cta__body">
      <h3 class="post-plan-cta__title">Ready to see it properly?</h3>
      <p>Mark designs trips like this one — private, unhurried, and built around you. The conversation costs nothing.</p>
    </div>
    <a class="post-plan-cta__btn" href="<?php echo esc_url( home_url( '/plan-your-trip/' ) ); ?>">Start Planning</a>
  </div>
</article>
    <?php
endwhile;
hym_newsletter();
get_footer();
