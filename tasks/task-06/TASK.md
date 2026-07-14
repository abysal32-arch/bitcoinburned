# task-06 — Assets: favicon, OG/social meta, self-hosted fonts, SEO files, a11y

## Goal
The polish layer: the site gets an identity in tabs/link-previews/search, loses its only external dependency (Google Fonts), and passes a basic accessibility bar.

## Preconditions
tasks 01–05 done. Both pages content-final except live balances (07) and repo links (08).

## Steps
1. **Favicon**: hand-write `assets/favicon.svg` — rounded square, the homepage's ember radial gradient (`#FFA733`→`#E23B18`→`#7A1E0C`) with the 🔥-style flame reading at 16 px (a simple flame path, not the emoji). Link it from both pages (`<link rel="icon" type="image/svg+xml" …>`). Also generate a 180×180 PNG `assets/apple-touch-icon.png` (render the SVG via Preview screenshot or a tiny canvas script — no new npm deps committed).
2. **Meta/OG/Twitter on BOTH pages** (absolute URLs use the final domain `https://bitcoinburned.com/…` from day one):
   - `<meta name="description">` — homepage: registry + provable OP_RETURN burns; tool: build an unsigned burn PSBT, never touches keys.
   - `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card=summary_large_image`.
   - `og:image`: build `assets/og-image.png` (1200×630) — write a throwaway HTML card (dark charcoal, brand mark, "bitcoinburned.com — provably destroyed bitcoin"), screenshot it at exactly 1200×630 via the Preview tools, save the PNG. Keep the throwaway HTML in `tasks/task-06/` (not the site).
3. **Self-host fonts** (privacy + true offline): download woff2s — Space Grotesk 500/600/700, IBM Plex Sans 400/500/600, IBM Plex Mono 400/500/600, Newsreader 400/500/600 + 400-italic — into `assets/fonts/`; add `@font-face` blocks (with `font-display:swap`) to each page's `<style>`; **remove all fonts.googleapis.com/gstatic links** from both pages. These are OFL-licensed — add `assets/fonts/LICENSE-NOTES.md` naming each family + license.
4. **SEO files**: `robots.txt` (allow all, point at sitemap), `sitemap.xml` (two URLs, https://bitcoinburned.com/ and /tool/), `404.html` (minimal, brand-styled, links home — GitHub Pages serves it automatically).
5. **A11y pass** (both pages): one `<h1>` each; landmark roles ok (`nav`/`main`/`footer` exist); every input has a `<label>` (they do — verify); the 🔥 brand-mark div gets `aria-hidden="true"` with text alternative in the wordmark; check contrast of `--muted` (#9C948A) and `--muted-dim` on charcoal — bump if clearly under WCAG AA for body text; visible `:focus-visible` outline on homepage interactive elements (tool page already has one).
6. **Gates**:
   - Disconnect test: with network blocked (or DevTools offline), both pages render with correct fonts from `file://`.
   - No remaining requests to any third-party host on either page (check Preview network tab; the ONLY external calls allowed sitewide before task-07 are none).
   - Favicon shows in tab; `node test/burn.test.js` green.
7. Commit: `task-06: identity assets, self-hosted fonts, SEO files, a11y pass`.

## Do NOT
- Add npm dependencies for image generation.
- Change page copy or layout beyond head-tags, fonts, and a11y attributes.

## Exit criteria
Zero third-party requests; fonts/favicon/OG all in-repo; sitemap/robots/404 present; offline test passes; commit + STATUS updated; Joe told: safe to `/clear`, next = task-07.
