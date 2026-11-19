# Sandrine Ojong — Portfolio

A hand-built, editorial portfolio site for **Sandrine Ojong** — Mastercard Foundation
Scholar, social entrepreneur, and education advocate.

The design follows the provided Stitch reference (`Editorial Diplomat`) and borrows
its pacing from warm, long-form storytelling sites: a linen canvas, Newsreader serif
display type, IBM Plex Sans for interface text, hairline rules, and a single lime
accent used like a highlighter.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero, logo marquee, about intro, field notes, manifesto, impact metrics, current work, moments gallery, affiliations, contact form |
| `about.html` | Full story and bio, work timeline, UNESCO feature, principles, photo gallery, recognition |
| `contact.html` | Inquiry form, direct contact card with copy-email, social links, FAQ |

## Structure

```
.
├── index.html
├── about.html
├── contact.html
├── assets/
│   ├── css/styles.css      # design tokens + all layout
│   ├── js/main.js          # menu, reveal, counters, filters, lightbox, form
│   ├── favicon.svg
│   └── images/
│       ├── home/           # optimized WebP photography
│       ├── about/
│       └── logos/
└── scripts/
    ├── check_site.py       # static link / duplicate-id check
    └── optimize_images.py  # regenerates WebP assets from local source folders
```

## Preview locally

From the repository root:

```powershell
python -m http.server 8000
```

Then open <http://127.0.0.1:8000/>.

Do not open the HTML files directly with `file://` — relative asset paths and the
`dialog` interactions are best tested over HTTP.

## Interactions

- **Mobile menu** — native `<dialog>`, focus-managed, closes on link click or Escape.
- **Gallery filters** — filter by classroom, community, UNESCO, portrait.
- **Lightbox** — click or keyboard-activate any photo; arrow keys move between the
  currently filtered set; Escape closes.
- **Metrics** — count up once when scrolled into view (respects reduced motion).
- **Copy email** — copies the address and confirms inline.
- **Contact form** — client-side validation, then opens the visitor's mail app with a
  prefilled message to `sandrineojongayuktabong@gmail.com`. There is no server, so no
  data is stored.

## Editing content

All copy is plain HTML inside the three pages. Design tokens live at the top of
`assets/css/styles.css` (`:root`); changing `--paper`, `--ink`, `--lime`, and the two
font families will re-theme the whole site.

To add a photo to a gallery, copy the WebP into `assets/images/…`, then duplicate a
`<figure class="gallery__item" data-gallery-item …>` block and set `data-cat`,
`data-title`, `data-full`, and the `<img src>`.

## Assets

Photography and logos were converted to WebP (max ~1800 px, quality 80) with
`scripts/optimize_images.py`. The original source folders are intentionally ignored by
git to keep the repository small; the published site only needs `assets/images/`.

## Checks

```powershell
python scripts\check_site.py
```

Verifies local `src`/`href` targets exist and no page has duplicate `id` attributes.

## Deploying

The site is fully static. On GitHub, enable **Settings → Pages → Deploy from a branch**
and select `main` / `/ (root)`. No build step is required.

## Credits

Design and build: custom, based on Sandrine Ojong's Stitch design reference.
Typefaces: [Newsreader](https://fonts.google.com/specimen/Newsreader) and
[IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) via Google Fonts.
