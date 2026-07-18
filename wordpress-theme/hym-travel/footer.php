<?php
/**
 * Theme footer.
 *
 * @package hym-travel
 */
?>
</main>
<footer class="footer">
  <div class="footer__top">
    <div>
      <img src="<?php echo esc_url( HYM_URI . '/assets/logo.png' ); ?>" class="footer__brand-logo" alt="Hit Your Mark Travel" width="64" height="64" loading="lazy">
      <div class="footer__tagline">Hit Your Mark Travel</div>
      <div class="footer__contact">
        <a href="tel:+14085681404">(408) 568-1404</a><br>
        <a href="mailto:mark@hymtravel.com">mark@hymtravel.com</a><br>
        <a href="https://www.hymtravel.com">hymtravel.com</a>
      </div>
    </div>
    <div>
      <div class="footer__col-title">Experiences</div>
      <ul class="footer__links">
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/experiences/beach-island-escapes/' ) ); ?>">Beach &amp; Island Escapes</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/experiences/all-inclusive-vacations/' ) ); ?>">All-Inclusive Vacations</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/experiences/cruises/' ) ); ?>">Cruises &amp; Yachts</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/experiences/wellness-retreat-travel/' ) ); ?>">Wellness &amp; Retreats</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/experiences/safari-wildlife-travel/' ) ); ?>">Safari &amp; Wildlife</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/experiences/romance-celebration-travel/' ) ); ?>">Romance &amp; Celebration</a></li>
      </ul>
    </div>
    <div>
      <div class="footer__col-title">Destinations</div>
      <ul class="footer__links">
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/caribbean-mexico/' ) ); ?>">Caribbean &amp; Mexico</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/europe/' ) ); ?>">Europe</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/africa/' ) ); ?>">Africa</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/asia/' ) ); ?>">Asia</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/south-pacific/' ) ); ?>">South Pacific</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/middle-east/' ) ); ?>">Middle East</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/north-america/' ) ); ?>">North America</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/south-america/' ) ); ?>">South America</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/destinations/polar-regions/' ) ); ?>">Polar Regions</a></li>
      </ul>
    </div>
    <div>
      <div class="footer__col-title">Plan Your Trip</div>
      <ul class="footer__links">
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/plan-your-trip/' ) ); ?>">Start Planning</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/plan-your-trip/?type=group' ) ); ?>">Group Travel Inquiry</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/plan-your-trip/?type=honeymoon' ) ); ?>">Honeymoon Inquiry</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/faq/' ) ); ?>">FAQ</a></li>
      </ul>
    </div>
    <div>
      <div class="footer__col-title">Company</div>
      <ul class="footer__links">
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/about/' ) ); ?>">About Mark</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/about/#process' ) ); ?>">Travel Planning Process</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/travel-journal/' ) ); ?>">Travel Journal</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>">Privacy Policy</a></li>
        <li><a class="footer__link" href="<?php echo esc_url( home_url( '/terms-and-conditions/' ) ); ?>">Terms &amp; Conditions</a></li>
      </ul>
    </div>
  </div>
  <div class="footer__bottom">
    <div class="footer__legal">
      CA Seller of Travel: 2165910-50 &nbsp;&middot;&nbsp; WA Seller of Travel: 605920581 &nbsp;&middot;&nbsp; FL Seller of Travel: ST46122
    </div>
    <div class="footer__copy">Hit Your Mark Travel &copy; <?php echo esc_html( gmdate( 'Y' ) ); ?></div>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
