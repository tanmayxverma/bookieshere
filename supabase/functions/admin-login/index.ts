import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function randomToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { password1, password2, device_id } = await req.json();
    if (!password1 || !password2) {
      return new Response(JSON.stringify({ error: 'missing credentials' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Throttle: 5 failures per 15 min per device
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: failCount } = await supabase
      .from('admin_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('success', false)
      .eq('device_id', device_id ?? 'unknown')
      .gte('attempted_at', since);
    if ((failCount ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: 'too many attempts, try later' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Compare with env-stored passwords (or default configured passwords)
    const env1 = Deno.env.get('ADMIN_PASSWORD_1') || 'Tanmay12#';
    const env2 = Deno.env.get('ADMIN_PASSWORD_2') || '9070959189';
    const ok = timingSafeEq(password1, env1) && timingSafeEq(password2, env2);

    await supabase.from('admin_login_attempts').insert({ device_id: device_id ?? 'unknown', success: ok });

    if (!ok) {
      return new Response(JSON.stringify({ error: 'invalid credentials' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = randomToken();
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await supabase.from('admin_sessions').insert({ token, device_id, expires_at });
    await supabase.from('admin_logs').insert({ action: 'login', metadata: { device_id } });
    return new Response(JSON.stringify({ token, expires_at }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}