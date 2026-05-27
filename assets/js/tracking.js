/* PUPPROPER — Unified advanced tracking
 * Fires every key event to Meta Pixel + GA4 + Plausible. Drop on every page after config.js.
 * checkout.js handles AddToCart + InitiateCheckout when buy buttons are clicked.
 *
 * STANDARD EVENTS (Meta-recognized):
 *   PageView         — automatic on every page (loaded by inline Pixel snippet)
 *   ViewContent      — on PDP load (sku data via body[data-pdp])
 *   AddToCart        — when [data-buy] clicked
 *   InitiateCheckout — when Stripe Payment Link opens
 *   Purchase         — on /thank-you?sku=X&session_id=Y (Stripe redirect)
 *   Lead             — when newsletter/waitlist form submits
 *
 * CUSTOM EVENTS (advanced engagement signal):
 *   ScrollDepth_25, _50, _75, _100  — milestones, fired once per page
 *   TimeOnPage_10s, _30s, _60s, _120s — engagement tiers
 *   VideoPlay, VideoComplete         — for autoplay product videos
 *   FAQOpen                          — when a <details> opens
 *   CopyEmail / CopyText             — copy events on email links or shareable text
 *   Search                           — internal search box submit (none yet — reserved)
 *   OutboundClick                    — clicks on non-stripe outbound links
 *
 * META CAPI DEDUPLICATION:
 * Every event includes an event_id (UUID v4) so the server-side Stripe webhook can
 * forward the same event with the same ID and Meta will dedupe browser + server.
 */
