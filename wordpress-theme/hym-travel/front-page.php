<?php
/**
 * Front page.
 *
 * @package hym-travel
 */
get_header();
?>
<!-- ══════════════════════════════════════
     HERO
══════════════════════════════════════ -->
<section class="hero" id="hero">
  <div class="hero__bg hero__slide is-active" style="background-image:url('<?php echo hym_img( 'h-01-maldives-aerial.jpg' ); ?>');background-size:cover;background-position:center"></div>
  <div class="hero__bg hero__slide" style="background-image:url('<?php echo hym_img( 'h-02-bora-bora-dawn.jpg' ); ?>');background-size:cover;background-position:center"></div>
  <div class="hero__bg hero__slide" style="background-image:url('<?php echo hym_img( 'h-03-seychelles-granite.jpg' ); ?>');background-size:cover;background-position:center"></div>
  <div class="hero__bg hero__slide" style="background-image:url('<?php echo hym_img( 'h-04-amalfi-golden-hour.jpg' ); ?>');background-size:cover;background-position:center"></div>
  <img src="<?php echo esc_url( HYM_URI . '/assets/logo.png' ); ?>" class="hero__watermark" alt="" aria-hidden="true">
  <div class="hero__overlay"></div>

  <div class="hero__content">
    <div class="hero__left">
      <div class="hero__eyebrow label">Dream It. Aim It. Book It.</div>
      <h1 class="hero__headline">Journeys Worth<br>Every Detail</h1>
      <p class="hero__body">A lifetime of experience, a global network, and someone who actually picks up the phone. That's Hit Your Mark Travel.</p>
      <a href="#contact" class="hero__cta">Plan My Trip &nbsp;→</a>
    </div>
    <div class="hero__right">
      <div class="hero__stat">
        <div class="hero__stat-num">20+</div>
        <div class="hero__stat-desc">Years designing<br>exceptional journeys</div>
      </div>
      <div class="hero__stat">
        <div class="hero__stat-num">6</div>
        <div class="hero__stat-desc">Continents covered —<br>and every one revisited</div>
      </div>
      <div class="hero__stat">
        <div class="hero__stat-num">100%</div>
        <div class="hero__stat-desc">Personalized — no two<br>itineraries are alike</div>
      </div>
    </div>
  </div>

  <div class="hero__scroll">
    <span class="hero__scroll-label">Scroll</span>
    <div class="hero__scroll-line"></div>
  </div>
  <div class="hero__dots">
    <button class="hero__dot is-active" aria-label="Slide 1"></button>
    <button class="hero__dot" aria-label="Slide 2"></button>
    <button class="hero__dot" aria-label="Slide 3"></button>
    <button class="hero__dot" aria-label="Slide 4"></button>
  </div>
</section>


<!-- ══════════════════════════════════════
     BRAND STATEMENT
══════════════════════════════════════ -->
<section class="statement">
  <div class="statement__inner">
    <div class="label" style="margin-bottom:20px">Our Approach</div>
    <p class="statement__quote">
      "Booking engines sell inventory.<br>
      <em>We design journeys.</em>"
    </p>
    <p class="statement__body">
      A global network that gets our clients perks, access, and experiences simply not available any other way. 
      We don't pitch and we don't oversell. We know what we're talking about — and when you're 
      spending real money on real travel, that distinction matters.
    </p>
    <a href="#categories" class="statement__cta-link">
      Explore Destinations &nbsp;→
    </a>
  </div>
</section>


<!-- ══════════════════════════════════════
     TRIP CATEGORIES
