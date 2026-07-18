<?php
/**
 * Template helpers for Hit Your Mark Travel.
 *
 * @package hym-travel
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** Theme image URI helper. */
function hym_img( $file ) {
    return esc_url( HYM_URI . '/assets/img/' . $file );
}

/** Breadcrumb matching the static design. */
function hym_breadcrumb( $trail = array() ) {
    echo '<div class="breadcrumb"><div class="breadcrumb__inner">';
    echo '<a class="breadcrumb__link" href="' . esc_url( home_url( '/' ) ) . '">Home</a>';
    foreach ( $trail as $crumb ) {
        echo '<span class="breadcrumb__sep">&rsaquo;</span>';
        if ( ! empty( $crumb['url'] ) ) {
            echo '<a class="breadcrumb__link" href="' . esc_url( $crumb['url'] ) . '">' . esc_html( $crumb['label'] ) . '</a>';
        } else {
            echo '<span class="breadcrumb__current">' . esc_html( $crumb['label'] ) . '</span>';
        }
    }
    echo '</div></div>';
}

/** Newsletter signup section (Web3Forms — replace the placeholder key). */
function hym_newsletter() {
    $key = get_option( 'hym_web3forms_key', 'YOUR_WEB3FORMS_KEY' );
    ?>
<section class="newsletter">
  <div class="newsletter__inner">
    <div class="newsletter__label">Travel Notes</div>
    <h2 class="newsletter__title">Travel notes worth opening.</h2>
    <p class="newsletter__sub">Occasional dispatches on places, seasons, and the art of doing them properly. No noise.</p>
    <form class="newsletter__form" action="https://api.web3forms.com/submit" method="POST">
      <input type="hidden" name="access_key" value="<?php echo esc_attr( $key ); ?>">
      <input type="hidden" name="subject" value="Newsletter signup — hymtravel.com">
      <input type="checkbox" name="botcheck" class="hidden" style="display:none">
      <input class="newsletter__input" type="email" name="email" placeholder="Your email address" required>
      <button class="newsletter__btn" type="submit">Subscribe</button>
    </form>
  </div>
</section>
    <?php
}

/** Register the Web3Forms key setting in Settings → General. */
add_action( 'admin_init', function () {
    register_setting( 'general', 'hym_web3forms_key', array(
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => 'YOUR_WEB3FORMS_KEY',
    ) );
    add_settings_field( 'hym_web3forms_key', 'Web3Forms Access Key', function () {
        $v = get_option( 'hym_web3forms_key', 'YOUR_WEB3FORMS_KEY' );
        echo '<input type="text" id="hym_web3forms_key" name="hym_web3forms_key" value="' . esc_attr( $v ) . '" class="regular-text">';
        echo '<p class="description">Free key from web3forms.com — used by all inquiry and newsletter forms.</p>';
    }, 'general' );
} );
