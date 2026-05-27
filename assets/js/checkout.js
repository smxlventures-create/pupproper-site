/* PUPPROPER — Stripe Payment Links shim
 * Any element with [data-buy="resurrection|confession|bundle"] opens the matching Stripe URL in a new tab.
 * Until URLs are configured, shows a quiet "checkout pending" notice.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var cfg = window.PUPPROPER_CONFIG || {};
    var map = {
      resurrection: cfg.STRIPE_RESURRECTION,
      confession: cfg.STRIPE_CONFESSION,
      bundle: cfg.STRIPE_BUNDLE
    };

    document.querySelectorAll('[data-buy]').forEach(function (el) {
      var sku = el.getAttribute('data-buy');
      var url = map[sku];

      el.addEventListener('click', function (e) {
        e.preventDefault();
        if (url && url.indexOf('REPLACE_ME') !== 0) {
          // Fire Meta Pixel InitiateCheckout if pixel is loaded
          if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
              content_name: sku,
              content_category: 'Pupproper',
              currency: 'USD'
            });
          }
          window.open(url, '_blank', 'noopener');
        } else {
          // Friendly fallback while we're still wiring checkout
          var msg = 'Checkout is being finalized today — join the waitlist below and we\'ll send you the first invitation.';
          var existing = document.getElementById('pp-checkout-notice');
          if (existing) { existing.remove(); }
          var notice = document.createElement('div');
          notice.id = 'pp-checkout-notice';
          notice.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#F2EBDD;padding:14px 20px;border-radius:999px;font-family:inherit;font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.18);z-index:100;max-width:90vw;';
          notice.textContent = msg;
          document.body.appendChild(notice);
          setTimeout(function () { if (notice) notice.remove(); }, 5000);
        }
      });
    });
  });
})();
