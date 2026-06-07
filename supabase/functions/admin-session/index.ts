import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { token } = await req.json();
    if (!token) return jr({ valid: false }, 200);
    const { data } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!data) return jr({ valid: false }, 200);
    const newExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await supabase.from('admin_sessions').update({ expires_at: newExpiry, last_seen_at: new Date().toISOString() }).eq('id', data.id);
    return jr({ valid: true, expires_at: newExpiry }, 200);
  } catch (e) {
    return jr({ valid: false, error: String((e as Error).message ?? e) }, 500);
  }
});

function jr(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}