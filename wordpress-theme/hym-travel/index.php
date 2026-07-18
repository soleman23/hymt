<?php
/**
 * Fallback template.
 *
 * @package hym-travel
 */
get_header();
if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        ?>
        <article <?php post_class( 'page-content' ); ?> style="padding:140px 52px 96px;max-width:900px;margin:0 auto">
          <h1 style="font-family:var(--font-d);font-size:clamp(30px,4.6vw,48px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary);margin-bottom:28px"><?php the_title(); ?></h1>
          <div class="entry-content" style="font-family:var(--font-b);font-size:15px;line-height:1.85;color:var(--text-secondary)">
            <?php the_content(); ?>
          </div>
        </article>
        <?php
    endwhile;
endif;
get_footer();
