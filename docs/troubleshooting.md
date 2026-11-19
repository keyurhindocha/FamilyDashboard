# Troubleshooting

These are the problems hit while building this, and the fixes.

**Changed the code but the board shows the old behaviour**
Deploy → Manage deployments → ✏️ → **Version: New version** → Deploy. Clicking Deploy without choosing "New version" keeps the old code live. To see exactly what the board receives, open your board link with `?api=1&k=` instead of `?k=`.

**Board is blank in Fully Kiosk but works in Chrome**
Fully Kiosk uses Android System WebView. Update it via `https://play.google.com/store/apps/details?id=com.google.android.webview` (not the Dev/Beta/Canary versions), then restart the tablet.

**"Sorry, the file you have requested does not exist" (Google Drive page) in the kiosk**
Google's web app pages don't always open inside app browsers. Check that the deployment's **Who has access** is **Anyone**. If it still fails, host the board page on GitHub Pages or Netlify instead ([setup step 4](setup.md#4-host-the-board-page)). That page only fetches data from Google, which works fine.

**Route alerts: ntfy replied 429 "daily message quota reached"**
Anonymous ntfy limits are per internet address, and Google's are shared with everyone. Create a free ntfy account and add `NTFY_TOKEN`. The email backup to `COMMUTER_CALENDAR` still works meanwhile.

**Notes or dinners don't appear**
Notes are kept for 5 minutes and dinners for 10, and the tablet asks every 2 minutes, so allow about 10 minutes. Check the project names are exactly **Notices** and **Dinners**, and that dinners have **due dates**.

**A partner's calendar events don't show**
Run **testCalendars**. It lists every calendar your account can see.
- *Not found:* copy the exact **Calendar ID** from Google Calendar (their calendar → Settings and sharing → Integrate calendar) into `COMMUTER_CALENDAR`.
- *Found, but 0 events:* their events are going into a phone-only calendar (e.g. Samsung Calendar's own one) rather than their Google calendar. When adding an event, pick the calendar marked with their Gmail account.
- *Events missing from Today:* finished timed events drop off the Today list automatically, so check with something still to come.

**Gas price section is missing**
It hides itself when Gas Wizard can't be read. Run **testEverything** and look for `gas` under `errors`. "no Regular prices found" means the page layout changed and `parseGasWizard_` in Code.gs needs updating; check that `GAS_CITY` matches the city in the gaswizard.ca page address.

**Something's not showing at all**
Run **testEverything** in the editor. Each section's problem is listed under `errors`. There are also **testCalendars**, **testBirthdays**, **testNotes** and **testCommuteAlert** for individual sections.

## How often things update

| What | Refreshes |
|---|---|
| Clock, countdowns, night mode | every 15 s on the tablet |
| Board data request | every 2 min |
| Calendar, notes, drive time | every 5 min |
| Dinners | every 10 min |
| Weather | every 15 min |
| Birthdays | every hour |
| Gas prices | every 3 h |
| Dinner idea | every 6 h |
| F1 schedule | every 6 h |
| Full page reload | 4am daily |