══════════════════════════════════════ -->
<section class="categories" id="categories">
  <div class="categories__header">
    <div class="label" style="margin-bottom:12px">What We Do Best</div>
    <h2 style="font-family:var(--font-d);font-size:clamp(26px,3vw,38px);font-weight:700;letter-spacing:-.02em;color:var(--text-primary);line-height:1.1">Every journey, precisely placed.</h2>
  </div>

  <div class="categories__grid">

    <!-- Safaris — large 2×2 -->
    <div class="cat-card cat-card--large">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-11-elephant-herd-aerial.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Africa &amp; Beyond</div>
        <div class="cat-card__name">Safari &amp; Wildlife</div>
      </div>
    </div>

    <!-- Honeymoons -->
    <div class="cat-card">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-13-champagne-overwater-deck.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Romance</div>
        <div class="cat-card__name">Honeymoons</div>
      </div>
    </div>

    <!-- Cruises -->
    <div class="cat-card">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-07-yacht-cove.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Sea &amp; River</div>
        <div class="cat-card__name">Cruises &amp; Yachts</div>
      </div>
    </div>

    <!-- Villas — wide 2×1 -->
    <div class="cat-card cat-card--wide">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-06-tuscan-landscape.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Europe</div>
        <div class="cat-card__name">Villas &amp; Private Estates</div>
      </div>
    </div>

    <!-- Family -->
    <div class="cat-card">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-15-children-shallow-water.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Multigenerational</div>
        <div class="cat-card__name">Family Luxury</div>
      </div>
    </div>

    <!-- Ski -->
    <div class="cat-card">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-22-heli-ski-landing.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Winter</div>
        <div class="cat-card__name">Ski &amp; Mountain</div>
      </div>
    </div>

    <!-- Motorsport -->
    <div class="cat-card">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-21-clifftop-golf.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Sport &amp; Access</div>
        <div class="cat-card__name">F1 &amp; Championship Golf</div>
      </div>
    </div>

    <!-- Hidden Gems -->
    <div class="cat-card">
      <div class="cat-card__ph" style="background-image:url('<?php echo hym_img( 'e-19-secret-sea-cave.jpg' ); ?>');background-size:cover;background-position:center"></div>
      <div class="cat-card__overlay"></div>
      <div class="cat-card__body">
        <div class="cat-card__cat">Bespoke</div>
        <div class="cat-card__name">Hidden Gems</div>
      </div>
    </div>

  </div>
</section>


<!-- ══════════════════════════════════════
     FEATURED JOURNEY
══════════════════════════════════════ -->
<section class="featured">
  <div class="featured__grid">
    <div class="featured__image" style="background-image:url('<?php echo hym_img( 'e-16-safari-vehicle-sunrise.jpg' ); ?>');background-size:cover;background-position:center"></div>
    <div class="featured__content">
      <div class="label" style="margin-bottom:16px">Featured Journey</div>
      <h3 class="featured__title">Botswana,<br>Before the Crowd</h3>
      <p class="featured__body">
        Moremi Game Reserve in shoulder season — when the herds are still there 
        and the camps are running at half capacity. The version worth booking is 
        not the one you'll find on a search results page.
      </p>
      <p class="featured__body" style="margin-bottom:0">
        Your guide has been here for twenty years. He knows where the leopard 
        sleeps and which waterhole the elephants prefer at dusk. That knowledge 
        is not available on a booking engine.
      </p>
      <div class="featured__detail">
        <div class="featured__detail-item">
          <label>Region</label>
          <span>Southern Africa</span>
        </div>
        <div class="featured__detail-item">
          <label>Category</label>
          <span>Safari &amp; Wildlife</span>
        </div>
        <div class="featured__detail-item">
          <label>Best Season</label>
          <span>May – October</span>
        </div>
      </div>
      <a href="#contact" class="featured__cta">Plan My Trip &nbsp;→</a>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════
     PROCESS
══════════════════════════════════════ -->
<section class="process" id="process-section">
  <div class="process__header">
    <div class="label" style="margin-bottom:14px">How It Works</div>
    <h2 class="process__title">Dream It. Aim It. Book It.</h2>
    <p class="process__sub">No forms, no algorithms, no guesswork. Just a direct conversation with someone who knows what you're after — and how to get it.</p>
  </div>
  <div class="process__steps">
    <div class="process__step">
      <div class="process__step-num">01</div>
      <div class="process__step-label label">Dream</div>
      <h3 class="process__step-name">Tell me what you're after</h3>
      <p class="process__step-body">
        Not just the destination — the feeling. The kind of dinner table you want, 
        whether you want silence or a city, what your ideal morning looks like. 
        The more honest you are, the better the trip.
      </p>
    </div>
    <div class="process__step">
      <div class="process__step-num">02</div>
      <div class="process__step-label label">Aim</div>
      <h3 class="process__step-name">We zero in on the right fit</h3>
      <p class="process__step-body">
        Through a global network of properties, guides, and access that most travelers 
        never see, we match your vision to specific places, rooms, and experiences 
        that actually deliver. No generic itineraries.
      </p>
    </div>
    <div class="process__step">
      <div class="process__step-num">03</div>
      <div class="process__step-label label">Book</div>
      <h3 class="process__step-name">Arrive. Everything is handled.</h3>
      <p class="process__step-body">
        Every reservation, transfer, table, guide, and contingency — confirmed 
        and documented before you leave. The only thing left is the experience itself. 
        That's the part we can't do for you. Fortunately, it's the best part.
      </p>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════
     TESTIMONIALS
