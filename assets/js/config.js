/* PUPPROPER — site config
 * All keys + URLs live here so swapping them never requires a code change.
 * Public keys only. NEVER put sk_live_ secret keys here.
 */
window.PUPPROPER_CONFIG = {
  // ─── Stripe Payment Links (PUBLIC — safe to expose) ───
  // LIVE — created via Stripe MCP on 2026-05-27.
  // All three have: shipping (US+CA), promo codes enabled, metadata.sku set, redirect to /thank-you.
  STRIPE_RESURRECTION: "https://buy.stripe.com/28E6oJ8W69BYdsQfW014400",
  STRIPE_CONFESSION:   "https://buy.stripe.com/eVqdRb0pA01o1K88ty14401",
  STRIPE_BUNDLE:       "https://buy.stripe.com/7sYeVfa0a8xU74s7pu14402",

  // Stripe Publishable Key (PUBLIC — safe to expose). Used ONLY if you add Stripe.js Embedded Checkout later.
  // For Payment Links above, this isn't required.
  STRIPE_PUBLISHABLE_KEY: "REPLACE_ME_STRIPE_PK_LIVE",

  // ─── Meta Pixel ───
  META_PIXEL_ID: "REPLACE_ME_PIXEL_ID",

  // ─── GA4 ───
  // LIVE — provisioned 2026-05-27 via Pupproper GA4 property (Stream ID 14956137001)
  GA4_MEASUREMENT_ID: "G-P0690GBYCN",

  // ─── Plausible Analytics (privacy-first, optional) ───
  PLAUSIBLE_DOMAIN: "pupproper.com",

  // ─── Klaviyo (email capture, optional) ───
  KLAVIYO_PUBLIC_KEY: "REPLACE_ME_KLAVIYO_KEY"
};
