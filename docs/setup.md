# Setup

You need a Google account (the one whose calendar the board should show), a tablet, and about 15 minutes for the basics.

## 1. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) → **New project**. Name it "Family Dashboard".
2. Create these files and paste in the contents from [`apps-script/`](../apps-script):

   | File in this repo | In the Apps Script editor |
   |---|---|
   | `Code.gs` | rename the default `Code.gs` and paste over it |
   | `Config.gs` | **+ → Script**, name it `Config` |
   | `Index.html` | **+ → HTML**, name it `Index` |
   | `appsscript.json` | ⚙️ Project Settings → tick **Show "appsscript.json"**, then paste over it in the editor |

3. Press **Save** (Ctrl+S).

`appsscript.json` switches on the Google Tasks service, sets the time zone and makes the web app reachable by the tablet.

## 2. Edit Config.gs

This is the only file you need to change. At minimum, set:

- `PEOPLE`: names and colours. "owner" is your account, "commuter" is whoever's drive is tracked, "family" is a shared calendar.
- `PLACES`: one or two towns for weather (latitude and longitude; right-click a spot in Google Maps to copy them).
- Bins: `BIN_DAY`, `BIN_CYCLE`, `BIN_CYCLE_START`, `BIN_EVERY_WEEK`. Set `BIN_DAY: 0` if you don't want bins.
- `TIMEZONE` if you're not in the UK.

Switch whole sections off in `MODULES` (set them to `false`).

**Calendars:** the owner's main calendar is always included. For a partner's calendar, they share it with you in Google Calendar (Settings → their calendar → *Share with specific people*), then you put their email in `COMMUTER_CALENDAR`. For a shared family calendar, put its name in `FAMILY_CALENDAR`.

## 3. Run setup and deploy

1. In the function dropdown at the top, choose **setup** and press **Run**. Google asks for permissions (calendar, external requests, triggers). Allow them. You may need **Advanced → Go to Family Dashboard (unsafe)**, which is normal for your own scripts.
2. The log shows your **board key**.
3. **Deploy → New deployment** → ⚙️ **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (this matters; the tablet isn't signed in)
4. Copy the **Web app URL**. Your **board link** is that URL plus `?k=` and your board key:

   ```
   https://script.google.com/macros/s/AKfy.../exec?k=yourboardkey
   ```

5. Run **testEverything** to see what the board will receive. Sections you haven't set up are listed under `errors` or show `missingKey`, which is fine.

> **Every time you change the code:** Deploy → Manage deployments → ✏️ → **Version: New version** → Deploy. Just clicking Deploy without picking "New version" keeps serving the old code. The link stays the same.

## 4. Host the board page

The board page (`web/index.html`) is a single HTML file that asks your script for data. Pick one way to host it:

**A. GitHub Pages (free, stays up to date)**
1. Fork this repo.
2. In your fork: **Settings → Pages → Deploy from a branch → `main` / root** → Save.
3. Your board is at `https://<your-username>.github.io/FamilyDashboard/web/`.
4. The first time you open it on a device, it asks for your **board link**. Paste it and tap Save, and that device remembers it.
   If you can't paste on the tablet, open `.../web/?link=` followed by your board link once instead.

**B. Netlify Drop (private, nothing to type on the tablet)**
1. Download `web/index.html` and open it in Notepad.
2. Paste your board link into `var BOARD_LINK = '';` and save. Only do this in your private copy, never in a public repo, because the link contains your board key.
3. Put the file in a folder, go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the folder in.
4. The board is at the address Netlify gives you, which you can rename under Site configuration.

**C. Straight from Google:** your board link itself also works in Chrome. Some kiosk browsers can't open Google's web app pages, though (see [troubleshooting](troubleshooting.md)), which is why A and B exist.

## 5. Put it on the tablet

See [tablet.md](tablet.md).

## Script properties reference

Project Settings → **Script properties**. Never put these in code.

| Property | Needed for | Where it comes from |
|---|---|---|
| `BOARD_KEY` | everything | created by `setup` |
| `NTFY_TOPIC`, `NTFY_TOKEN` | route alerts | [modules.md](modules.md#route-alerts) |
| `TAPI_APP_ID`, `TAPI_APP_KEY` | next bus | [modules.md](modules.md#next-bus-uk) |
| `FUEL_CLIENT_ID`, `FUEL_CLIENT_SECRET`, `FUEL_RELAY_URL` | fuel prices | [modules.md](modules.md#cheapest-fuel-uk) |
| `FUEL_RELAY_KEY` | fuel prices | created by `setup` |
| `TODOIST_TOKEN` | notes and dinners | [modules.md](modules.md#notes-and-dinners) |
