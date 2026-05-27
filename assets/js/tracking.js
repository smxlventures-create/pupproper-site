/* PUPPROPER — Unified conversion tracking
 * Fires the right events to Meta Pixel + GA4 + Plausible for every funnel step.
 * Drop this on every page after config.js. checkout.js handles AddToCart + InitiateCheckout.
 *
 * Events emitted:
 *   PageView         — automatic on every page (Meta + GA4 + Plausible)
 *   ViewContent      — on PDP load (Resurrection / Confession / Bundle)
 *   AddToCart        — when [data-buy] is clicked (fired from checkout.js)
 *   InitiateCheckout — when Stripe Payment Link opens (fired from checkout.js)
 *   Purchase         — on /thank-you?sku=X&value=Y page load (Stripe redirect)
 *   Lead             — when an email is submitted to a form[data-form="newsletter"]
 *
 * SKU → value map (matches Stripe Payment Link prices):
 *   resurrection $36 · confession $28 · bundle $58
 */
(function () {
  var SKU_DATA = {
    resurrection: { name: 'Resurrection Dry Wash', value: 36.00, currency: 'USD', id: 'PP-RES-001' },
    confession:   { name: 'Confession Stain Remedy', value: 28.00, currency: 'USD', id: 'PP-CON-001' },
    bundle:       { name: 'The Confessional Bundle', value: 58.00, currency: 'USD', id: 'PP-BUNDLE-001' }
  };

  // Expose so checkout.js + other scripts can use the same map
  window.PUPPROPER_SKU_DATA = SKU_DATA;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // -------- Meta Pixel helper --------
  function fbqTrack(event, params) {
    if (window.fbq) {
      try { window.fbq('track', event, params || {}); } catch (e) {}
    }
  }

  // -------- GA4 helper --------
  function gaEvent(name, params) {
    if (window.gtag) {
      try { window.gtag('event', name, params || {}); } catch (e) {}
    }
  }

  // -------- Plausible helper --------
  function plausibleEvent(name, props) {
    if (window.plausible) {
      try { window.plausible(name, props ? { props: props } : undefined); } catch (e) {}
    }
  }

  // Unified emit — sends to all 3 platforms at once
  function emit(name, metaParams, gaParams, plausibleProps) {
    fbqTrack(name, metaParams);
    gaEvent(name, gaParams);
    plausibleEvent(name, plausibleProps);
  }

  ready(function () {
    // ============================================================
    // 1. ViewContent — detect PDP via body data attribute or URL path
    // ============================================================
    var pageSku = document.body.getAttribute('data-pdp');
    if (!pageSku) {
      // Fallback: detect from URL path
      var path = window.location.pathname.toLowerCase();
      if (path.indexOf('resurrection') > -1) pageSku = 'resurrection';
      else if (path.indexOf('confession') > -1) pageSku = 'confession';
      else if (path.indexOf('confessional') > -1) pageSku = 'bundle';
    }

    if (pageSku && SKU_DATA[pageSku]) {
      var d = SKU_DATA[pageSku];
      emit('ViewContent',
        { content_name: d.name, content_ids: [d.id], content_type: 'product', value: d.value, currency: d.currency },
        { items: [{ item_id: d.id, item_name: d.name, price: d.value, quantity: 1 }], currency: d.currency, value: d.value },
        { sku: pageSku }
      );
    }

    // ============================================================
    // 2. Purchase — fired from /thank-you?sku=X&value=Y
    // ============================================================
    if (window.location.pathname.indexOf('thank-you') > -1 || window.location.pathname.indexOf('order-success') > -1) {
      var qs = new URLSearchParams(window.location.search);
      var sku = qs.get('sku') || qs.get('product');
      var orderId = qs.get('session_id') || qs.get('order_id') || ('PP-' + Date.now());
      if (sku && SKU_DATA[sku]) {
        var pd = SKU_DATA[sku];
        emit('Purchase',
          { content_name: pd.name, content_ids: [pd.id], content_type: 'product', value: pd.value, currency: pd.currency, num_items: 1 },
          { transaction_id: orderId, items: [{ item_id: pd.id, item_name: pd.name, price: pd.value, quantity: 1 }], currency: pd.currency, value: pd.value },
          { sku: sku, value: pd.value, order_id: orderId }
        );
      }
    }

    // ============================================================
    // 3. Lead — email captured from newsletter / waitlist form
    // ============================================================
    document.querySelectorAll('form[data-form="newsletter"], form[data-form="waitlist"]').forEach(function (form) {
      form.addEventListener('submit', function () {
        emit('Lead',
          { content_name: 'Newsletter signup', content_category: 'Email capture' },
          { method: 'newsletter' },
          { source: form.getAttribute('data-form') }
        );
      });
    });

    // ============================================================
    // 4. Outbound click tracking — for buy buttons that go to Stripe
    // ============================================================
    document.querySelectorAll('a[href^="https://buy.stripe.com"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var skuAttr = a.getAttribute('data-buy') || 'unknown';
        var d = SKU_DATA[skuAttr];
        if (d) {
          emit('InitiateCheckout',
            { content_name: d.name, content_ids: [d.id], value: d.value, currency: d.currency, num_items: 1 },
            { items: [{ item_id: d.id, item_name: d.name, price: d.value, quantity: 1 }], currency: d.currency, value: d.value },
            { sku: skuAttr }
          );
        }
      });
    });
  });
})();
