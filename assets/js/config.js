/* PUPPROPER — site config
 * All keys + URLs live here so swapping them never requires a code change.
 * Public keys only. NEVER put sk_live_ secret keys here.
 */
window.PUPPROPER_CONFIG = {
  // ─── Stripe Payment Links (PUBLIC — safe to expose) ───
  // Create in Stripe Dashboard → Payment Links → New, then paste the URLs here.
  STRIPE_RESURRECTION: "REPLACE_ME_STRIPE_RESURRECTION_URL",
  STRIPE_CONFESSION:   "REPLACE_ME_STRIPE_CONFESSION_URL",
  STRIPE_BUNDLE:       "REPLACE_ME_STRIPE_BUNDLE_URL",

  // Stripe Publishable Key (PUBLIC — safe to expose). Used ONLY if you add Stripe.js Embedded Checkout later.
  // For Payment Links above, this isn't required.
  STRIPE_PUBLISHABLE_KEY: "REPLACE_ME_STRIPE_PK_LIVE",

  // ─── Meta Pixel ───
  META_PIXEL_ID: "REPLACE_ME_PIXEL_ID",

  // ─── GA4 ───
  GA4_MEASUREMENT_ID: "REPLACE_ME_GA4_ID",   // format: G-XXXXXXXXXX

  // ─── Plausible Analytics (privacy-first, optional) ───
  PLAUSIBLE_DOMAIN: "pupproper.com",

  // ─── Klaviyo (email capture, optional) ───
  KLAVIYO_PUBLIC_KEY: "REPLACE_ME_KLAVIYO_KEY"
};
