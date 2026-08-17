# VentiveMail (static site)

Static HTML/CSS/JS recreation of the VentiveMail Framer landing page — built for faster load times without Framer hosting.

## Pages

| Path | Description |
|------|-------------|
| `index.html` | Main landing page |
| `confirmation.html` | Post-application thank you |
| `privacy-policy.html` | Privacy policy |
| `terms-of-service.html` | Terms of service |
| `disclaimer.html` | Results / guarantee disclaimer |

## Stack

- Plain HTML + CSS + a little JavaScript
- [General Sans](https://www.fontshare.com/) via Fontshare CDN
- Typeform embed (`MXEtbebV`) for applications
- Wistia player for the hero video
- Lazy-loaded YouTube iframes for testimonials / tutorials
- Images currently loaded from Framer’s CDN (`framerusercontent.com`)

## Local preview

```bash
# from this directory
python3 -m http.server 8080
# open http://localhost:8080
```

Or open `index.html` directly in a browser (some embeds may prefer a local server).

## Deploy

Any static host works:

- **Cloudflare Pages** / **Netlify** / **GitHub Pages** / **Vercel** — point at this repo root
- No build step required

## Notes

- CTA buttons open a Typeform modal; the bottom of the homepage also embeds the form inline.
- After Typeform submit, the inline form can redirect to `confirmation.html` (configure redirect in Typeform settings if needed).
- For maximum independence later, download assets from Framer into `/assets` and update image `src`s.
- Legal page copy is a reasonable starter; have counsel review before production use if needed.

## Source design

Recreated from Framer project **Ventivemail (copy)** (`RDaBznfUGuDU9HdKTaWw`).
