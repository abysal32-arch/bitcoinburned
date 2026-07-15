# Self-hosted fonts — license notes

All four families below are licensed under the **SIL Open Font License, Version 1.1**
(<https://scripts.sil.org/OFL>), which permits redistribution, embedding, and self-hosting
of the font files. The `.woff2` files in this directory are the **latin subset** as served
by Google Fonts, self-hosted here so the site loads **zero third-party resources**
(privacy + true offline use). No fonts are modified.

| Family | Files | Weights | Copyright / Author |
|--------|-------|---------|--------------------|
| **Space Grotesk** | `space-grotesk.woff2` (variable) | 500–700 | © Florian Karsten — SIL OFL 1.1 |
| **IBM Plex Sans** | `ibm-plex-sans.woff2` (variable) | 400–600 | © IBM Corp., designed by Mike Abbink with Bold Monday — SIL OFL 1.1 |
| **IBM Plex Mono** | `ibm-plex-mono-400.woff2`, `-500.woff2`, `-600.woff2` (static) | 400 / 500 / 600 | © IBM Corp., designed by Mike Abbink with Bold Monday — SIL OFL 1.1 |
| **Newsreader** | `newsreader.woff2` (variable, roman), `newsreader-400-italic.woff2` | 400–600 + 400 italic | © Production Type (production.type) — SIL OFL 1.1 |

## Where each is used

- **Homepage** (`/index.html`): Space Grotesk (headings), IBM Plex Sans (body), IBM Plex Mono (labels/code).
- **Burn tool** (`/tool/index.html`): Newsreader (display), IBM Plex Sans (body), IBM Plex Mono (labels/PSBT).

## Full license text

The complete SIL OFL 1.1 text applies to each family and is available at
<https://openfontlicense.org>. Each family's upstream repository ships its own `OFL.txt`:

- Space Grotesk — <https://github.com/floriankarsten/space-grotesk>
- IBM Plex — <https://github.com/IBM/plex>
- Newsreader — <https://github.com/productiontype/Newsreader>

## Regenerating (reproducible)

These files were fetched from the Google Fonts CSS2 API (latin subset only) during task-06.
To refresh, re-request the same families/weights with a modern-browser User-Agent, keep only
the `/* latin */` `@font-face` blocks, and download each `src` `.woff2`.