══════════════════════════════════════ -->
<section class="testimonials">
  <div class="testimonials__header">
    <div class="label" style="margin-bottom:14px">What Clients Say</div>
    <h2 class="testimonials__title">Journeys remembered<br>long after the return flight</h2>
  </div>
  <div class="testimonials__grid">
    <div class="testimonial-card">
      <p class="testimonial-card__text">
        "Mark's bookings were completely accurate, made promptly and well-communicated. 
        He provided all the information we needed and had wonderful recommendations 
        for our time in the Willamette Valley. We would not hesitate to book through Mark again."
      </p>
      <div class="testimonial-card__name">Brian S.</div>
      <div class="testimonial-card__trip">Oregon Wine Country</div>
    </div>
    <div class="testimonial-card">
      <p class="testimonial-card__text">
        "We told him we wanted something we couldn't find ourselves. He sent us to a 
        place we hadn't heard of, with a guide who'd spent thirty years there, and a 
        villa that hadn't been in a magazine yet. It was exactly right."
      </p>
      <div class="testimonial-card__name">Client Testimonial</div>
      <div class="testimonial-card__trip">Placeholder — add your own</div>
    </div>
    <div class="testimonial-card">
      <p class="testimonial-card__text">
        "Every detail was handled. The car was there when we landed. The table at dinner 
        was the right one. The hotel room was exactly what we'd described. We didn't 
        solve a single logistical problem the entire trip."
      </p>
      <div class="testimonial-card__name">Client Testimonial</div>
      <div class="testimonial-card__trip">Placeholder — add your own</div>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════
     INSTAGRAM
══════════════════════════════════════ -->
<section class="instagram" id="instagram-section">
  <div class="instagram__header">
    <div>
      <div class="label" style="margin-bottom:8px">Follow the Journey</div>
      <h2 class="instagram__handle"><span>@</span>travelwithsoleman</h2>
    </div>
    <a href="https://www.instagram.com/travelwithsoleman/" target="_blank" rel="noopener" class="instagram__follow">Follow on Instagram</a>
  </div>
  <div class="instagram__grid">
    <div class="ig-post" style="background-image:url('<?php echo hym_img( 'd-01-maldives-bento.jpg' ); ?>');background-size:cover;background-position:center"><div class="ig-post__overlay"></div></div>
    <div class="ig-post" style="background-image:url('<?php echo hym_img( 'e-01-private-sandbar.jpg' ); ?>');background-size:cover;background-position:center"><div class="ig-post__overlay"></div></div>
    <div class="ig-post" style="background-image:url('<?php echo hym_img( 'e-03-grand-resort-dusk.jpg' ); ?>');background-size:cover;background-position:center"><div class="ig-post__overlay"></div></div>
    <div class="ig-post" style="background-image:url('<?php echo hym_img( 'e-05-positano-alley.jpg' ); ?>');background-size:cover;background-position:center"><div class="ig-post__overlay"></div></div>
    <div class="ig-post" style="background-image:url('<?php echo hym_img( 'e-09-jungle-yoga-pavilion.jpg' ); ?>');background-size:cover;background-position:center"><div class="ig-post__overlay"></div></div>
    <div class="ig-post" style="background-image:url('<?php echo hym_img( 'e-17-tuscan-wine-tasting.jpg' ); ?>');background-size:cover;background-position:center"><div class="ig-post__overlay"></div></div>
  </div>
</section>


<!-- ══════════════════════════════════════
     NEWSLETTER
══════════════════════════════════════ -->



<!-- ══════════════════════════════════════
     FOOTER
══════════════════════════════════════ -->

<style>
.hero__slide{opacity:0;transition:opacity 1.8s ease}
.hero__slide.is-active{opacity:1}
.hero__dots{position:absolute;right:52px;bottom:40px;z-index:2;display:flex;gap:8px}
.hero__dot{width:26px;height:2px;background:rgba(245,240,230,.25);border:none;cursor:pointer;padding:0;transition:background .3s}
.hero__dot.is-active{background:var(--gold-500)}
@media(max-width:900px){.hero__dots{right:28px;bottom:28px}}
</style>
<script>
(function(){
  var slides=[].slice.call(document.querySelectorAll('.hero__slide'));
  var dots=[].slice.call(document.querySelectorAll('.hero__dot'));
  if(slides.length<2)return;
  var i=0,t;
  function go(n){i=n;slides.forEach(function(s,k){s.classList.toggle('is-active',k===n)});dots.forEach(function(d,k){d.classList.toggle('is-active',k===n)});}
  function reset(){clearInterval(t);t=setInterval(function(){go((i+1)%slides.length)},6000);}
  dots.forEach(function(d,k){d.addEventListener('click',function(){go(k);reset();});});
  reset();
})();
</script>
<?php hym_newsletter(); ?>
<?php get_footer();
