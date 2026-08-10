# 10 AED Eats 🌞

**The ten-dirham tasting tour.** A free, unofficial web guide to the Dubai
Summer Surprises 10 AED meal initiative (3 to 30 August 2026).

🔗 Live: https://col1987.github.io/10aed-eats/

During Dubai Summer Surprises, restaurants across the city serve a full
meal for 10 AED. No bookings, no vouchers, just ask for the dish. This
site puts the whole list in your pocket and points you at the closest
branch.

## What it does

- Lists 150 participating restaurants, searchable by name and
  filterable by cuisine.
- Tap a restaurant and Google Maps opens tuned to where you stand:
  - chains pin their nearby branches so you can tap the closest
  - single-location spots land straight on the restaurant, one tap
    from directions
- Works on any device. No app install, no login, no nonsense.
- Your location never leaves your browser. It is only used to build
  the Maps link.

## What it is built with

Four static files. No framework, no build step, no backend, no
database, no API keys, no analytics.

| File | Role |
|---|---|
| `index.html` | Structure, security policy, copy |
| `styles.css` | Design system |
| `app.js` | Geolocation, Maps links, rendering |
| `restaurants.js` | The list. The only file anyone edits |

Hosted free on GitHub Pages. Total running cost: zero.

## The honest bit

Google's free map links cannot algorithmically pick the single nearest
branch of a chain. That needs the paid Places API plus a backend to
protect the key. So instead of pretending, the app opens Maps centred
on you and lets you tap the closest pin. Free stack, honest copy.

## Privacy

- Location is permission-based and lives only in your browser session.
- No cookies, no trackers, no accounts.
- A Content-Security-Policy ships with the page.

## Unofficial

A fan project built for fun and for the portfolio. Not affiliated with
Dubai Summer Surprises or District by Zomato, who publish the official
list on the District app.

## The full story

Decisions, incidents, security notes and lessons learned live in
[PROJECT.md](PROJECT.md).

Built pair-programming with an AI, which is where the honest-limitations
habit came from.