import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Grace added to the last heartbeat: heartbeats land every 30s. */
const HEARTBEAT_GRACE_S = 45;
/** Client duration may exceed the server figure by at most this before we clamp + flag. */
const DEVIATION_TOLERANCE_S = 180;
/** No single session can legitimately exceed this. */
const MAX_SESSION_S = 3 * 60 * 60 + 300;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || '');
    const clientDuration = Number.isFinite(body.clientDuration) ? Math.floor(body.clientDuration) : null;
    const clientFlagged = body.clientFlagged === true;
    if (!sessionId) return json({ error: 'sessionId required' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: session } = await supabase
      .from('study_sessions')
      .select('id, started_at, last_heartbeat, status')
      .eq('id', sessionId)
      .maybeSingle();
    if (!session) return json({ ok: true, note: 'not found' });
    if (session.status !== 'active') return json({ ok: true, note: 'already ended' });

    const now = Date.now();
    const started = new Date(session.started_at).getTime();
    const lastBeat = session.last_heartbeat ? new Date(session.last_heartbeat).getTime() : started;
    // Server truth: from start until the last proven-alive heartbeat (+grace), never beyond now.
    const endAt = Math.min(now, Math.max(started, lastBeat + HEARTBEAT_GRACE_S * 1000));
    let duration = Math.max(0, Math.floor((endAt - started) / 1000));

    let flagged = clientFlagged;
    const reasons: string[] = [];
    if (clientFlagged) reasons.push('client detected an impossible clock jump');

    if (clientDuration !== null && clientDuration - duration > DEVIATION_TOLERANCE_S) {
      flagged = true;
      reasons.push(`client reported ${clientDuration}s vs server ${duration}s`);
    }
    if (duration > MAX_SESSION_S) {
      duration = MAX_SESSION_S;
      flagged = true;
      reasons.push('duration exceeded the 3h session cap');
    }

    await supabase
      .from('study_sessions')
      .update({
        status: 'completed',
        ended_at: new Date(endAt).toISOString(),
        duration_seconds: duration,
        flagged,
        flag_reason: flagged ? reasons.join('; ') : null,
      })
      .eq('id', sessionId);

    return json({ ok: true, duration });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
