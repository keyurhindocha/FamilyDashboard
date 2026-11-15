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
// sun, moon, bus, fuel, bin, frost, dinner. Colours are any CSS colour.
var PEOPLE = {
  owner:    { name: 'Sam',      color: '#2E7D4F', tint: '#DCEBDF', icon: 'car' },
  commuter: { name: 'Alex',     color: '#B03A6F', tint: '#F3DDE7', icon: 'cat' },
  family:   { name: 'Everyone', color: '#7A5C12', tint: '#EFE4C6', icon: 'candle' }
};

var CONFIG = {
  TIMEZONE: 'Europe/London',

  // Turn whole sections off with false. Missing keys also hide a section.
  MODULES: {
    commute: true,   // drive time, leave-by, route-change alerts (needs HOME + WORK)
    bins: true,      // bin day reminders (needs BIN_DAY)
    f1: true,        // Formula 1 countdown
    bus: true,       // next bus (UK only, needs TransportAPI keys)
    fuel: true,      // cheapest fuel nearby (UK only, needs Fuel Finder keys + relay)
    notices: true,   // notes from Todoist or Google Tasks
    dinners: true    // weekly dinners from Todoist
  },

  // ---- Calendars. The owner's default calendar is always included.
  COMMUTER_CALENDAR: '',   // their email once they've shared their calendar with you
                           // (also gets the email backup of route alerts)
  FAMILY_CALENDAR: '',     // name or ID of a shared family calendar (optional)

  // ---- Weather. The first place is also used for the frost check.
  PLACES: [
    { name: 'HOME TOWN', lat: 51.5072, lon: -0.1276 },
    { name: 'WORK TOWN', lat: 51.7520, lon: -1.2577 }
  ],

  // ---- Commute (any address or postcode Google Maps understands).
  HOME: '',                         // e.g. 'SW1A 1AA, UK'
  WORK: '',                         // e.g. 'Example House, High Street, Oxford OX1 1AA, UK'
  USUAL_ROADS: ['M40'],             // the usual route must mention all of these roads
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
  BIN_DAY: 5,                                 // collection weekday (Mon=1 ... Sun=7), 0 = off
  BIN_CYCLE: ['Rubbish', 'Recycling'],        // bins that take turns, in order
  BIN_CYCLE_START: '2026-11-13',              // a collection day when the FIRST one went out
  BIN_EVERY_WEEK: 'food waste',               // collected every week ('' if none)
  BIN_MOVES: {},                              // one-off changes: { '2026-12-25': '2026-12-27' }

  // ---- Next bus (UK, TransportAPI). Find your stop's ATCO code on bustimes.org.
  BUS_STOP_ATCO: '',               // e.g. '4680SWA10759'
  BUS_STOP_NAME: '',               // shown under the time, e.g. 'High Street'
  BUS_LINE: '',                    // e.g. '7'
  BUS_HIDE_DESTINATION: '',        // skip buses heading to this place ('' = show all)

  // ---- Cheapest fuel (UK Fuel Finder). Types: B7_STANDARD (diesel), E10, E5.
  FUEL_TYPE: 'B7_STANDARD',
  FUEL_LABEL: 'Diesel',
  FUEL_RADIUS_MILES: 5,
  FUEL_SHOW: 3
};
