/**
 * FAMILY DASHBOARD: your settings
 * =========================================================================
 * This is the only file you need to edit. Everything here is safe to share:
 * keys and passwords go in Project Settings > Script properties instead.
 * Anything you leave empty or switch off simply doesn't show on the board.
 */

// Who's on the board. "owner" = the Google account running this script,
// "commuter" = the person whose drive to work is tracked (can be the owner too),
// "family" = a shared calendar for everyone. Icons: cat, car, candle (house),
// sun, moon, fuel, bin, frost, dinner, cake. Colours are any CSS colour.
var PEOPLE = {
  owner:    { name: 'Dad',      color: '#2E7D4F', tint: '#DCEBDF', icon: 'car' },
  commuter: { name: '',         color: '#B03A6F', tint: '#F3DDE7', icon: 'cat' },   // unused until COMMUTER_CALENDAR is set
  family:   { name: 'Family',   color: '#7A5C12', tint: '#EFE4C6', icon: 'candle' },
  birthday: { name: 'Birthdays', color: '#A8326E', tint: '#F6DCE8', icon: 'cake' }
};

var CONFIG = {
  TIMEZONE: 'America/Toronto',   // also set "timeZone" in appsscript.json to the same
  MAPS_REGION: 'ca',             // Google Maps region for the commute

  // Turn whole sections off with false. Missing keys also hide a section.
  MODULES: {
    commute: false,  // drive time, leave-by, route-change alerts (needs HOME + WORK)
    bins: true,      // bin day reminders (needs BIN_DAY)
    f1: true,        // Formula 1 countdown
    gas: true,       // local gas price + tomorrow's prediction (Gas Wizard)
    notices: true,   // notes from Todoist or Google Tasks
    dinners: true,   // dinners from the meal tracker (Supabase), or Todoist
    birthdays: true, // birthdays & anniversaries for the next two weeks
    countdowns: true // "looking forward to" countdowns, set on the countdowns page (?page=countdowns)
  },

  // ---- Calendars. The owner's default calendar is always included.
  COMMUTER_CALENDAR: '',   // their email once they've shared their calendar with you
                           // (also gets the email backup of route alerts)
  FAMILY_CALENDAR: 'Family',   // name or ID of a shared family calendar (optional)
  INCLUDE_OWNER_CALENDAR: true, // false = leave the owner's own default calendar off the board
  BIRTHDAY_CALENDAR: 'Birthdays and Anniversaries',   // calendar name or ID
  BIRTHDAY_DAYS: 14,            // how far ahead to look

  // ---- Weather. The first place is also used for the frost check.
  PLACES: [
    { name: 'Mississauga', lat: 43.5890, lon: -79.6441 }
  ],

  // ---- Commute (any address or postcode Google Maps understands).
  HOME: '',                         // e.g. '123 Example St, Mississauga, ON'
  WORK: '',                         // e.g. '1 Example Ave, Toronto, ON'
  USUAL_ROADS: ['401'],             // the usual route must mention all of these roads
  WORK_DAYS: [1, 2, 3, 4, 5],       // Mon=1 ... Sun=7
  START_TIME: '08:00',
  FINISH_TIME: '16:00',
  BUFFER_MIN: 10,                   // aim to arrive this many minutes early
  FROST_TEMP: 3,                    // °C or lower between 6 and 8am = frost
  FROST_EXTRA_MIN: 5,               // extra time to scrape the car
  MORNING_WATCH_FROM: '06:45',      // alerts stop 10 min before leave-by
  AFTERNOON_WATCH_FROM: '15:20',
  AFTERNOON_LAST_ALERT: '15:50',    // e.g. before a dashcam takes over their phone's data
  ALERT_DELAY_MIN: 10,              // usual route this much slower than normal...
  ALERT_SAVING_MIN: 7,              // ...and another route this much quicker = alert
  DAY_OFF_WORDS: ['holiday', 'day off', 'annual leave', 'off work', 'leave'],

  // ---- Bins. Example: rubbish and recycling alternate on Fridays, food waste every week.
  // Thursdays. Peel Region (peelregionon.recollect.net): green bin every week, garbage every
  // other week, yard waste in season. Circular Materials: recycling on the weeks between (out by 7am).
  BIN_DAY: 4,                                 // collection weekday (Mon=1 ... Sun=7), 0 = off
  BIN_CYCLE: ['Garbage', 'Recycling'],        // bins that take turns, in order ('' = nothing extra that week)
  BIN_CYCLE_START: '2026-11-12',              // a collection day when the FIRST one went out
  BIN_EVERY_WEEK: 'green bin',                // collected every week ('' if none)
  BIN_SEASONAL: [                             // extra pickups between two dates (inclusive)
    { label: 'yard waste', from: '2026-11-01', until: '2026-12-10' }
    // add next spring's dates from the 2027 schedule
  ],
  BIN_MOVES: {},                              // one-off changes: { '2026-12-25': '2026-12-27' }

  // ---- Dinners from the meal tracker app (Supabase). Script properties:
  // SUPABASE_URL, SUPABASE_SERVICE_KEY (Project Settings > API > service_role; read-only use here).
  MEAL_USER_ID: '',                // your user id in the meal tracker (Supabase > Authentication > Users)
  MEAL_SUGGEST: true,              // when no dinner is planned, suggest a favourite you haven't had lately

  // ---- Gas prices (gaswizard.ca). GAS_CITY is the city in the page address,
  // e.g. gaswizard.ca/gas-prices/mississauga/. Types: 'Regular', 'Premium', 'Diesel'.
  GAS_CITY: 'mississauga',
  GAS_LABEL: 'Mississauga',
  GAS_TYPE: 'Regular'
};
