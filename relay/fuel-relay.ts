// Family Dashboard UK fuel relay (Supabase Edge Function). Fuel Finder only answers UK addresses, so the board's
// Google script sends its Fuel Finder calls here; this runs in London (eu-west-2).
// It only forwards to www.fuel-finder.service.gov.uk/api/v1/ and needs the relay key.
// Set RELAY_KEY as a secret: Supabase > Edge Functions > Secrets (same value as FUEL_RELAY_KEY in Apps Script).
const RELAY_KEY = Deno.env.get('RELAY_KEY') || '';
const FUEL = 'https://www.fuel-finder.service.gov.uk';

Deno.serve(async (req) => {
  if (!RELAY_KEY || req.headers.get('x-relay-key') !== RELAY_KEY) return new Response('Not allowed', { status: 403 });
  const p = new URL(req.url).searchParams.get('p') || '';
  if (!p.startsWith('/api/v1/')) return new Response('Bad path', { status: 400 });

  const headers = new Headers();
  const auth = req.headers.get('x-ff-auth'), accept = req.headers.get('x-ff-accept'), type = req.headers.get('content-type');
  if (auth) headers.set('Authorization', auth);
  headers.set('Accept', accept || 'application/json');
  if (type && req.method !== 'GET') headers.set('Content-Type', type);

  const res = await fetch(FUEL + p, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json', 'x-relay-region': Deno.env.get('SB_REGION') || '' },
  });
});
