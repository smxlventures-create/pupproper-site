# PUPPROPER — Website (v1)
**Static HTML/CSS site — preview locally or deploy to Vercel / Netlify / Cloudflare Pages.**

## Pages

| Page | URL | Purpose |
|---|---|---|
| Home | `index.html` | Hero (coral), value props, SKU grid, brand story, comparison teaser, pain-points, full-bleed lineup, press strip |
| Resurrection PDP | `pages/resurrection.html` | Dry shampoo product page — gallery, copy, ingredients, ritual instructions, mini-comparison |
| Confession PDP | `pages/confession.html` | Stain remedy product page — gallery, copy, ingredients, application, mini-comparison |
| The Confessional Bundle | `pages/the-confessional.html` | Bundle PDP — both bottles, gift framing, full-bleed lineup |
| Compare | `pages/comparison.html` | Full "Pupproper vs them" page — dry shampoo table + stain remover table |
| About | `pages/about.html` | Founder story, manifesto, values |

## Brand spec used

Conforms to `brand/07-brand-standards-LOCKED-v3.md`:
- **Wordmark:** custom modern bold rounded sans (Inter 900 / Söhne Breit when licensed)
- **Body:** Söhne / Inter
- **Caps / mono:** JetBrains Mono fallback
- **Color tokens:** Coral `#FF6F61` · Sage `#6CC24A` · Ink `#1A1A1A` · Cream `#F2EBDD` · Amber `#A4632F` · Ochre `#C8956D`

## To preview locally

```bash
cd /Users/spencerlampkin/Claude/Pupproper/website
python3 -m http.server 8080
# open http://localhost:8080
```

## To deploy

### Vercel (fastest)
```bash
npx vercel
```
Drop the `website/` folder, framework: "Other," output: same folder.

### Cloudflare Pages
- Upload the folder via dashboard
- No build command needed

### Shopify Dawn (port path)
1. Use the design tokens in `assets/css/main.css` as your `base.css` overrides
2. Recreate each page as a Shopify section + template
3. Wire up actual product objects (currently buttons are static "Add to bag")

## Image references

All product / creative / logo images reference `../images/*` (or `../../images/*` from `pages/`). Folder structure stays portable.

## What's intentionally NOT in v1

- No cart functionality (buttons are static)
- No checkout
- No Shopify integration
- No email signup form backend (use a Klaviyo embed when ready)
- No animation framework (CSS-only, fade-in classes available but not wired to IntersectionObserver — add 5-line JS if desired)
- No CMS
- No blog / journal yet (link placeholders in nav)
- No accessibility audit yet — basic semantic HTML used, no full WCAG pass

## Spencer's queue

- [ ] Preview locally and review copy
- [ ] Swap placeholder "press strip" with real placements as they land
- [ ] Wire to Klaviyo for email capture (free tier)
- [ ] Move to Shopify Dawn when ready to take orders (defer until 50-unit hand-bottled inventory is ready)
- [ ] Add Plausible / Fathom Analytics (privacy-first, $9/mo) before launching Meta ads — need pixel + conversion tracking
- [ ] Add Meta pixel before launching ads
