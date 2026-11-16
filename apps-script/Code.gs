/**
 * FAMILY DASHBOARD: Google Apps Script server
 * =========================================================================
 * Runs in your own Google account. Gathers everything the board shows and
 * hands it to the board page as JSON:
 *   calendars (up to three people), bins, weather + frost, a commuter's drive
 *   with route-change alerts, F1 countdown, next bus, cheapest fuel nearby,
 *   notes and weekly dinners.
 *
 * Your settings live in Config.gs. Secrets live in Project Settings >
 * Script properties, never in code. See docs/setup.md.
 */

// ---------------------------------------------------------------- web app
function doGet(e) {
  var key = prop_('BOARD_KEY');
  // Data-only mode, for the board page when it's hosted outside Google (board.html).
  if (e && e.parameter && e.parameter.api) {
    var out;
    try { out = getBoardData(e.parameter.k); } catch (err) { out = { error: String(err && err.message || err) }; }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
  if (!key || !e || !e.parameter || e.parameter.k !== key) {
    return HtmlService.createHtmlOutput('Not found');
  }
  var t = HtmlService.createTemplateFromFile('Index');
  t.boardKey = key;
  return t.evaluate()
    .setTitle('Family board')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Called by the page every couple of minutes. One failing feed never breaks the rest. */
function getBoardData(key) {
  if (key !== prop_('BOARD_KEY')) throw new Error('Not allowed');
  var now = new Date();
  var out = { now: now.getTime(), people: PEOPLE, errors: {} };
  var on = function (m) { return !CONFIG.MODULES || CONFIG.MODULES[m] !== false; };
  out.show = CONFIG.MODULES || {};
  out.busStop = CONFIG.BUS_STOP_NAME || '';
  out.fuelLabel = CONFIG.FUEL_LABEL || 'Diesel';
  section_(out, 'calendar', function () { return cached_('cal', 300, getCalendar_); });
  section_(out, 'bins', function () { return on('bins') ? getBins_(now) : null; });
  section_(out, 'weather', function () { return cached_('wx', 900, getWeather_); });
  section_(out, 'drive', function () { return on('commute') && CONFIG.WORK ? getDriveForBoard_(now) : null; });
  section_(out, 'f1', function () { return on('f1') ? cached_('f1', 21600, getF1_) : null; });
  section_(out, 'bus', function () { return on('bus') ? cached_('bus', 60, getBus_) : null; });
  section_(out, 'diesel', function () { return on('fuel') ? cached_('fuel', 1800, getDiesel_) : null; });
  section_(out, 'notices', function () { return on('notices') ? cached_('notices', 300, getNotices_) : []; });
  section_(out, 'dinners', function () { return on('dinners') ? cached_('dinners', 600, getDinners_) : {}; });
  return out;
}

function section_(out, name, fn) {
  try { out[name] = fn(); } catch (err) { out[name] = null; out.errors[name] = String(err && err.message || err); }
}

// ---------------------------------------------------------------- calendar
function getCalendar_() {
  var start = startOfDay_(new Date());
  var end = new Date(start.getTime() + 7 * 864e5);
  var events = [];
  function add(cal, who) {
    if (!cal) return;
    cal.getEvents(start, end).forEach(function (ev) {
      events.push({
        who: who,
        title: ev.getTitle(),
        start: ev.getStartTime().getTime(),
        end: ev.getEndTime().getTime(),
        allDay: ev.isAllDayEvent()
      });
    });
  }
  add(CalendarApp.getDefaultCalendar(), 'owner');
  add(findCalendar_(CONFIG.COMMUTER_CALENDAR), 'commuter');
  add(findCalendar_(CONFIG.FAMILY_CALENDAR), 'family');
  events.sort(function (a, b) { return a.start - b.start; });
  return { events: events, from: start.getTime() };
}

function findCalendar_(idOrName) {
  if (!idOrName) return null;
  var cal = null;
  try { cal = CalendarApp.getCalendarById(idOrName); } catch (e) {}
  if (!cal) {
    var byName = CalendarApp.getCalendarsByName(idOrName);
    cal = byName && byName.length ? byName[0] : null;
  }
  return cal;
}

function commuterIsOff_(day) {
  var cal = findCalendar_(CONFIG.COMMUTER_CALENDAR);
  if (!cal) return false;
  var evs = cal.getEventsForDay(day);
  for (var i = 0; i < evs.length; i++) {
    if (!evs[i].isAllDayEvent()) continue;
    var t = evs[i].getTitle().toLowerCase();
    for (var j = 0; j < CONFIG.DAY_OFF_WORDS.length; j++) {
      if (t.indexOf(CONFIG.DAY_OFF_WORDS[j]) !== -1) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------- bins
/** Pure: which bins go out on a given date (yyyy-mm-dd), or null. */
function binsFor_(dateStr) {
  if (!CONFIG.BIN_DAY) return null;
  var moves = CONFIG.BIN_MOVES || {};
  // A collection moved away from this date?
  if (moves[dateStr]) return null;
  // A collection moved onto this date?
  var original = null;
  Object.keys(moves).forEach(function (k) { if (moves[k] === dateStr) original = k; });
  var d = parseDate_(original || dateStr);
  if (!original && isoDay_(d) !== CONFIG.BIN_DAY) return null;
  var cycle = CONFIG.BIN_CYCLE || [];
  var main = null;
  if (cycle.length) {
    var anchor = parseDate_(CONFIG.BIN_CYCLE_START);
    var weeks = Math.round((d.getTime() - anchor.getTime()) / (7 * 864e5));
    main = cycle[((weeks % cycle.length) + cycle.length) % cycle.length];
  }
  var weekly = CONFIG.BIN_EVERY_WEEK || '';
  var label = main && weekly ? main + ' & ' + weekly : (main || weekly);
  if (!label) return null;
  return { main: main, food: !!weekly, label: label.charAt(0).toUpperCase() + label.slice(1) };
}

function getBins_(now) {
  var today = fmt_(now, 'yyyy-MM-dd');
  var tomorrow = fmt_(new Date(now.getTime() + 864e5), 'yyyy-MM-dd');
  var hour = Number(fmt_(now, 'H'));
  var next = null;
  for (var i = 0; i < 15 && !next; i++) {
    var ds = fmt_(new Date(now.getTime() + i * 864e5), 'yyyy-MM-dd');
    var b = binsFor_(ds);
    if (b) next = { date: ds, label: b.label };
  }
  return {
    today: binsFor_(today),
    tonight: hour >= 17 ? binsFor_(tomorrow) : null,
    tomorrow: binsFor_(tomorrow),
    next: next
  };
}

// ---------------------------------------------------------------- weather
function getWeather_() {
  return CONFIG.PLACES.map(function (p) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon +
      '&current=temperature_2m,weather_code,is_day' +
      '&hourly=temperature_2m' +
      '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset' +
      '&timezone=Europe%2FLondon&forecast_days=2';
    var j = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    return {
      place: p.name,
      temp: Math.round(j.current.temperature_2m),
      code: j.current.weather_code,
      isDay: j.current.is_day === 1,
      max: Math.round(j.daily.temperature_2m_max[0]),
      min: Math.round(j.daily.temperature_2m_min[0]),
      sunrise: j.daily.sunrise[0], sunset: j.daily.sunset[0],
      hourly: { time: j.hourly.time, temp: j.hourly.temperature_2m }
    };
  });
}

/** Lowest temperature at the first PLACES entry between 6 and 8am on the given date (yyyy-MM-dd). */
function morningLow_(weather, dateStr) {
  if (!weather || !weather[0]) return null;
  var h = weather[0].hourly, low = null;
  for (var i = 0; i < h.time.length; i++) {
    var t = h.time[i];
    if (t.indexOf(dateStr) === 0) {
      var hr = Number(t.substr(11, 2));
      if (hr >= 6 && hr <= 8 && (low === null || h.temp[i] < low)) low = h.temp[i];
    }
  }
  return low;
}

// ---------------------------------------------------------------- drive
/**
 * Looks up live routes. Returns the usual route (via USUAL_ROADS) and the
 * quickest other route, with traffic.
 */
function routes_(from, to, usualRoads) {
  var res = Maps.newDirectionFinder()
    .setOrigin(from).setDestination(to)
    .setMode(Maps.DirectionFinder.Mode.DRIVING)
    .setDepart(new Date(Date.now() + 60000))
    .setAlternatives(true)
    .setRegion('uk')
    .getDirections();
  return pickRoutes_(res.routes || [], usualRoads);
}

/** Pure: choose usual + best alternative from a Directions API routes array. */
function pickRoutes_(routes, usualRoads) {
  var info = routes.map(function (r) {
    var leg = r.legs[0];
    var text = (r.summary || '') + ' ' + leg.steps.map(function (s) { return s.html_instructions || ''; }).join(' ');
    var usual = usualRoads.every(function (road) {
      return new RegExp('\\b' + road + '\\b').test(text);
    });
    var mid = leg.steps[Math.floor(leg.steps.length / 2)].end_location;
    return {
      summary: r.summary || '',
      usual: usual,
      normalMin: Math.round(leg.duration.value / 60),
      liveMin: Math.round(((leg.duration_in_traffic || leg.duration).value) / 60),
      via: mid.lat.toFixed(5) + ',' + mid.lng.toFixed(5)
    };
  });
  var usual = null, alt = null;
  info.forEach(function (r) {
    if (r.usual && (!usual || r.liveMin < usual.liveMin)) usual = r;
  });
  info.forEach(function (r) {
    if (r !== usual && (!alt || r.liveMin < alt.liveMin)) alt = r;
  });
  return { usual: usual, alt: alt };
}

/**
 * Pure: decide whether the commuter needs a different route.
 * usualNormal = the usual route's no-traffic time, remembered from earlier
 * checks, used when Google doesn't offer the usual route at all.
 */
function needsNewRoute_(pick, usualNormal) {
  if (pick.usual) {
    var delay = pick.usual.liveMin - pick.usual.normalMin;
    if (pick.alt && delay >= CONFIG.ALERT_DELAY_MIN &&
        pick.usual.liveMin - pick.alt.liveMin >= CONFIG.ALERT_SAVING_MIN) {
      return { reason: 'Big delay on usual route (+' + delay + ' min)', route: pick.alt };
    }
    return null;
  }
  // Usual route not offered. Only treat it as a problem if every option is
  // now much slower than the usual route normally takes.
  if (pick.alt && usualNormal && pick.alt.liveMin >= usualNormal + CONFIG.ALERT_DELAY_MIN) {
    return { reason: 'Usual route not available (possible closure or crash)', route: pick.alt };
  }
  return null;
}

function mapsLink_(destination, via) {
  var u = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + encodeURIComponent(destination);
  if (via) u += '&waypoints=' + encodeURIComponent(via);
  return u;
}

function hm_(str) { var p = str.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
function minutesNow_(d) { return Number(fmt_(d, 'H')) * 60 + Number(fmt_(d, 'm')); }
function hhmm_(mins) { mins = ((mins % 1440) + 1440) % 1440; var h = Math.floor(mins / 60), m = mins % 60; return h + ':' + (m < 10 ? '0' : '') + m; }

/** Which commute (if any) is relevant right now. */
function commuteNow_(now) {
  if (CONFIG.WORK_DAYS.indexOf(isoDay_(now)) === -1) return null;
  var m = minutesNow_(now);
  if (m >= hm_('05:30') && m < hm_(CONFIG.START_TIME)) return 'morning';
  if (m >= hm_('15:00') && m < hm_(CONFIG.FINISH_TIME) + 45) return 'afternoon';
  return null;
}

function getDriveForBoard_(now) {
  var which = commuteNow_(now);
  if (!which) return null;
  return cached_('drive_' + which, 300, function () { return computeDrive_(which, now); });
}

function computeDrive_(which, now) {
  var today = fmt_(now, 'yyyy-MM-dd');
  if (commuterIsOff_(now)) return { off: true };
  var morning = which === 'morning';
  var usualRoads = morning ? CONFIG.USUAL_ROADS : CONFIG.USUAL_ROADS.slice().reverse();
  var pick = morning ? routes_(CONFIG.HOME, CONFIG.WORK, usualRoads) : routes_(CONFIG.WORK, CONFIG.HOME, usualRoads);
  var normalKey = 'USUAL_NORMAL_' + which;
  if (pick.usual) setProp_(normalKey, String(pick.usual.normalMin));
  var change = needsNewRoute_(pick, Number(prop_(normalKey)) || null);
  var use = change ? change.route : pick.usual || pick.alt;
  var frost = null, extra = 0;
  if (morning) {
    var wx = cached_('wx', 900, getWeather_);
    var low = morningLow_(wx, today);
    if (low !== null && low <= CONFIG.FROST_TEMP) { frost = Math.round(low); extra = CONFIG.FROST_EXTRA_MIN; }
  }
  var target = morning ? hm_(CONFIG.START_TIME) - CONFIG.BUFFER_MIN : null;
  var leaveBy = morning && use ? target - use.liveMin - extra : null;
  return {
    which: which,
    title: PEOPLE.commuter.name + (morning ? ' to work' : ' home'),
    usual: pick.usual, alt: pick.alt,
    change: change ? { reason: change.reason, via: change.route.summary, mins: change.route.liveMin } : null,
    liveMin: use ? use.liveMin : null,
    delayMin: pick.usual ? pick.usual.liveMin - pick.usual.normalMin : null,
    leaveBy: leaveBy !== null ? hhmm_(leaveBy) : null,
    frost: frost,
    sentAt: prop_('ALERT_SENT_' + today + '_' + which) || null,
    link: change ? mapsLink_(morning ? CONFIG.WORK : CONFIG.HOME, change.route.via) : null
  };
}

/**
 * Time trigger (every 5 minutes, installed by setup()).
 * Sends the commuter ONE push per commute, only when she needs a different route,
 * and never after the cut-off (dashcam takes over her phone's internet).
 */
function commuteWatch() {
  if (!CONFIG.WORK || (CONFIG.MODULES && CONFIG.MODULES.commute === false)) return;
  var now = new Date();
  var which = commuteNow_(now);
  if (!which) return;
  var today = fmt_(now, 'yyyy-MM-dd');
  var flag = 'ALERT_SENT_' + today + '_' + which;
  if (prop_(flag)) return;

  var m = minutesNow_(now);
  var d = computeDrive_(which, now);
  CacheService.getScriptCache().put('drive_' + which, JSON.stringify(d), 300);
  if (!d || d.off) return;

  var from, last;
  if (which === 'morning') {
    from = hm_(CONFIG.MORNING_WATCH_FROM);
    last = d.leaveBy ? hm_(d.leaveBy) - 10 : hm_(CONFIG.START_TIME) - 60;
  } else {
    from = hm_(CONFIG.AFTERNOON_WATCH_FROM);
    last = hm_(CONFIG.AFTERNOON_LAST_ALERT);
  }
  if (m < from || m > last) return;
  if (!d.change) return;

  var title = which === 'morning' ? 'New route to work' : 'New route home';
  var msg = d.change.reason + '. Go via ' + (d.change.via || 'the suggested route') + ' (' + d.change.mins + ' min).';
  if (d.leaveBy) msg += ' Leave by ' + d.leaveBy + '.';
  if (d.frost !== null) msg += ' Frost ' + d.frost + '°: scrape the car.';
  msg += ' Tap for directions.';
  if (sendNtfy_(prop_('NTFY_TOPIC'), title, msg, d.link)) {
    setProp_(flag, hhmm_(m));
  }
}

function sendNtfy_(topic, title, message, clickUrl) {
  if (!topic) return false;
  var headers = { Title: title, Tags: 'warning,car', Priority: '4' };
  if (clickUrl) headers.Click = clickUrl;
  // Google's servers are shared by many scripts, so ntfy needs an account token
  // to give the board its own allowance instead of sharing one with everyone.
  var token = prop_('NTFY_TOKEN');
  if (token) headers.Authorization = 'Bearer ' + token;
  var res = UrlFetchApp.fetch('https://ntfy.sh/' + encodeURIComponent(topic), {
    method: 'post', payload: message, headers: headers, muteHttpExceptions: true
  });
  if (res.getResponseCode() < 300) return true;
  Logger.log('ntfy replied: ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 300));
  // Backup so a diversion is never missed: email the commuter instead.
  var email = CONFIG.COMMUTER_CALENDAR;
  if (email && email.indexOf('@') > 0) {
    MailApp.sendEmail(email, title, message + (clickUrl ? '\n\nDirections: ' + clickUrl : ''));
    Logger.log('Sent by email instead');
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- F1
function getF1_() {
  var j = JSON.parse(UrlFetchApp.fetch('https://api.jolpi.ca/ergast/f1/current.json?limit=100').getContentText());
  return nextRace_(j.MRData.RaceTable.Races, Date.now());
}

/** Pure: next race (or the one running in the last 3 hours) from a Jolpica races list. */
function nextRace_(races, nowMs) {
  function when(o) { return o && o.date ? Date.parse(o.date + 'T' + (o.time || '12:00:00Z')) : null; }
  for (var i = 0; i < races.length; i++) {
    var r = races[i], race = when(r);
    if (race && race > nowMs - 3 * 3600e3) {
      return {
        name: r.raceName,
        race: race,
        qualifying: when(r.Qualifying),
        sprint: when(r.Sprint)
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------- bus
// Bus times come from TransportAPI ("NextBuses powered by TransportAPI").
// The free plan allows 30 requests a day, so the board fetches a list of upcoming
// buses every 45 minutes (6am to 10:30pm, about 22 a day) and steps through it itself.
var BUS = { FROM: '06:00', UNTIL: '22:30', REFRESH_MIN: 45, DAILY_MAX: 25 };

function getBus_() {
  var id = prop_('TAPI_APP_ID'), key = prop_('TAPI_APP_KEY');
  if (!id || !key || !CONFIG.BUS_STOP_ATCO) return { missingKey: true };
  var now = new Date(), nowMs = now.getTime();
  var stored = JSON.parse(prop_('BUS_LIST') || '{"fetched":0,"departures":[]}');
  var upcoming = stored.departures.filter(function (d) { return d.time > nowMs - 30000; });

  var today = fmt_(now, 'yyyy-MM-dd'), hhmm = fmt_(now, 'HH:mm');
  var count = (prop_('BUS_CALLS') || '').split('|');
  var used = count[0] === today ? Number(count[1]) : 0;
  var ageMin = (nowMs - stored.fetched) / 60000;
  var awake = hhmm >= BUS.FROM && hhmm <= BUS.UNTIL;
  var due = ageMin >= BUS.REFRESH_MIN || (upcoming.length < 2 && ageMin >= 20);
  if (!awake || !due || used >= BUS.DAILY_MAX) return { departures: upcoming.slice(0, 6) };

  setProp_('BUS_CALLS', today + '|' + (used + 1));
  var url = 'https://transportapi.com/v3/uk/bus/stop/' + CONFIG.BUS_STOP_ATCO + '/live.json' +
    '?app_id=' + encodeURIComponent(id) + '&app_key=' + encodeURIComponent(key) +
    '&group=no&limit=20&nextbuses=yes';
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() >= 300) {
    if (upcoming.length) return { departures: upcoming.slice(0, 6) };
    throw new Error('TransportAPI HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  }
  var list = parseTapi_(JSON.parse(res.getContentText()));
  setProp_('BUS_LIST', JSON.stringify({ fetched: nowMs, departures: list.slice(0, 15) }));
  return { departures: list.filter(function (d) { return d.time > nowMs - 30000; }).slice(0, 6) };
}

/** Turns a TransportAPI live.json reply into [{line, destination, time(ms), live}] for our line. */
function parseTapi_(json) {
  var deps = json.departures || {}, all = deps.all;
  if (!all) { all = []; Object.keys(deps).forEach(function (k) { all = all.concat(deps[k] || []); }); }
  var hide = (CONFIG.BUS_HIDE_DESTINATION || '').toLowerCase();
  var out = [];
  all.forEach(function (d) {
    var line = String(d.line_name || d.line || '');
    var dest = d.direction || '';
    if (CONFIG.BUS_LINE && line !== String(CONFIG.BUS_LINE)) return;
    if (hide && dest.toLowerCase().indexOf(hide) !== -1) return;
    var time = d.expected_departure_time || d.best_departure_estimate || d.aimed_departure_time;
    var date = d.expected_departure_date || d.date;
    if (!time || !date) return;
    var t = Utilities.parseDate(date + ' ' + time, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm').getTime();
    out.push({ line: line, destination: dest, time: t, live: !!d.expected_departure_time });
  });
  out.sort(function (a, b) { return a.time - b.time; });
  return out;
}

/** Parses a SIRI-SM response into [{line, destination, time(ms), live}] for our line. */
function parseSiri_(text) {
  var doc = XmlService.parse(text);
  var visits = [];
  walk_(doc.getRootElement(), function (el) { if (el.getName() === 'MonitoredStopVisit') visits.push(el); });
  var out = [];
  visits.forEach(function (v) {
    var line = childText_(v, 'PublishedLineName') || childText_(v, 'LineRef');
    var dest = childText_(v, 'DirectionName') || childText_(v, 'DestinationName') || '';
    var expected = childText_(v, 'ExpectedDepartureTime');
    var aimed = childText_(v, 'AimedDepartureTime');
    var t = Date.parse(expected || aimed);
    if (String(line) !== CONFIG.BUS_LINE || isNaN(t)) return;
    if (CONFIG.BUS_HIDE_DESTINATION && dest.toLowerCase().indexOf(CONFIG.BUS_HIDE_DESTINATION.toLowerCase()) !== -1) return;
    out.push({ line: line, destination: dest, time: t, live: !!expected });
  });
  out.sort(function (a, b) { return a.time - b.time; });
  return out.slice(0, 4);
}

function walk_(el, fn) { fn(el); el.getChildren().forEach(function (c) { walk_(c, fn); }); }
function childText_(el, name) {
  var found = null;
  walk_(el, function (c) { if (!found && c.getName() === name) found = c.getText(); });
  return found;
}

// ---------------------------------------------------------------- diesel
var FUEL_BASE = 'https://www.fuel-finder.service.gov.uk';

/**
 * Fuel Finder only answers UK addresses and Google runs this script in the US,
 * so calls go through a small relay on Supabase that runs in London (x-region: eu-west-2).
 * Script properties: FUEL_RELAY_URL and FUEL_RELAY_KEY. Without them it calls Fuel Finder directly.
 */
function fuelFetch_(path, opts) {
  var relay = prop_('FUEL_RELAY_URL');
  if (!relay) return UrlFetchApp.fetch(FUEL_BASE + path, opts);
  var headers = { 'x-region': 'eu-west-2', 'x-relay-key': prop_('FUEL_RELAY_KEY') || '' };
  var given = opts.headers || {};
  if (given.Authorization) headers['x-ff-auth'] = given.Authorization;
  if (given.Accept) headers['x-ff-accept'] = given.Accept;
  var o = { method: opts.method || 'get', headers: headers, muteHttpExceptions: true };
  if (opts.payload) { o.payload = opts.payload; o.contentType = opts.contentType; }
  return UrlFetchApp.fetch(relay + '?forceFunctionRegion=eu-west-2&p=' + encodeURIComponent(path), o);
}

function fuelToken_() {
  var cache = CacheService.getScriptCache();
  var tok = cache.get('fuel_token');
  if (tok) return tok;
  var res = fuelFetch_('/api/v1/oauth/generate_access_token', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Accept: 'application/json' },
    payload: JSON.stringify({ grant_type: 'client_credentials', client_id: prop_('FUEL_CLIENT_ID'), client_secret: prop_('FUEL_CLIENT_SECRET') })
  });
  if (res.getResponseCode() >= 300) throw new Error('Fuel Finder token HTTP ' + res.getResponseCode());
  var j = JSON.parse(res.getContentText());
  tok = (j.data && j.data.access_token) || j.access_token;
  if (!tok) throw new Error('Fuel Finder: no token in response');
  cache.put('fuel_token', tok, 3000);
  return tok;
}

function fuelBatches_(path) {
  var tok = fuelToken_(), all = [];
  for (var b = 1; b <= 30; b++) {
    var res = fuelFetch_(path + '?batch-number=' + b, {
      muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + tok, Accept: 'application/json' }
    });
    if (res.getResponseCode() === 404) break;
    if (res.getResponseCode() >= 300) throw new Error('Fuel Finder HTTP ' + res.getResponseCode() + ' on batch ' + b);
    var j = JSON.parse(res.getContentText());
    var rows = Array.isArray(j) ? j : (j.data || []);
    if (!rows.length) break;
    all = all.concat(rows);
    if (rows.length < 500) break;
    Utilities.sleep(2100); // stay under 30 requests a minute
  }
  return all;
}

/** Nearby stations, refreshed once a week (stations rarely change). */
function nearbyStations_() {
  var raw = prop_('FUEL_NEARBY');
  var saved = raw ? JSON.parse(raw) : null;
  if (saved && Date.now() - saved.at < 7 * 864e5) return saved.stations;
  var home = homeLatLng_();
  var stations = fuelBatches_('/api/v1/pfs').filter(function (s) {
    return s.location && !s.permanent_closure && !s.temporary_closure;
  }).map(function (s) {
    var lat = Number(s.location.latitude), lng = Number(s.location.longitude);
    return { id: s.node_id, name: s.brand_name || s.trading_name, area: s.location.city || s.location.postcode || '',
             miles: milesBetween_(home.lat, home.lng, lat, lng) };
  }).filter(function (s) { return s.miles <= CONFIG.FUEL_RADIUS_MILES; });
  setProp_('FUEL_NEARBY', JSON.stringify({ at: Date.now(), stations: stations }));
  return stations;
}

function getDiesel_() {
  if (!prop_('FUEL_CLIENT_ID')) return { missingKey: true };
  var near = nearbyStations_(), byId = {};
  near.forEach(function (s) { byId[s.id] = s; });
  var prices = fuelBatches_('/api/v1/pfs/fuel-prices');
  return { stations: cheapest_(prices, byId, CONFIG.FUEL_TYPE, CONFIG.FUEL_SHOW) };
}

/** Pure: cheapest N of one fuel type among known nearby stations. */
function cheapest_(prices, byId, fuelType, n) {
  var list = [];
  prices.forEach(function (p) {
    var s = byId[p.node_id];
    if (!s || !p.fuel_prices) return;
    p.fuel_prices.forEach(function (f) {
      if (f.fuel_type === fuelType && f.price) {
        list.push({ name: s.name, area: s.area, miles: Math.round(s.miles * 10) / 10, price: Number(f.price) });
      }
    });
  });
  list.sort(function (a, b) { return a.price - b.price || a.miles - b.miles; });
  return list.slice(0, n);
}

function homeLatLng_() {
  var raw = prop_('HOME_LATLNG');
  if (raw) return JSON.parse(raw);
  var v;
  if (CONFIG.HOME) {
    var loc = Maps.newGeocoder().setRegion('uk').geocode(CONFIG.HOME).results[0].geometry.location;
    v = { lat: loc.lat, lng: loc.lng };
  } else {
    v = { lat: CONFIG.PLACES[0].lat, lng: CONFIG.PLACES[0].lon };   // no HOME: use the first weather place
  }
  setProp_('HOME_LATLNG', JSON.stringify(v));
  return v;
}

function milesBetween_(lat1, lon1, lat2, lon2) {
  var R = 3958.8, toR = Math.PI / 180;
  var dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---------------------------------------------------------------- notices
/** Open items in a Google Tasks list called "Notices" (needs the Tasks service turned on). */
function getNotices_() {
  if (prop_('TODOIST_TOKEN')) {
    return todoistTasks_('Notices', 'TODOIST_PROJECT_ID')
      .map(function (t) { return String(t.content || '').trim(); }).filter(String).slice(0, 6);
  }
  // Without a Todoist token, fall back to the Google Tasks list called "Notices".
  if (typeof Tasks === 'undefined') return [];
  var lists = Tasks.Tasklists.list().items || [];
  var list = lists.filter(function (l) { return l.title.toLowerCase() === 'notices'; })[0];
  if (!list) return [];
  var items = Tasks.Tasks.list(list.id, { showCompleted: false, maxResults: 6 }).items || [];
  return items.map(function (t) { return t.title; }).filter(String);
}

/** Dinners: tasks in the Todoist project "Dinners", each due on the day it's for. Returns {'2026-11-19': 'Fajitas'}. */
function getDinners_() {
  if (!prop_('TODOIST_TOKEN')) return {};
  var out = {};
  todoistTasks_('Dinners', 'TODOIST_DINNERS_ID').forEach(function (t) {
    var day = t.due && t.due.date ? String(t.due.date).slice(0, 10) : null;
    var meal = String(t.content || '').trim();
    if (day && meal) out[day] = out[day] ? out[day] + ' · ' + meal : meal;
  });
  return out;
}

/** Open tasks in a Todoist project, looked up by name once and then remembered. */
function todoistTasks_(projectName, propKey) {
  var token = prop_('TODOIST_TOKEN');
  function get(path) {
    var res = UrlFetchApp.fetch('https://api.todoist.com/api/v1' + path,
      { headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
    if (res.getResponseCode() >= 300) throw new Error('Todoist HTTP ' + res.getResponseCode());
    var j = JSON.parse(res.getContentText());
    return Array.isArray(j) ? j : (j.results || []);
  }
  var pid = prop_(propKey);
  if (!pid) {
    var want = projectName.toLowerCase();
    var project = get('/projects?limit=200').filter(function (p) { return String(p.name).trim().toLowerCase() === want; })[0];
    if (!project) throw new Error('No Todoist project called "' + projectName + '"');
    pid = String(project.id);
    setProp_(propKey, pid);
  }
  return get('/tasks?project_id=' + encodeURIComponent(pid) + '&limit=50')
    .sort(function (x, y) { return (x.child_order || x.order || 0) - (y.child_order || y.order || 0); });
}

// ---------------------------------------------------------------- setup
/** Run once from the editor after filling in Script properties. */
function setup() {
  if (!prop_('BOARD_KEY')) setProp_('BOARD_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 20));
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'commuteWatch') ScriptApp.deleteTrigger(t);
  });
  if (CONFIG.WORK && !(CONFIG.MODULES && CONFIG.MODULES.commute === false)) {
    ScriptApp.newTrigger('commuteWatch').timeBased().everyMinutes(5).create();
  }
  if (!prop_('FUEL_RELAY_KEY')) setProp_('FUEL_RELAY_KEY', Utilities.getUuid().replace(/-/g, ''));
  Logger.log('Board key: ' + prop_('BOARD_KEY'));
  Logger.log('After deploying, your board link is: <your web app URL>?k=' + prop_('BOARD_KEY'));
  Logger.log('Only if you use the UK fuel relay: set RELAY_KEY in Supabase to ' + prop_('FUEL_RELAY_KEY'));
}

/** Run from the editor to check every feed and see any problems in the log. */
function testEverything() {
  var d = getBoardData(prop_('BOARD_KEY'));
  Logger.log(JSON.stringify(d, null, 2).slice(0, 8000));
}

/** Sends a sample alert so the commuter can check notifications reach their phone. */
function testCommuteAlert() {
  var ok = sendNtfy_(prop_('NTFY_TOPIC'), 'Test: new route to work',
    'This is a test from the family board. Tap to open directions.', mapsLink_(CONFIG.WORK, null));
  Logger.log(ok ? 'Sent' : 'Not sent: check NTFY_TOPIC and NTFY_TOKEN');
}

// ---------------------------------------------------------------- helpers
function cached_(key, seconds, fn) {
  var c = CacheService.getScriptCache(), hit = c.get(key);
  if (hit) return JSON.parse(hit);
  var v = fn();
  var s = JSON.stringify(v);
  if (s.length < 95000) c.put(key, s, seconds);
  return v;
}
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function setProp_(k, v) { PropertiesService.getScriptProperties().setProperty(k, v); }
function fmt_(d, pattern) { return Utilities.formatDate(d, CONFIG.TIMEZONE, pattern); }
function parseDate_(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
function isoDay_(d) { var n = Number(Utilities.formatDate(d, CONFIG.TIMEZONE, 'u')); return n; }
function startOfDay_(d) {
  // The project time zone is Europe/London (appsscript.json), so this is local midnight.
  var p = fmt_(d, 'yyyy-M-d').split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

// ---------------------------------------------------------------- debugging helpers
// Run these from the editor when something isn't showing. They only write to the log.

/** Which calendars can the board see, and what's in the commuter's calendar today and this week? */
function testCalendars() {
  Logger.log('Calendars this account can see: ' + CalendarApp.getAllCalendars().map(function (c) { return c.getName(); }).join(' | '));
  var start = new Date(); start.setHours(0, 0, 0, 0);
  var end = new Date(start.getTime() + 7 * 864e5);
  [['owner', CalendarApp.getDefaultCalendar()], ['commuter', findCalendar_(CONFIG.COMMUTER_CALENDAR)],
   ['family', findCalendar_(CONFIG.FAMILY_CALENDAR)]].forEach(function (pair) {
    var who = pair[0], cal = pair[1];
    if (!cal) { Logger.log(who + ': not set or NOT FOUND'); return; }
    var evs = cal.getEvents(start, end);
    Logger.log(who + ': "' + cal.getName() + '", ' + evs.length + ' events from midnight today to 7 days ahead');
    evs.slice(0, 5).forEach(function (e) { Logger.log('   ' + e.getStartTime() + '  ' + (e.getTitle() || '(no title)')); });
  });
}

/** Live fuel prices near you, with when each station last changed its price. Takes 30-40 seconds. */
function testFuel() {
  var near = nearbyStations_(), byId = {};
  near.forEach(function (s) { byId[s.id] = s; });
  Logger.log('Nearby stations known: ' + near.length);
  var rows = [];
  fuelBatches_('/api/v1/pfs/fuel-prices').forEach(function (p) {
    var s = byId[p.node_id];
    if (!s || !p.fuel_prices) return;
    p.fuel_prices.forEach(function (f) {
      if (f.fuel_type !== CONFIG.FUEL_TYPE) return;
      rows.push({ price: Number(f.price), text: f.price + 'p  ' + s.name + ' (' + (Math.round(s.miles * 10) / 10) + ' mi)  last changed ' + (f.price_last_updated || '?') });
    });
  });
  rows.sort(function (a, b) { return a.price - b.price; });
  rows.slice(0, 8).forEach(function (r) { Logger.log(r.text); });
  Logger.log('Board currently shows: ' + JSON.stringify(cached_('fuel', 1800, getDiesel_)));
}

/** What notes and dinners the board can see right now (skips the board's saved copy). */
function testNotes() {
  Logger.log('Todoist token set: ' + !!prop_('TODOIST_TOKEN'));
  Logger.log('Notes: ' + JSON.stringify(getNotices_()));
  Logger.log('Dinners: ' + JSON.stringify(getDinners_()));
}
