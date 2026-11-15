# Family Dashboard

A free, always-on kitchen board for an old Android tablet. It shows what your household needs at a glance: calendars, the commute, bins, buses, fuel prices, notes and dinners. No subscriptions, no home server.

![Evening view](screenshots/evening.png)

| Morning with a route alert | Night mode |
|---|---|
| ![Route alert](screenshots/alert.png) | ![Night](screenshots/night.png) |

## What it shows

- **Clock, date and weather** for up to two places, with frost warnings
- **Today and the week ahead** from Google Calendar, colour-coded per person
- **Commute:** live drive time and a leave-by time (adds extra minutes when it's frosty)
- **Route alerts:** a push notification **only** when a crash or closure means a different route is quicker, with a one-tap Google Maps link. Morning and evening.
- **Bins:** "bins out tonight", worked out from your collection pattern, so it stays out of your calendars
- **Next bus** from your stop (UK)
- **Cheapest fuel** nearby, from the UK government's Fuel Finder data (UK)
- **Formula 1 countdown**
- **Notes and weekly dinners**, from a shared Todoist project, so both of you can add them from your phones
- **Night mode** (23:00–06:30): dimmed clock, moon phase, and a "bins / frost / tomorrow" line

Every section is optional. Anything you don't set up simply doesn't appear, so you can skip the UK-only parts.

## How it works

```
Tablet (Fully Kiosk Browser)
   └─ board page (web/index.html, on GitHub Pages or Netlify)
         └─ every 2 min asks for JSON ─► Google Apps Script (your account, free)
                                            ├─ Google Calendar, Maps (traffic), Tasks
                                            ├─ Open-Meteo (weather), Jolpica (F1)
                                            ├─ TransportAPI (bus), Todoist (notes, dinners)
                                            ├─ ntfy (push alerts)
                                            └─ Supabase relay in London ─► UK Fuel Finder
```

Everything runs on free tiers. Your keys stay in your own Apps Script **Script properties**, never in this repo.

## Quick start (about 15 minutes for the basics)

1. **Copy the script:** create a new project at [script.google.com](https://script.google.com) and add the four files from [`apps-script/`](apps-script).
2. **Edit `Config.gs`:** names, colours, weather places, bin day. Leave anything you don't want empty.
3. **Run `setup`**, then **Deploy → New deployment → Web app** (Execute as: Me, Who has access: Anyone).
4. **Host the page:** see [docs/setup.md](docs/setup.md#4-host-the-board-page).
5. **Set up the tablet:** see [docs/tablet.md](docs/tablet.md).

The full walkthrough is in [docs/setup.md](docs/setup.md). Optional extras (route alerts, bus, fuel, notes and dinners) are in [docs/modules.md](docs/modules.md).

## Make it yours

The look is a dark "enchanted library" theme: parchment panels, gold details and a starry night mode. You can change the colours, icons and artwork, with or without an AI image tool. See [docs/design.md](docs/design.md).

## Docs

- [Setup](docs/setup.md)
- [Tablet and kiosk](docs/tablet.md)
- [Optional modules](docs/modules.md)
- [Customising the design](docs/design.md)
- [Troubleshooting](docs/troubleshooting.md)

## Tested on

Lenovo Tab M10 HD (TB-X505F, Android 10) with Fully Kiosk Browser. Any tablet with an up-to-date Android System WebView should work.

## Licence

MIT. See [LICENSE](LICENSE).
