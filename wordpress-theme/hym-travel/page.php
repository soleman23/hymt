<?php
/**
 * Default page template — renders editor content in the design system.
 *
 * @package hym-travel
 */
get_header();
while ( have_posts() ) : the_post();
    $hero_img = get_the_post_thumbnail_url( get_the_ID(), 'hym-hero' );
    ?>
    <div class="page-hero">
      <div class="page-hero__bg"<?php if ( $hero_img ) : ?> style="background-image:url('<?php echo esc_url( $hero_img ); ?>');background-size:cover;background-position:center"<?php endif; ?>></div>
      <div class="page-hero__overlay"></div>
      <div class="page-hero__inner">
        <h1 class="page-hero__title"><?php the_title(); ?></h1>
      </div>
    </div>
    <div class="page-content" style="padding:72px 52px 96px;max-width:860px;margin:0 auto">
      <div class="entry-content" style="font-family:var(--font-b);font-size:15px;line-height:1.85;color:var(--text-secondary)">
        <?php the_content(); ?>
      </div>
    </div>
    <?php
endwhile;
get_footer();
