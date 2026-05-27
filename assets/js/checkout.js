/* PUPPROPER — Stripe Payment Links shim
 * Any element with [data-buy="resurrection|confession|bundle"] opens the matching Stripe URL.
 * Fires AddToCart immediately, then InitiateCheckout when Stripe opens.
 * Falls back to a quiet notice if Payment Links haven't been wired in config.js yet.
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
      confession:   cfg.STRIPE_CONFESSION,
      bundle:       cfg.STRIPE_BUNDLE
    };

    var SKU_DATA = window.PUPPROPER_SKU_DATA || {
      resurrection: { name: 'Resurrection Dry Wash', value: 36.00, currency: 'USD', id: 'PP-RES-001' },
      confession:   { name: 'Confession Stain Remedy', value: 28.00, currency: 'USD', id: 'PP-CON-001' },
      bundle:       { name: 'The Confessional Bundle', value: 58.00, currency: 'USD', id: 'PP-BUNDLE-001' }
    };

    function emit(event, params) {
      if (window.fbq) { try { window.fbq('track', event, params); } catch (e) {} }
      if (window.gtag) {
        // map Meta events to GA4 ecommerce names
        var gaName = { AddToCart: 'add_to_cart', InitiateCheckout: 'begin_checkout' }[event] || event;
        try { window.gtag('event', gaName, params); } catch (e) {}
      }
      if (window.plausible) { try { window.plausible(event); } catch (e) {} }
    }

    document.querySelectorAll('[data-buy]').forEach(function (el) {
      var sku = el.getAttribute('data-buy');
      var url = map[sku];
      var d   = SKU_DATA[sku];

      // Mirror the Stripe URL onto the element so tracking.js can detect outbound clicks
      if (url && url.indexOf('REPLACE_ME') !== 0 && el.tagName === 'A') {
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }

      el.addEventListener('click', function (e) {
        // Fire AddToCart — the user expressed intent
        if (d) {
          emit('AddToCart', {
            content_name: d.name,
            content_ids: [d.id],
            content_type: 'product',
            value: d.value,
            currency: d.currency,
            num_items: 1
          });
        }

        if (url && url.indexOf('REPLACE_ME') !== 0) {
          // Stripe URL is wired — fire InitiateCheckout + open
          if (d) {
            emit('InitiateCheckout', {
              content_name: d.name,
              content_ids: [d.id],
              value: d.value,
              currency: d.currency,
              num_items: 1
            });
          }
          // If it's not already an <a> with href, open programmatically
          if (el.tagName !== 'A') {
            e.preventDefault();
            window.open(url, '_blank', 'noopener');
          }
        } else {
          // Payment Links not configured yet — friendly fallback
          e.preventDefault();
          var msg = 'Checkout is being finalized — join the waitlist below and we\'ll send you the first invitation.';
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
