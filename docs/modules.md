# Optional modules

Each module turns itself on once its settings and keys are in place. Switch any of them off in `Config.gs` → `MODULES`. After changing code or settings, deploy a **New version** (Deploy → Manage deployments → ✏️ → Version: New version).

## Commute and leave-by time

**Config.gs:** `HOME`, `WORK`, `USUAL_ROADS`, `WORK_DAYS`, `START_TIME`, `FINISH_TIME`, `BUFFER_MIN`, frost settings.

- Shows live drive time during the morning and afternoon windows, using Google Maps traffic (built into Apps Script, no key).
- Leave-by = start time − drive time − `BUFFER_MIN`, plus `FROST_EXTRA_MIN` when the first weather place is at or below `FROST_TEMP` between 6 and 8am.
- `USUAL_ROADS`: roads the normal route takes (e.g. `['M4', 'A419']`). A route counts as "usual" if its directions mention all of them.
- An all-day event in the commuter's calendar containing a `DAY_OFF_WORDS` word (holiday, day off…) turns it off for that day.

## Route alerts

The commuter gets **one** push notification per commute, and only when the usual route is at least `ALERT_DELAY_MIN` slower than normal **and** another route is at least `ALERT_SAVING_MIN` quicker. Tapping it opens Google Maps with that route. `setup` creates a 5-minute background check that runs even when the board is off.

1. The commuter installs the free **ntfy** app and subscribes to a topic with a hard-to-guess name, e.g. `family-dash-7f3k2q`.
2. Make a free account at [ntfy.sh](https://ntfy.sh) → Account → **Access tokens** → create one.
   This matters: Google's servers are shared, and anonymous ntfy messages from them hit the daily limit (HTTP 429).
3. Script properties: `NTFY_TOPIC` = the topic, `NTFY_TOKEN` = the token.
4. Run **testCommuteAlert** to send a test.

**Email backup:** if ntfy fails, the alert is emailed to the address in `COMMUTER_CALENDAR`.

`AFTERNOON_LAST_ALERT` sets the latest time for an evening alert, which is useful if the commuter's phone loses data later on (e.g. a dashcam takes over the phone's connection).

## Gas prices

**Config.gs:** `GAS_CITY`, `GAS_LABEL`, `GAS_TYPE` (`Regular`, `Premium` or `Diesel`). No account or key needed.

Shows today's average price for your area and tomorrow's predicted price from [Gas Wizard](https://gaswizard.ca) (Dan McTeague's daily predictions), with a plain hint: "Up 3¢ tomorrow · fill up today" or "Down 2¢ tomorrow · wait if you can". Tomorrow's prediction is usually posted mid-afternoon, so mornings show only today's price. When it's going up by 2¢ or more, night mode mentions it too.

`GAS_CITY` is the city as it appears in the page address, e.g. `gaswizard.ca/gas-prices/mississauga/`. The board reads the page every 3 hours. These are area averages, not individual stations; if the page layout changes, the section hides itself and `testEverything` shows the error.

## Notes and dinners

From **Todoist** (free), so everyone can add from their own phone.

1. In Todoist, create a project called **Notices** and one called **Dinners**. Share both with your household.
2. Todoist → Settings → Integrations → **Developer** → copy the API token into Script property `TODOIST_TOKEN`.
3. **Notes:** any task in Notices shows on the board (up to 6). Tick it off to remove it.
4. **Dinners:** add each meal as a task **due on the day** it's for ("Spag bol", due Monday). Tonight's dinner shows until 9pm, and the rest appear in the week view.

Without a Todoist token, notes come from a Google Tasks list called **Notices** in the owner's account instead (Google Tasks lists can't be shared).

## Bins

No accounts needed. Set `BIN_DAY`, the bins that take turns (`BIN_CYCLE`), a date when the first of them went out (`BIN_CYCLE_START`), and anything collected weekly (`BIN_EVERY_WEEK`). For bank-holiday changes add `BIN_MOVES: { '2026-12-25': '2026-12-27' }`.

The board says "bins out tonight" from 5pm the evening before, and shows them on the morning of collection.

## F1 countdown

No setup. Uses the free Jolpica F1 API. Turn it off with `MODULES.f1: false`.

## Birthdays and anniversaries

**Config.gs:** `BIRTHDAY_CALENDAR` (name or ID), `BIRTHDAY_DAYS` (default 14).

Today's birthdays go at the top of the Today list, and the rest of the week shows them as pink chips. A year in brackets in the title becomes an age, so "Jane Doe's birthday (1985)" shows "turns 41", and anything after ` · ` is dropped. Run **testBirthdays** to check.

## Dinners from the meal tracker

Reads `meal_entries` (type `dinner`) from the meal tracker's Supabase project. When it's set up, it replaces the Todoist dinners.

1. Supabase → Project Settings → API: copy the **Project URL** and the **service_role** key.
2. Script properties: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. The service key can read every row, so keep it only in Script properties.
3. Config.gs: `MEAL_USER_ID` = your user id (Supabase → Authentication → Users), so only your meals are read.
4. Plan a dinner by logging it in the meal tracker on a future date. It shows in the week view and as tonight's dinner.
5. `MEAL_SUGGEST`: when tonight has no dinner, the board suggests a favourite (eaten 3+ times in the last 6 months) you haven't had for at least two weeks.

Run **testNotes** to see what the board reads.

## Old iPads

The board works in Safari on iOS 10.3 and newer. On older Safari it swaps flexbox spacing for margins and falls back to the iPad's own clock if time zones aren't supported. On a 4:3 screen it lays out at 1280×960 instead of leaving black bars.

Kiosk setup on iPad: open the board in Safari → Share → **Add to Home Screen**, then Settings → Display → **Auto-Lock: Never**, and Settings → Accessibility → **Guided Access** on (triple-click the Home button inside the board to lock it there).
