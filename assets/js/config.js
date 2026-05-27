/* PUPPROPER — site config
 * Stripe Payment Link URLs + Meta Pixel ID + analytics keys live here.
 * Replace the REPLACE_ME values when ready, then redeploy.
 */
window.PUPPROPER_CONFIG = {
  // Stripe Payment Links — replace after creating in Stripe dashboard
  STRIPE_RESURRECTION: "REPLACE_ME_STRIPE_RESURRECTION_URL",
  STRIPE_CONFESSION: "REPLACE_ME_STRIPE_CONFESSION_URL",
  STRIPE_BUNDLE: "REPLACE_ME_STRIPE_BUNDLE_URL",

  // Meta Pixel — replace with your pixel ID once Meta Ad Account is set up
  META_PIXEL_ID: "REPLACE_ME_PIXEL_ID",

  // Klaviyo / email — fill once Workspace + Klaviyo are wired
  KLAVIYO_PUBLIC_KEY: "REPLACE_ME_KLAVIYO_KEY",

  // Plausible Analytics domain (set once Plausible is enabled)
  PLAUSIBLE_DOMAIN: "pupproper.com"
};
