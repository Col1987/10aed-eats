# 10 AED Eats — Complete Project Documentation

> The ten-dirham tasting tour. A free, unofficial fan guide to the Dubai
> Summer Surprises 10 AED meal initiative (Mon 3 Aug – Sun 30 Aug 2026).
> Live: https://col1987.github.io/10aed-eats/
> Repo: github.com/Col1987/10aed-eats (public, branch `main`, Pages from `/ (root)`)
> Local workspace: D:\Documents\Projects\10aed-eats (VS Code + Git)

---

## 1. Purpose & scope

- One-month campaign site listing every restaurant serving a 10 AED meal
  during Dubai Summer Surprises (DSS).
- Tap a restaurant → Google Maps opens tuned to the visitor's location:
  chains show nearby branch pins to choose from; single-location spots
  land on the restaurant itself, one tap from directions.
- Deliberately free forever: no framework, no build step, no backend,
  no database, no API keys, no accounts, no analytics.
- Unofficial fan/portfolio project. NOT affiliated with DSS or District
  by Zomato (who publish the official list on the District app).

## 2. Tech stack & hosting

- Plain HTML + CSS + JS, four files, served as-is.
- Hosted free on GitHub Pages (HTTPS automatic; geolocation requires HTTPS).
- Only external request: Google Fonts (Bricolage Grotesque + Manrope).
- Google Maps integration via keyless URL schemes only (see §6).
- Owner account secured with 2FA (authenticator app; recovery codes saved).

## 3. File inventory

| File | Role |
|---|---|
| `index.html` | Page structure, CSP meta tag, meta tags, footer copy |
| `styles.css` | Full design system, components, responsive + reduced-motion rules |
| `app.js` | All logic: geolocation, Maps links, rendering, filters, animations |
| `restaurants.js` | THE data file. Only file edited for list changes |
| `PROJECT.md` | This document |
| `README.md` | Repo placeholder (superseded by this file) |
| `tests/` (optional, UNUSED) | Playwright smoke tests; owner chose not to run them |

### restaurants.js format
One object per line; only `name` required:
`{ name: "Karachi Darbar", cuisine: "Pakistani" }`
- 150 entries, 18 cuisine categories (chips auto-generated with counts).
- Dishes deliberately NOT stored (the 10 AED item varies per branch).
- Two near-duplicate entries kept intentionally as supplied by owner:
  "Green Land" and "Green Land Restaurant".
- Optional advanced pinning: add `lat`/`lng` to an entry to deep-link
  directions to that exact branch, show a live distance tag (haversine)
  and unlock a "Sort: nearest first" button. Currently unused in data.

## 4. Shipped features (final behaviour)

- **Ticker**: scrolling marquee "Dubai Summer Surprises ✷ 10 AED meals ✷
  ١٠ درهم ✷ Eat well, spend less" (pauses on hover).
- **Masthead**: eyebrow tag, display headline "The ten-dirham tasting
  tour.", intro paragraph, location pill, live stats
  ("150 restaurants · 18 cuisines · 1 price"), rotating circular badge
  reading "10 AED · AUG 3–30 · ١٠ درهم · DUBAI · …".
- **Intro (standfirst), exact copy**: "Every spot serving a full meal
  for 10 AED this summer. Tap a name and Google Maps opens tuned to
  where you stand. Chains pin their nearby branches so you can tap the
  closest, and single-location spots land straight on the restaurant,
  one tap from directions."
- **Location pill** states & exact copy:
  - idle: "Location off. Enable it to see what's near you" [+ Enable location]
  - locating: "Finding you..."
  - ready: "Ready · maps tuned to your location · <lat>, <lng>"
  - denied: "Location blocked, showing city-wide results" [+ Retry]
  - failed: "Couldn't get a fix, showing city-wide results" [+ Retry]
  - insecure: "Location needs HTTPS, showing city-wide results"
  - unsupported: "No location support, showing city-wide results"
- **Search + cuisine chips are standalone modes**: typing in search
  resets the chip to All (searches all 150); clicking a chip clears the
  search box. They never combine (deliberate UX decision by owner).
- **Cards**: index number, cuisine tag, name, optional area line, ONE
  action button "Show on Maps" (whole card is a stretched link).
  No dish lines. No "All branches" link (removed on owner request).
- **Empty state** with "Show everything" reset; message ends
  "try another search."
