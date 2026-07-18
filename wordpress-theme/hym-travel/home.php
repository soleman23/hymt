<?php
/**
 * Journal index (posts page).
 *
 * @package hym-travel
 */
get_header();

$featured = new WP_Query( array( 'posts_per_page' => 1, 'ignore_sticky_posts' => false ) );
?>
<div class="page-hero">
  <div class="page-hero__bg" style="background-image:url('<?php echo hym_img( 'i-01-maldives-season-guide.jpg' ); ?>');background-size:cover;background-position:center"></div>
  <div class="page-hero__overlay"></div>
  <div class="page-hero__inner">
    <div class="page-hero__label">The Travel Journal</div>
    <h1 class="page-hero__title">Notes From the Field</h1>
    <p class="page-hero__sub">Destination intelligence, seasonal timing, and the occasional strong opinion — everything Mark has learned planning journeys properly.</p>
  </div>
</div>

<?php if ( $featured->have_posts() ) : $featured->the_post();
    $fimg = get_the_post_thumbnail_url( get_the_ID(), 'hym-hero' );
    $fcats = get_the_category();
    ?>
<section class="journal-featured">
  <a class="journal-featured__card" href="<?php the_permalink(); ?>">
    <div class="journal-featured__image">
      <div class="journal-featured__image-inner"<?php if ( $fimg ) : ?> style="background-image:url('<?php echo esc_url( $fimg ); ?>');background-size:cover;background-position:center"<?php endif; ?>></div>
    </div>
    <div class="journal-featured__body">
      <div class="journal-featured__meta">
        <span class="journal-featured__cat"><?php echo esc_html( $fcats ? $fcats[0]->name : 'Journal' ); ?></span>
        <span class="journal-featured__dot"></span>
        <span class="journal-featured__date"><?php echo esc_html( get_the_date( 'F Y' ) ); ?></span>
      </div>
      <h2 class="journal-featured__title"><?php the_title(); ?></h2>
      <p class="journal-featured__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 42 ) ); ?></p>
      <span class="journal-featured__cta">Read the Article</span>
    </div>
  </a>
</section>
<?php endif; wp_reset_postdata(); ?>

<?php
$cats = hym_journal_categories();
if ( $cats ) :
    ?>
<div class="journal-filter">
  <div class="journal-filter__inner">
    <button class="journal-filter__chip active" data-filter="all">All Articles</button>
    <?php foreach ( $cats as $cat ) : ?>
    <button class="journal-filter__chip" data-filter="<?php echo esc_attr( $cat->slug ); ?>"><?php echo esc_html( $cat->name ); ?></button>
    <?php endforeach; ?>
  </div>
</div>
<?php endif; ?>

<section class="journal-grid-section">
  <div class="journal-grid">
    <?php
    $skip = get_option( 'page_for_posts' ) ? 0 : 0;
    $paged = max( 1, get_query_var( 'paged' ) );
    $q = new WP_Query( array( 'posts_per_page' => 12, 'paged' => $paged, 'offset' => $paged === 1 ? 1 : 0 ) );
    while ( $q->have_posts() ) : $q->the_post();
        $img = get_the_post_thumbnail_url( get_the_ID(), 'hym-card' );
        $pcats = get_the_category();
        $filter = $pcats ? implode( ' ', wp_list_pluck( $pcats, 'slug' ) ) : '';
        ?>
    <article class="article-card" data-filter="<?php echo esc_attr( $filter ); ?>" onclick="window.location.href='<?php the_permalink(); ?>'">
      <div class="article-card__image">
        <div class="article-card__image-inner"<?php if ( $img ) : ?> style="background-image:url('<?php echo esc_url( $img ); ?>');background-size:cover;background-position:center"<?php endif; ?>></div>
      </div>
      <div class="article-card__body">
        <div class="article-card__meta">
          <span class="article-card__cat"><?php echo esc_html( $pcats ? $pcats[0]->name : 'Journal' ); ?></span>
          <span class="article-card__date"><?php echo esc_html( get_the_date( 'M Y' ) ); ?></span>
        </div>
        <h3 class="article-card__title"><?php the_title(); ?></h3>
        <p class="article-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22 ) ); ?></p>
      </div>
    </article>
    <?php endwhile; ?>
  </div>
  <div class="journal-pagination">
    <?php
    echo paginate_links( array(
        'total'   => $q->max_num_pages,
        'current' => $paged,
        'prev_text' => '&larr;',
        'next_text' => '&rarr;',
    ) );
    wp_reset_postdata();
    ?>
  </div>
</section>
<?php
hym_newsletter();
get_footer();
