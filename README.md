# Avistar Dashboard Portal v2

Static site — no build step. Serve the folder with any web server:

```
npx serve .
```

## Structure
- `index.html` — dashboard portal app
- `Report * - Avistar.dc.html` — printable report pages (Executive Summary, Full Findings, Compliance Mapping)
- `support.js` — page runtime
- `orb-cube.js`, `doc-page.js`, `brand-logo.js` — helpers
- `assets/` — logo, wordmarks, provider logos, icons, mascots, illustrations, patterns, hero embeds

## Deploy (Vercel)
Import repo → Framework preset **Other**, no build command, output directory `.`.