- **Footer** ("Good to know", exact final copy):
  1. "Each tap opens Google Maps tuned to where you stand. Chains pin
     their nearby branches so you can tap the closest, and
     single-location spots land straight on the restaurant, one tap from
     directions. Confirm deals at the door."
  2. "Your location is used only inside your browser to build the Google
     Maps link, it's never stored or sent to anyone."
  3. "An unofficial, free fan guide to the Dubai Summer Surprises
     initiative (3–30 August) - not affiliated with DSS or District by
     Zomato, who publish the official list on the District app. No
     bookings or vouchers needed: just ask for the 10 AED dish at any
     participating outlet."
  Plus foot-line: "Built for <auto year> season · Made with 🌞 in Dubai".

## 5. Design system

- Palette: sun #ffd338 · ink #1c1712 · paper #fffdf4 · coral #e8452c ·
  teal #0e7c66. Festival-poster aesthetic: 2px ink borders, hard offset
  shadows, dotted texture, striped card hover band.
- Type: Bricolage Grotesque (display) + Manrope (body).
- Motion: ticker marquee, spinning badge, staggered card reveals via
  IntersectionObserver, hover lifts; all disabled under
  `prefers-reduced-motion`.
- A11y: aria-live on pill/count, focus-visible outlines, keyboard-safe
  links, 16px input (no iOS zoom).
- Responsive: single-column masthead + compact badge under 760px;
  sticky search/filter bar.
- Owner copy preferences honoured: NO em dashes anywhere in site copy;
  footer paragraphs spaced (`footer p + p { margin-top: .9rem; }`).

## 6. Maps integration (keyless URL schemes)

Primary link per card ("Show on Maps"):
- With location:
  `https://www.google.com/maps/search/<name>/@<lat>,<lng>,14z`
- Without location:
  `https://www.google.com/maps/search/?api=1&query=<name> restaurant, Dubai`
- Pinned entry (if lat/lng ever added):
  `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`

All links `target="_blank" rel="noopener noreferrer"`.

**Behaviour, honestly described:**
- Multi-branch chains: the map opens centred on the visitor at
  neighbourhood zoom with branch pins around them; they tap the closest.
- Single-location spots: Google resolves the unique result and jumps
  straight to the restaurant; the visitor taps Directions from there.
- **KNOWN LIMITATION (accepted):** free Google URLs cannot
  algorithmically pick the single nearest branch of a chain. That needs
  the paid Places API + a backend to protect the key, which violates the
  free/static mandate. Site copy describes both real behaviours and
  never promises auto-nearest routing.

## 7. Security & privacy

- Zero attack surface by design: no server, no secrets, no dependencies.
- Content-Security-Policy meta tag:
  default-src 'self'; script-src 'self';
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com; img-src 'self' data:;
  connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'
- All data fields HTML-escaped before rendering; Map queries
  encodeURIComponent'd; pinned coords validated as numbers.
- Location: permission-based; coords kept only in sessionStorage
  (30-min freshness); never sent to any server; `isSecureContext` checked.
- Public repo = read-only for strangers; only owner can push (2FA).
- Residual, accepted risks: coords appear in the Maps URL (browser
  history); Google Fonts is a third-party request.

## 8. Workflow (update loop)

1. Edit `restaurants.js` (add/delete one-line entries).
2. `git add . && git commit -m "..." && git push`
3. Wait ~60s (GitHub CDN propagation), hard-refresh (Ctrl+Shift+R).
Verify tools: Actions tab (all-green "pages build and deployment" runs =
healthy), raw.githubusercontent.com/Col1987/10aed-eats/main/<file> to see
exactly what's deployed, incognito window for cache bypass, F12 Console
for errors (silent = CSP happy).

## 9. Incident log (everything that broke & how it was fixed)

1. **Nested folder**: files initially inside a subfolder → Pages found
   nothing. Fixed by moving files to repo root; fresh `git init`;
   `git push -u origin main --force` (safe: old history was the broken one).
2. **`fatal: No configured push destination`**: re-init had lost the
   remote. Fixed: `git remote add origin <url>`.
3. **Phone first visit unstyled**: landed mid-deploy propagation window;
   resolved on reload. Rule learned: wait ~60s after push before judging.
4. **Footer didn't update**: edits never saved/committed. Rule learned:
   check the white dot on the VS Code tab; when in doubt, replace whole
   files and re-commit.
5. **0 restaurants + empty pill**: `restaurants.js` clobbered during a
   file swap; app.js crashes at boot without `RESTAURANTS` (also caused
   the missing "2026" year, which is set by JS at boot). Fixed by
   restoring the full data file.
6. **Syntax error scare**: truncated paste / missing final `})();`
   and/or smart quotes. Fixed with clean full-file paste; warning issued
   about curly quotes “ ” breaking JS.
7. **Maps showed all branches (v1)**: `maps/search` lists by design.
8. **Directions guessed wrong branch (v2)**: `maps/dir` with a chain name
   resolves arbitrarily for multi-branch brands (fine only for
   single-branch spots). Owner diagnosed this precisely.
