import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || '');
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'sessionId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    // Read session and compute server-side duration (ignore any client value)
    const { data: session } = await supabase
      .from('study_sessions')
      .select('id, started_at, last_heartbeat, status')
      .eq('id', sessionId)
      .maybeSingle();
    if (!session) {
      return new Response(JSON.stringify({ ok: true, note: 'not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (session.status !== 'active') {
      return new Response(JSON.stringify({ ok: true, note: 'already ended' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const started = new Date(session.started_at).getTime();
    const endAt = new Date(session.last_heartbeat || new Date().toISOString()).getTime();
    const duration = Math.max(0, Math.floor((endAt - started) / 1000));
    await supabase
      .from('study_sessions')
      .update({
        status: 'completed',
        ended_at: new Date(endAt).toISOString(),
        duration_seconds: duration,
      })
      .eq('id', sessionId);
    return new Response(JSON.stringify({ ok: true, duration }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});