(function () {
  var SKU_DATA = {
    resurrection: { name: 'Resurrection Dry Wash', value: 36.00, currency: 'USD', id: 'PP-RES-001' },
    confession:   { name: 'Confession Stain Remedy', value: 28.00, currency: 'USD', id: 'PP-CON-001' },
    bundle:       { name: 'The Confessional Bundle', value: 58.00, currency: 'USD', id: 'PP-BUNDLE-001' }
  };
  window.PUPPROPER_SKU_DATA = SKU_DATA;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // UUID v4-ish generator for event deduplication between Pixel + CAPI
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ---------- Platform emit helpers ----------
  function fbqTrack(event, params, eventId) {
    if (!window.fbq) return;
    try {
      var opts = eventId ? { eventID: eventId } : undefined;
      window.fbq('track', event, params || {}, opts);
    } catch (e) {}
  }

  function fbqTrackCustom(event, params, eventId) {
    if (!window.fbq) return;
    try {
      var opts = eventId ? { eventID: eventId } : undefined;
      window.fbq('trackCustom', event, params || {}, opts);
    } catch (e) {}
  }

  function gaEvent(name, params) {
    if (!window.gtag) return;
    try { window.gtag('event', name, params || {}); } catch (e) {}
  }

  function plausibleEvent(name, props) {
    if (!window.plausible) return;
    try { window.plausible(name, props ? { props: props } : undefined); } catch (e) {}
  }

  // Unified emit for Meta-standard events (with deduplication event_id)
  function emit(name, metaParams, gaParams, plausibleProps) {
    var id = uuid();
    var fullMeta = Object.assign({}, metaParams || {}, { event_id: id });
    fbqTrack(name, fullMeta, id);
    gaEvent(name, gaParams);
    plausibleEvent(name, plausibleProps);
    return id;
  }

  // Unified emit for custom Meta events (engagement signals)
  function emitCustom(name, params) {
    var id = uuid();
    fbqTrackCustom(name, Object.assign({}, params || {}, { event_id: id }), id);
    gaEvent(name, params);
    plausibleEvent(name, params);
  }

  ready(function () {
    // ============================================================
    // 1. ViewContent — PDP detection
    // ============================================================
    var pageSku = document.body.getAttribute('data-pdp');
    if (!pageSku) {
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
    // 2. Purchase — /thank-you?sku=X&session_id=Y
    // ============================================================
    if (window.location.pathname.indexOf('thank-you') > -1 || window.location.pathname.indexOf('order-success') > -1) {
      var qs = new URLSearchParams(window.location.search);
      var sku = qs.get('sku') || qs.get('product');
      var orderId = qs.get('session_id') || qs.get('order_id') || ('PP-' + Date.now());
      if (sku && SKU_DATA[sku]) {
        var pd = SKU_DATA[sku];
        // event_id = session_id so server-side CAPI from Stripe webhook dedupes against this
        var dedupeId = orderId;
        var fullMeta = { content_name: pd.name, content_ids: [pd.id], content_type: 'product', value: pd.value, currency: pd.currency, num_items: 1, event_id: dedupeId };
        fbqTrack('Purchase', fullMeta, dedupeId);
        gaEvent('purchase', { transaction_id: orderId, items: [{ item_id: pd.id, item_name: pd.name, price: pd.value, quantity: 1 }], currency: pd.currency, value: pd.value });
        plausibleEvent('Purchase', { sku: sku, value: pd.value, order_id: orderId });
      }
    }

    // ============================================================
    // 3. Lead — newsletter / waitlist form submit
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
    // 4. Outbound buy clicks (back-up — checkout.js fires the primary)
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

    // ============================================================
    // 5. ScrollDepth — 25/50/75/100% milestones, fired once each
    // ============================================================
    var fired = {};
    function checkScroll() {
      var h = document.documentElement;
      var totalScroll = h.scrollHeight - h.clientHeight;
      if (totalScroll <= 0) return;
      var pct = Math.round((h.scrollTop || window.pageYOffset) / totalScroll * 100);
      [25, 50, 75, 100].forEach(function (m) {
        if (pct >= m && !fired['s' + m]) {
          fired['s' + m] = true;
          emitCustom('ScrollDepth_' + m, { depth: m, page: window.location.pathname });
        }
      });
    }
    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        window.requestAnimationFrame(function () { checkScroll(); scrollTicking = false; });
        scrollTicking = true;
      }
    }, { passive: true });

    // ============================================================
    // 6. TimeOnPage tiers — 10s / 30s / 60s / 120s
    // ============================================================
    [10, 30, 60, 120].forEach(function (sec) {
      setTimeout(function () {
        if (document.visibilityState !== 'hidden') {
          emitCustom('TimeOnPage_' + sec + 's', { seconds: sec, page: window.location.pathname });
        }
      }, sec * 1000);
    });

    // ============================================================
    // 7. Video play + complete tracking
    // ============================================================
    document.querySelectorAll('video').forEach(function (v, idx) {
      var videoId = v.getAttribute('data-video-id') || ('video-' + idx);
      var playedOnce = false;
      v.addEventListener('play', function () {
        if (playedOnce) return;
        playedOnce = true;
        emitCustom('VideoPlay', { video_id: videoId, src: v.currentSrc || '' });
      });
      v.addEventListener('ended', function () {
        emitCustom('VideoComplete', { video_id: videoId });
      });
    });

    // ============================================================
    // 8. FAQ open tracking
    // ============================================================
    document.querySelectorAll('details, .faq-item').forEach(function (el, idx) {
      el.addEventListener('toggle', function () {
        if (el.open || el.hasAttribute('open')) {
          var label = (el.querySelector('summary') || {}).textContent || ('faq-' + idx);
          emitCustom('FAQOpen', { question: label.trim().slice(0, 80) });
        }
      });
    });

    // ============================================================
    // 9. Copy events on email links + ingredient list
    // ============================================================
    document.addEventListener('copy', function () {
      var sel = (window.getSelection && window.getSelection().toString()) || '';
      if (sel.length < 4) return;
      var props = { length: sel.length };
      if (sel.match(/@pupproper\.com/)) {
        emitCustom('CopyEmail', props);
      } else if (sel.toLowerCase().match(/aqua|subtilisin|oryza|lactobacillus/)) {
        emitCustom('CopyIngredient', props);
      } else if (sel.length > 30) {
        emitCustom('CopyText', props);
      }
    });

    // ============================================================
    // 10. Outbound link tracking (non-Stripe)
    // ============================================================
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.indexOf('pupproper.com') > -1) return;
      if (href.indexOf('buy.stripe.com') > -1) return; // already tracked
      a.addEventListener('click', function () {
        emitCustom('OutboundClick', { url: href, label: (a.textContent || '').trim().slice(0, 40) });
      });
    });

    // ============================================================
    // 11. Page unload — total time on page (for true engagement quality)
    // ============================================================
    var startedAt = Date.now();
    window.addEventListener('beforeunload', function () {
      var secondsOnPage = Math.round((Date.now() - startedAt) / 1000);
      // Only fire if user spent at least 5s (filters bounces)
      if (secondsOnPage >= 5) {
        // Use sendBeacon — works during unload, doesn't block navigation
        if (navigator.sendBeacon && window.PUPPROPER_CONFIG && window.PUPPROPER_CONFIG.GA4_MEASUREMENT_ID && window.PUPPROPER_CONFIG.GA4_MEASUREMENT_ID.indexOf('REPLACE_ME') !== 0) {
          // GA4 handles this natively via session_engaged — no need to manually beacon
        }
        try { window.plausible && window.plausible('PageExit', { props: { seconds: secondsOnPage, page: window.location.pathname } }); } catch (e) {}
      }
    });
  });
})();