9. **Final (v3)**: centred-map search URL for chains; unique results
   jump to the spot. Limitation accepted; all copy rewritten to match
   reality (no overpromising), including the single-branch case.

## 10. Decision history (chronological)

1. Stack chosen: vanilla static site, GitHub Pages (free, zero maintenance).
2. Full list of 150 restaurants ingested; cuisine tags assigned.
3. Security pass: CSP, privacy line, 2FA, public-repo permissions explained.
4. Footer simplified to single "Good to know" block (dev-facing blocks removed).
5. Dish field removed (varies per branch).
6. Maps v1 → v2 → v3 as in §9; "All branches" link added then removed
   (single action per card).
7. Search/filter made standalone modes.
8. Copy rewrite: honest wording everywhere; badge "ALL SUMMER" replaced
   with real dates "AUG 3–30"; unofficial credit added; em dashes purged;
   footer paragraph spacing added; status-pill dashes swapped.
9. LinkedIn posts drafted (main + short cut), including the AI
   pair-programming line and the unofficial credit.
10. Single-branch accuracy pass: copy updated to describe that unique
    results jump straight to the restaurant; pill reworded
    ("maps tuned to your location"); CTA renamed "Show on Maps" for
    universal accuracy.

## 11. Commit message history (as pushed)

- DSS 10 AED finder: initial build with full restaurant list
- Fix: move site files to repo root so GitHub Pages can find them
- Add Content-Security-Policy and privacy note to index.html
- Replace index.html: simplified footer + CSP
- Deploy nearest-branch directions (app.js + styles.css)
- Restore restaurant data; drop dish field (varies per branch)
- Fix syntax: ensure app.js is complete and quotes are standard
- Update maps: center exactly on user GPS to show nearby branches visually
- UX: search and cuisine filter are now standalone (using one resets the other)
- Reword copy to match real behaviour; single 'Show nearby branches' action per card; standalone search/filter
- Badge shows real dates (Aug 3-30); add unofficial credit to DSS / District by Zomato
- Footer copy: user wording, paragraph spacing, drop em dashes
- Swap remaining em dashes in status pill copy
- Full-file sync: accurate single-branch copy, 'Show on Maps' CTA, updated PROJECT.md

## 12. Explored but NOT implemented (parked options)

- **Custom domain**: free slugs (eatfor10 / dubai10aed) or paid
  (10aed.com, eatfor10.ae…). DNS recipe if ever wanted: CNAME `www` →
  `Col1987.github.io`; apex A records → 185.199.108.153 / .109.153 /
  .110.153 / .111.153; then Enforce HTTPS. Avoid DSS-branded domains
  (trademark).
- **Netlify Drop / Vercel** as alternative hosts (free subdomains like
  eatfor10.netlify.app).
- **Self-hosted fonts** to eliminate the only third-party request.
- **Playwright suite** (tests written; owner opted out).
- **Pinned branches** (lat/lng) for true distance tags + nearest sort.

## 13. Troubleshooting cheat-sheet

| Symptom | Fix |
|---|---|
| 404 / blank site | Files must sit at repo ROOT; Pages source = main / (root) |
| `No configured push destination` | `git remote add origin <url>` then push |
| Push rejected | History diverged; `--force` only when replacing broken history |
| `nothing to commit` | Unsaved tab (white dot) or wrong folder |
| Old content after push | Wait ~60s; hard refresh; incognito; check raw URL + Actions |
| Unstyled first mobile visit | Propagation window; reload |
| 0 restaurants / empty pill | restaurants.js broken; restore data file |
| `Unexpected end of input` | Truncated paste; ensure final `})();` |
| `Invalid or unexpected token` | Curly quotes; use straight quotes |
| No location prompt | Must be https:// or localhost; tap Enable location |
| Maps shows a list | Known free-tier behaviour for chains; by design (v3) |

## 14. Ways of working (owner preferences, honoured)

- Basic step-by-step instructions; full-file replacements over surgical edits.
- Honest capability claims; flag limitations UP FRONT (see §15).
- No em dashes in copy; plain, human wording.
- Free stack only; portfolio/fun framing.

## 15. Lessons learned

- **AI overpromising incident**: the "nearest branch" capability was
  presented as fully achievable on the free stack before the Places-API
  limitation was disclosed. Owner called this out; correction committed:
  constraints get flagged in the first response, with free vs paid
  options laid out honestly.
- Free-tier integrations have hard ceilings; design copy to match real
  behaviour, never the aspiration. Including the subtle case: unique
  search results jump to the spot rather than staying centred.
- A one-month site's best feature is zero maintenance.

---
Built for the 2026 season · Made with 🌞 in Dubai