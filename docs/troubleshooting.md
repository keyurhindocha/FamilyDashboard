# Troubleshooting

These are the problems hit while building this, and the fixes.

**Changed the code but the board shows the old behaviour**
Deploy → Manage deployments → ✏️ → **Version: New version** → Deploy. Clicking Deploy without choosing "New version" keeps the old code live. To see exactly what the board receives, open your board link with `?api=1&k=` instead of `?k=`.

**Board is blank in Fully Kiosk but works in Chrome**
Fully Kiosk uses Android System WebView. Update it via `https://play.google.com/store/apps/details?id=com.google.android.webview` (not the Dev/Beta/Canary versions), then restart the tablet.

**"Sorry, the file you have requested does not exist" (Google Drive page) in the kiosk**
Google's web app pages don't always open inside app browsers. Check that the deployment's **Who has access** is **Anyone**. If it still fails, host the board page on GitHub Pages or Netlify instead ([setup step 4](setup.md#4-host-the-board-page)). That page only fetches data from Google, which works fine.

**Fuel: "Fuel Finder token HTTP 403"**
Fuel Finder only answers UK addresses, and Apps Script runs in the US. Set up the relay in [modules.md](modules.md#cheapest-fuel-uk). An empty 403 means a location block; an error message would mean wrong keys.

**Route alerts: ntfy replied 429 "daily message quota reached"**
Anonymous ntfy limits are per internet address, and Google's are shared with everyone. Create a free ntfy account and add `NTFY_TOKEN`. The email backup to `COMMUTER_CALENDAR` still works meanwhile.

**Bus shows "No more buses" during the day**
The free TransportAPI plan allows 30 calls a day, and the board stops at 25 to leave room for testing. Running testEverything many times in one day uses them up. It resets at midnight.

**Notes or dinners don't appear**
Notes are kept for 5 minutes and dinners for 10, and the tablet asks every 2 minutes, so allow about 10 minutes. Check the project names are exactly **Notices** and **Dinners**, and that dinners have **due dates**.

**Something's not showing at all**
Run **testEverything** in the editor. Each section's problem is listed under `errors`.

## How often things update

| What | Refreshes |
|---|---|
| Clock, countdowns, night mode | every 15 s on the tablet |
| Board data request | every 2 min |
| Calendar, notes, drive time | every 5 min |
| Dinners | every 10 min |
| Weather | every 15 min |
| Fuel prices | every 30 min (station list weekly) |
| Bus list | about every 45 min, 6am–10:30pm |
| F1 schedule | every 6 h |
| Full page reload | 4am daily |
